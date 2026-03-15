import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET schedule for a business
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listing_id');

        if (!listingId) {
            return NextResponse.json(
                { success: false, error: 'listing_id required' },
                { status: 400 }
            );
        }

        const schedules = await sql`
            SELECT * FROM business_schedules 
            WHERE listing_id = ${parseInt(listingId)}
            ORDER BY day_of_week
        `;

        return NextResponse.json({ success: true, data: schedules });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST create/update schedule
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            listing_id, 
            day_of_week, 
            open_time, 
            close_time, 
            is_open,
            break_start,
            break_end
        } = body;

        if (!listing_id || day_of_week === undefined) {
            return NextResponse.json(
                { success: false, error: 'listing_id and day_of_week required' },
                { status: 400 }
            );
        }

        // Upsert schedule
        const schedule = await sql`
            INSERT INTO business_schedules (
                listing_id, day_of_week, open_time, close_time, is_open, break_start, break_end
            ) VALUES (
                ${parseInt(listing_id)},
                ${parseInt(day_of_week)},
                ${open_time || '09:00'},
                ${close_time || '17:00'},
                ${is_open !== undefined ? is_open : true},
                ${break_start || null},
                ${break_end || null}
            )
            ON CONFLICT (listing_id, day_of_week) 
            DO UPDATE SET
                open_time = COALESCE(${open_time}, business_schedules.open_time),
                close_time = COALESCE(${close_time}, business_schedules.close_time),
                is_open = COALESCE(${is_open}, business_schedules.is_open),
                break_start = COALESCE(${break_start}, business_schedules.break_start),
                break_end = COALESCE(${break_end}, business_schedules.break_end),
                updated_at = NOW()
            RETURNING *
        `;

        return NextResponse.json({ success: true, data: schedule[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// GET available time slots for a specific date
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { listing_id, date } = body;

        if (!listing_id || !date) {
            return NextResponse.json(
                { success: false, error: 'listing_id and date required' },
                { status: 400 }
            );
        }

        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();

        // Get business schedule for that day
        const schedules = await sql`
            SELECT * FROM business_schedules 
            WHERE listing_id = ${parseInt(listing_id)} 
            AND day_of_week = ${dayOfWeek}
            AND is_open = true
        `;

        if (schedules.length === 0) {
            return NextResponse.json({ success: true, data: { available: false, slots: [] } });
        }

        const schedule = schedules[0];

        // Get existing appointments for that date
        const appointments = await sql`
            SELECT start_time, end_time FROM appointments 
            WHERE listing_id = ${parseInt(listing_id)}
            AND appointment_date = ${date}
            AND status NOT IN ('cancelled', 'no-show')
        `;

        // Generate available slots (simplified - 30 min intervals)
        const slots = [];
        const openHour = parseInt(schedule.open_time.split(':')[0]);
        const closeHour = parseInt(schedule.close_time.split(':')[0]);
        
        for (let hour = openHour; hour < closeHour; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const slotTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                const isBooked = appointments.some(apt => apt.start_time === slotTime);
                
                if (!isBooked) {
                    slots.push(slotTime);
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            data: { 
                available: slots.length > 0,
                slots,
                schedule: {
                    open: schedule.open_time,
                    close: schedule.close_time,
                    break_start: schedule.break_start,
                    break_end: schedule.break_end
                }
            } 
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
