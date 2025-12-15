import { db } from '@/db';
import { courses, userRoles } from '@/db/schema';
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
        console.error('[Courses API] Role verification error:', e);
        return { authorized: false, topicId: null, userId: null };
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    const { start_param: topicId } = authHeader ? parseInitData(authHeader) : { start_param: null };

    if (!topicId) {
        return NextResponse.json([]);
    }

    try {
        const data = await db.select()
            .from(courses)
            .where(eq(courses.topicId, topicId));
        
        return NextResponse.json(data);
    } catch (e) {
        console.error('[Courses API] GET error:', e);
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
        const { name, code, instructor } = body;

        if (!name) {
            return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
        }

        const [newCourse] = await db.insert(courses).values({
            topicId,
            name,
            code: code || null,
            instructor: instructor || null,
        }).returning();

        return NextResponse.json(newCourse);
    } catch (e) {
        console.error('[Courses API] POST error:', e);
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
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
        const { id, name, code, instructor } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'Course ID and name are required' }, { status: 400 });
        }

        // Verify the course belongs to this topic
        const existing = await db.select()
            .from(courses)
            .where(and(eq(courses.id, id), eq(courses.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
        }

        const [updatedCourse] = await db.update(courses)
            .set({
                name,
                code: code || null,
                instructor: instructor || null,
            })
            .where(eq(courses.id, id))
            .returning();

        return NextResponse.json(updatedCourse);
    } catch (e) {
        console.error('[Courses API] PUT error:', e);
        return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
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
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
        }

        // Verify the course belongs to this topic
        const existing = await db.select()
            .from(courses)
            .where(and(eq(courses.id, parseInt(id)), eq(courses.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
        }

        await db.delete(courses).where(eq(courses.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[Courses API] DELETE error:', e);
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}
