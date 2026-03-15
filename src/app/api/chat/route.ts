import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, listing_id, user_name, user_email, user_phone } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Messages array is required' },
                { status: 400 }
            );
        }

        if (!listing_id) {
            return NextResponse.json(
                { success: false, error: 'listing_id is required' },
                { status: 400 }
            );
        }

        // Fetch business context from database
        const listings = await sql`
            SELECT name, description, category, location_city, services, 
                   contact_email, phone, website, business_hours
            FROM listings 
            WHERE id = ${parseInt(listing_id)}
            LIMIT 1
        `;

        if (listings.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Business not found' },
                { status: 404 }
            );
        }

        const business = listings[0];

        // Check if this is a lead capture message
        const lastMessage = messages[messages.length - 1].content.toLowerCase();
        const isLeadIntent = 
            lastMessage.includes('contact') || 
            lastMessage.includes('call me') ||
            lastMessage.includes('interested') ||
            lastMessage.includes('quote') ||
            lastMessage.includes('price') ||
            lastMessage.includes('cost') ||
            lastMessage.includes('hire') ||
            lastMessage.includes('book') ||
            lastMessage.includes('appointment');

        // If lead intent and we have user info, save to leads table
        if (isLeadIntent && (user_name || user_email)) {
            try {
                await sql`
                    INSERT INTO leads (listing_id, name, email, phone, message, status, created_at)
                    VALUES (
                        ${parseInt(listing_id)}, 
                        ${user_name || 'Anonymous'}, 
                        ${user_email || null}, 
                        ${user_phone || null},
                        ${messages.map(m => m.content).join(' ')},
                        'new',
                        NOW()
                    )
                `;
            } catch (e) {
                console.error('Failed to save lead:', e);
            }
        }

        // Build system prompt with business context
        const systemPrompt = `You are a friendly, helpful AI assistant for ${business.name}, a ${business.category} business located in ${business.location_city}. 

BUSINESS INFORMATION:
- Name: ${business.name}
- Category: ${business.category}
- Description: ${business.description}
- Location: ${business.location_city}
- Phone: ${business.phone || 'Not provided'}
- Website: ${business.website || 'Not provided'}
- Email: ${business.contact_email || 'Not provided'}
- Services: ${Array.isArray(business.services) ? business.services.join(', ') : 'Not specified'}

BOOKING CAPABILITIES:
- Customers can book appointments directly through you
- You can help them find available time slots
- You can create bookings with their name, email, and phone
- Support both in-person and virtual appointments

YOUR ROLE:
- Answer questions about the business professionally and accurately
- Help customers with inquiries about services, pricing, availability
- Be friendly, concise, and helpful
- If you don't know something, politely say you don't have that information and suggest they contact the business directly
- Never make up information about the business
- Keep responses under 3 sentences unless more detail is specifically requested
- ENCOURAGE users to book appointments or leave their contact info

BOOKING FLOW:
1. If user wants to book, ask what service they're interested in
2. Ask for their preferred date and time
3. Collect their name, email, and phone number
4. Confirm the booking details
5. Let them know the business will confirm shortly

TONE:
- Warm, professional, and conversational
- Use emojis sparingly (max 1 per message)
- Sound like a knowledgeable team member of the business

LEAD CAPTURE:
- If the user seems interested, politely ask for their name and email/phone
- Example: "I'd love to help you get started! Could you share your name and email so our team can follow up?"
- Reassure them that a team member will contact them soon

SPECIAL ACTIONS (respond with these EXACT phrases when appropriate):
- If user wants to book and you have their info, respond with: "BOOKING_REQUEST: {service, date, time, name, email, phone}"
- If user asks about availability, respond with: "AVAILABILITY_CHECK: {date}"
- If user confirms booking, respond with: "BOOKING_CONFIRMED: Thank you! Your appointment is scheduled."`;

        // Check if OpenAI API key is configured
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            // Fallback response when API key not configured
            return NextResponse.json({
                success: true,
                data: {
                    role: 'assistant',
                    content: `Hi! I'm the AI assistant for ${business.name}. We're currently setting up our AI service. In the meantime, feel free to contact us at ${business.phone || business.contact_email || 'our office'} for any questions!`
                }
            });
        }

        // Call OpenAI API
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.slice(-10) // Last 10 messages for context
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!openaiRes.ok) {
            const errorData = await openaiRes.json().catch(() => ({}));
            console.error('OpenAI API error:', errorData);
            throw new Error(errorData.error?.message || 'Failed to get AI response');
        }

        const openaiData = await openaiRes.json();
        let aiMessage = openaiData.choices[0].message.content;

        // Check if AI is requesting a booking
        let bookingData = null;
        if (aiMessage.startsWith('BOOKING_REQUEST:')) {
            try {
                const bookingStr = aiMessage.replace('BOOKING_REQUEST:', '').trim();
                bookingData = JSON.parse(bookingStr);
                
                // Create the booking in database
                const appointment = await sql`
                    INSERT INTO appointments (
                        listing_id,
                        customer_name,
                        customer_email,
                        customer_phone,
                        appointment_date,
                        start_time,
                        status,
                        notes,
                        created_at
                    ) VALUES (
                        ${parseInt(listing_id)},
                        ${bookingData.name},
                        ${bookingData.email},
                        ${bookingData.phone || null},
                        ${bookingData.date},
                        ${bookingData.time},
                        'pending',
                        ${bookingData.service || 'General appointment'},
                        NOW()
                    )
                    RETURNING *
                `;
                
                aiMessage = "BOOKING_CONFIRMED: Thank you! Your appointment is scheduled. We'll send you a confirmation email shortly! 🎉";
            } catch (e) {
                console.error('Failed to create booking:', e);
                aiMessage = "I encountered an error creating your booking. Please call us directly to schedule. Sorry for the inconvenience!";
            }
        }

        // Save conversation to database
        try {
            await sql`
                INSERT INTO chat_conversations (listing_id, user_message, ai_response, created_at)
                VALUES (${parseInt(listing_id)}, ${messages[messages.length - 1].content}, ${aiMessage}, NOW())
            `.catch(() => { /* Ignore if table doesn't exist yet */ });
        } catch (e) {
            // Silently fail - conversation logging is optional
        }

        return NextResponse.json({
            success: true,
            data: {
                role: 'assistant',
                content: aiMessage
            },
            booking: bookingData
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Chat API error:', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
