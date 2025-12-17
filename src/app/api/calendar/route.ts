import { db } from '@/db';
import { academicCalendars, userRoles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { parseInitData } from '@/lib/telegram-auth';

// Helper to verify representative role
async function verifyRepresentative(authHeader: string | null) {
    if (!authHeader) return { authorized: false, topicId: null, userId: null };
    
    const { user, start_param } = parseInitData(authHeader);
    if (!user || !start_param) return { authorized: false, topicId: null, userId: null };

    try {
        const roleEntry = await db.select()
            .from(userRoles)
            .where(and(
                eq(userRoles.userId, user.id.toString()),
                eq(userRoles.topicId, start_param)
            ))
            .limit(1);

        const isRepresentative = roleEntry.length > 0 && roleEntry[0].role === 'representative';
        return { authorized: isRepresentative, topicId: start_param, userId: user.id.toString() };
    } catch (e) {
        console.error('[Calendar API] Role verification error:', e);
        return { authorized: false, topicId: null, userId: null };
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    const { start_param: topicId } = authHeader ? parseInitData(authHeader) : { start_param: null };

    if (!topicId) {
        return NextResponse.json({ url: null });
    }

    try {
        const calendar = await db.select()
            .from(academicCalendars)
            .where(eq(academicCalendars.topicId, topicId))
            .limit(1);

        return NextResponse.json(calendar[0] || { url: null });
    } catch (e) {
        console.error('[Calendar API] GET error:', e);
        return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    const { authorized, topicId } = await verifyRepresentative(authHeader);

    if (!authorized || !topicId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Check if exists
        const existing = await db.select()
            .from(academicCalendars)
            .where(eq(academicCalendars.topicId, topicId))
            .limit(1);

        let result;
        if (existing.length > 0) {
            [result] = await db.update(academicCalendars)
                .set({ url, updatedAt: new Date() })
                .where(eq(academicCalendars.id, existing[0].id))
                .returning();
        } else {
            [result] = await db.insert(academicCalendars)
                .values({
                    topicId,
                    url,
                })
                .returning();
        }

        return NextResponse.json(result);
    } catch (e) {
        console.error('[Calendar API] POST error:', e);
        return NextResponse.json({ error: 'Failed to save calendar' }, { status: 500 });
    }
}
