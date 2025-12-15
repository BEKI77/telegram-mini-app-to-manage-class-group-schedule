import { db } from '@/db';
import { schedules, courses, userRoles } from '@/db/schema';
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
        console.error('[Schedule API] Role verification error:', e);
        return { authorized: false, topicId: null, userId: null };
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const authHeader = request.headers.get('X-Telegram-Init-Data');

    // Parse initData to get context
    const { start_param: topicId } = authHeader ? parseInitData(authHeader) : { start_param: null };

    if (!topicId) {
         // Without context, we can't show a valid schedule for a specific class
         // For security/privacy, we probably shouldn't show anything, or just empty
         return NextResponse.json([]);
    }

    try {
        let query = db.select({
            id: schedules.id,
            dayOfWeek: schedules.dayOfWeek,
            startTime: schedules.startTime,
            endTime: schedules.endTime,
            location: schedules.location,
            courseName: courses.name,
            code: courses.code,
            instructor: courses.instructor,
            courseId: courses.id,
        })
        .from(schedules)
        .innerJoin(courses, eq(schedules.courseId, courses.id))
        .$dynamic();

        if (day) {
            query = query.where(and(eq(courses.topicId, topicId), eq(schedules.dayOfWeek, parseInt(day))));
        } else {
            query = query.where(eq(courses.topicId, topicId));
        }

        const data = await query.orderBy(schedules.dayOfWeek, schedules.startTime);

        return NextResponse.json(data);
    } catch (e) {
        console.error("Schedule Fetch Error", e);
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
        const { courseId, dayOfWeek, startTime, endTime, location } = body;

        if (!courseId || dayOfWeek === undefined || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify the course belongs to this topic
        const course = await db.select()
            .from(courses)
            .where(and(eq(courses.id, courseId), eq(courses.topicId, topicId)))
            .limit(1);

        if (course.length === 0) {
            return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
        }

        const [newSchedule] = await db.insert(schedules).values({
            courseId,
            dayOfWeek,
            startTime,
            endTime,
            location: location || null,
        }).returning();

        return NextResponse.json(newSchedule);
    } catch (e) {
        console.error('[Schedule API] POST error:', e);
        return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
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
        const { id, courseId, dayOfWeek, startTime, endTime, location } = body;

        if (!id || !courseId || dayOfWeek === undefined || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify the course belongs to this topic
        const course = await db.select()
            .from(courses)
            .where(and(eq(courses.id, courseId), eq(courses.topicId, topicId)))
            .limit(1);

        if (course.length === 0) {
            return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
        }

        // Verify the schedule exists and belongs to a course in this topic
        const existing = await db.select()
            .from(schedules)
            .innerJoin(courses, eq(schedules.courseId, courses.id))
            .where(and(eq(schedules.id, id), eq(courses.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Schedule not found or unauthorized' }, { status: 404 });
        }

        const [updatedSchedule] = await db.update(schedules)
            .set({
                courseId,
                dayOfWeek,
                startTime,
                endTime,
                location: location || null,
            })
            .where(eq(schedules.id, id))
            .returning();

        return NextResponse.json(updatedSchedule);
    } catch (e) {
        console.error('[Schedule API] PUT error:', e);
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
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
            return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
        }

        // Verify the schedule exists and belongs to a course in this topic
        const existing = await db.select()
            .from(schedules)
            .innerJoin(courses, eq(schedules.courseId, courses.id))
            .where(and(eq(schedules.id, parseInt(id)), eq(courses.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Schedule not found or unauthorized' }, { status: 404 });
        }

        await db.delete(schedules).where(eq(schedules.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[Schedule API] DELETE error:', e);
        return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
    }
}
