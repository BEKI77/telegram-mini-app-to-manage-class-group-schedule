import { db } from '@/db';
import { announcements, userRoles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
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
        console.error('[Announcements API] Role verification error:', e);
        return { authorized: false, topicId: null, userId: null };
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    const { start_param: topicId } = authHeader ? parseInitData(authHeader) : { start_param: null };

    if (!topicId) return NextResponse.json([]);

    try {
        const data = await db.select()
            .from(announcements)
            .where(eq(announcements.topicId, topicId))
            .orderBy(desc(announcements.createdAt));

        return NextResponse.json(data);
    } catch (e) {
        console.error("Announcements Fetch Error", e);
        return NextResponse.json([]);
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
        const { content, courseId } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const [newAnnouncement] = await db.insert(announcements).values({
            topicId,
            content,
            courseId: courseId || null,
        }).returning();

        return NextResponse.json(newAnnouncement);
    } catch (e) {
        console.error('[Announcements API] POST error:', e);
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    const { authorized, topicId } = await verifyRepresentative(authHeader);

    if (!authorized || !topicId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, content, courseId } = body;

        if (!id || !content) {
            return NextResponse.json({ error: 'ID and content are required' }, { status: 400 });
        }

        // Verify the announcement belongs to this topic
        const existing = await db.select()
            .from(announcements)
            .where(and(eq(announcements.id, id), eq(announcements.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Announcement not found or unauthorized' }, { status: 404 });
        }

        const [updatedAnnouncement] = await db.update(announcements)
            .set({
                content,
                courseId: courseId || null,
            })
            .where(eq(announcements.id, id))
            .returning();

        return NextResponse.json(updatedAnnouncement);
    } catch (e) {
        console.error('[Announcements API] PUT error:', e);
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    const { authorized, topicId } = await verifyRepresentative(authHeader);

    if (!authorized || !topicId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
        }

        // Verify the announcement belongs to this topic
        const existing = await db.select()
            .from(announcements)
            .where(and(eq(announcements.id, parseInt(id)), eq(announcements.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Announcement not found or unauthorized' }, { status: 404 });
        }

        await db.delete(announcements).where(eq(announcements.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[Announcements API] DELETE error:', e);
        return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }
}
