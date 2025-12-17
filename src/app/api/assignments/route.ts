import { db } from '@/db';
import { assignments, courses, userRoles } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
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
        console.error('[Assignments API] Role verification error:', e);
        return { authorized: false, topicId: null, userId: null };
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    const { start_param: topicId } = authHeader ? parseInitData(authHeader) : { start_param: null };

    if (!topicId) {
        return NextResponse.json([]);
    }

    try {
        const baseQuery = db.select({
            id: assignments.id,
            title: assignments.title,
            description: assignments.description,
            dueDate: assignments.dueDate,
            courseName: courses.name,
            courseId: courses.id,
            status: assignments.status,
            attachmentUrl: assignments.attachmentUrl
        })
        .from(assignments)
        .innerJoin(courses, eq(assignments.courseId, courses.id));

        if (id) {
            // Fetch single assignment
            const assignment = await baseQuery.where(and(eq(courses.topicId, topicId), eq(assignments.id, parseInt(id))));
            if (assignment.length === 0) {
                 return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            return NextResponse.json(assignment[0]);
        }

        const allAssignments = await baseQuery.where(eq(courses.topicId, topicId)).orderBy(asc(assignments.dueDate));
        
        let result = allAssignments;
        
        if (status === 'upcoming') {
            result = allAssignments.filter(a => a.status === 'upcoming');
        } else if (status === 'past') {
             result = allAssignments.filter(a => a.status !== 'upcoming');
        }

        return NextResponse.json(result);

    } catch (e) {
        console.error('[Assignments API] GET error:', e);
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
        const { courseId, title, description, dueDate, attachmentUrl, status } = body;

        if (!courseId || !title || !dueDate) {
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

        const [newAssignment] = await db.insert(assignments).values({
            courseId,
            title,
            description: description || null,
            dueDate: new Date(dueDate),
            attachmentUrl: attachmentUrl || null,
            status: status || 'upcoming',
        }).returning();

        return NextResponse.json(newAssignment);
    } catch (e) {
        console.error('[Assignments API] POST error:', e);
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
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
        const { id, courseId, title, description, dueDate, attachmentUrl, status } = body;

        if (!id || !courseId || !title || !dueDate) {
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

        // Verify the assignment exists and belongs to a course in this topic
        const existing = await db.select()
            .from(assignments)
            .innerJoin(courses, eq(assignments.courseId, courses.id))
            .where(and(eq(assignments.id, id), eq(courses.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Assignment not found or unauthorized' }, { status: 404 });
        }

        const [updatedAssignment] = await db.update(assignments)
            .set({
                courseId,
                title,
                description: description || null,
                dueDate: new Date(dueDate),
                attachmentUrl: attachmentUrl || null,
                status: status || 'upcoming',
            })
            .where(eq(assignments.id, id))
            .returning();

        return NextResponse.json(updatedAssignment);
    } catch (e) {
        console.error('[Assignments API] PUT error:', e);
        return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
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
            return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
        }

        // Verify the assignment exists and belongs to a course in this topic
        const existing = await db.select()
            .from(assignments)
            .innerJoin(courses, eq(assignments.courseId, courses.id))
            .where(and(eq(assignments.id, parseInt(id)), eq(courses.topicId, topicId)))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Assignment not found or unauthorized' }, { status: 404 });
        }

        await db.delete(assignments).where(eq(assignments.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[Assignments API] DELETE error:', e);
        return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }
}
