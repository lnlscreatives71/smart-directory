import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import {
    email_booking_confirmation,
    email_booking_business_notification,
    email_booking_status_update,
} from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

// GET appointments for a business
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listing_id');
        const date = searchParams.get('date');
        const status = searchParams.get('status');

        if (!listingId) {
            return NextResponse.json(
                { success: false, error: 'listing_id required' },
                { status: 400 }
            );
        }

        let query = sql`
            SELECT a.*, s.name as service_name, s.duration_minutes, s.price
            FROM appointments a
            LEFT JOIN business_services s ON a.service_id = s.id
            WHERE a.listing_id = ${parseInt(listingId)}
        `;

        if (date) {
            query = sql`${query} AND a.appointment_date = ${date}`;
        }

        if (status) {
            query = sql`${query} AND a.status = ${status}`;
        }

        query = sql`${query} ORDER BY a.appointment_date DESC, a.start_time DESC`;

        const appointments = await query;

        return NextResponse.json({ success: true, data: appointments });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST create new appointment (public booking)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            listing_id,
            service_id,
            customer_name,
            customer_email,
            customer_phone,
            appointment_date,
            start_time,
            end_time,
            notes
        } = body;

        // Validate required fields
        if (!listing_id || !customer_name || !customer_email || !appointment_date || !start_time) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for conflicts
        const conflicts = await sql`
            SELECT id FROM appointments 
            WHERE listing_id = ${parseInt(listing_id)}
            AND appointment_date = ${appointment_date}
            AND start_time = ${start_time}
            AND status NOT IN ('cancelled', 'no-show')
        `;

        if (conflicts.length > 0) {
            return NextResponse.json(
                { success: false, error: 'This time slot is already booked' },
                { status: 409 }
            );
        }

        // Get service duration if not provided
        let calculatedEndTime = end_time;
        if (!calculatedEndTime && service_id) {
            const service = await sql`SELECT duration_minutes FROM business_services WHERE id = ${parseInt(service_id)}`;
            if (service.length > 0) {
                const [hours, mins] = start_time.split(':').map(Number);
                const endMins = mins + service[0].duration_minutes;
                calculatedEndTime = `${hours}:${endMins.toString().padStart(2, '0')}`;
            }
        }

        // Create appointment
        const appointment = await sql`
            INSERT INTO appointments (
                listing_id,
                service_id,
                customer_name,
                customer_email,
                customer_phone,
                appointment_date,
                start_time,
                end_time,
                notes,
                status
            ) VALUES (
                ${parseInt(listing_id)},
                ${service_id ? parseInt(service_id) : null},
                ${customer_name},
                ${customer_email},
                ${customer_phone || null},
                ${appointment_date},
                ${start_time},
                ${calculatedEndTime || null},
                ${notes || null},
                'pending'
            )
            RETURNING *
        `;

        // Fetch listing info for email context
        const listing = await sql`
            SELECT name, contact_email FROM listings WHERE id = ${parseInt(listing_id)}
        `;
        const businessName = listing[0]?.name ?? 'the business';
        const businessEmail = listing[0]?.contact_email as string | null;

        // Fetch service name if service_id provided
        let resolvedServiceName: string | null = null;
        if (service_id) {
            const svc = await sql`SELECT name FROM business_services WHERE id = ${parseInt(service_id)}`;
            resolvedServiceName = svc[0]?.name ?? null;
        }

        const appt = appointment[0];

        // Send confirmation to customer (fire-and-forget)
        sendEmail({
            to: customer_email,
            subject: `Booking Confirmed — ${resolvedServiceName ?? 'Appointment'} at ${businessName}`,
            html: email_booking_confirmation({
                customerName: customer_name,
                businessName,
                serviceName: resolvedServiceName,
                appointmentDate: appointment_date,
                startTime: start_time,
                endTime: appt.end_time,
                notes: notes ?? null,
            }),
        }).catch((err) => console.error('[Booking] Failed to send customer confirmation:', err));

        // Send notification to business (fire-and-forget)
        if (businessEmail) {
            sendEmail({
                to: businessEmail,
                subject: `New Booking: ${customer_name} — ${appointment_date} at ${start_time}`,
                html: email_booking_business_notification({
                    businessName,
                    customerName: customer_name,
                    customerEmail: customer_email,
                    customerPhone: customer_phone ?? null,
                    serviceName: resolvedServiceName,
                    appointmentDate: appointment_date,
                    startTime: start_time,
                    endTime: appt.end_time,
                    notes: notes ?? null,
                }),
                replyTo: customer_email,
            }).catch((err) => console.error('[Booking] Failed to send business notification:', err));
        }

        return NextResponse.json({ success: true, data: appt });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// PUT update appointment status
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            id, 
            status, 
            internal_notes,
            start_time,
            end_time,
            appointment_date
        } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id required' },
                { status: 400 }
            );
        }

        const appointment = await sql`
            UPDATE appointments SET
                status = ${status || status},
                internal_notes = ${internal_notes || null},
                start_time = ${start_time || null},
                end_time = ${end_time || null},
                appointment_date = ${appointment_date || null},
                updated_at = NOW()
            WHERE id = ${parseInt(id)}
            RETURNING *
        `;

        if (appointment.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Appointment not found' },
                { status: 404 }
            );
        }

        // Send status update email to customer when status changes
        const updatedAppt = appointment[0];
        const notifiableStatuses = ['confirmed', 'cancelled', 'completed', 'no-show'];
        if (status && notifiableStatuses.includes(status) && updatedAppt.customer_email) {
            // Fetch listing name for the email
            const listingRow = await sql`SELECT name FROM listings WHERE id = ${updatedAppt.listing_id}`;
            const bName = listingRow[0]?.name ?? 'the business';
            sendEmail({
                to: updatedAppt.customer_email as string,
                subject: `Appointment Update — ${bName}`,
                html: email_booking_status_update({
                    customerName: updatedAppt.customer_name as string,
                    businessName: bName,
                    status,
                    appointmentDate: updatedAppt.appointment_date as string,
                    startTime: updatedAppt.start_time as string,
                }),
            }).catch((err) => console.error('[Booking] Failed to send status update email:', err));
        }

        return NextResponse.json({ success: true, data: updatedAppt });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// DELETE/cancel appointment
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id required' },
                { status: 400 }
            );
        }

        // Soft delete - mark as cancelled
        await sql`
            UPDATE appointments 
            SET status = 'cancelled', updated_at = NOW() 
            WHERE id = ${parseInt(id)}
        `;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
