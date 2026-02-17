import { NextResponse } from 'next/server';
import { getGoogleCalendarEvents } from '@/lib/googleCalendar';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin') || undefined;
    const timeMax = searchParams.get('timeMax') || undefined;

    try {
        const events = await getGoogleCalendarEvents(timeMin, timeMax);
        return NextResponse.json(events);
    } catch (error: any) {
        console.error('API Error fetching Google Calendar events:', error);
        return NextResponse.json({
            error: 'Failed to fetch calendar events',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
