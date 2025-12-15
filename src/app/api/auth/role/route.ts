
import { db } from '@/db';
import { userRoles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { parseInitData } from '@/lib/telegram-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('X-Telegram-Init-Data');
    if (!authHeader) {
        console.log('[Role API] No auth header provided');
        return NextResponse.json({ role: 'student' }, { status: 401 });
    }

    const { user, start_param } = parseInitData(authHeader);
    
    console.log('[Role API] Parsed initData:', {
        userId: user?.id,
        username: user?.username,
        firstName: user?.first_name,
        start_param
    });
    
    if (!user || !start_param) {
        console.log('[Role API] Missing user or start_param, defaulting to student');
        return NextResponse.json({ role: 'student' });
    }

    try {
        // Check if user has role for this topic (start_param is topic_id or unique key)
        console.log('[Role API] Querying userRoles with:', {
            userId: user.id.toString(),
            topicId: start_param
        });
        
        const roleEntry = await db.select()
            .from(userRoles)
            .where(and(
                eq(userRoles.userId, user.id.toString()),
                eq(userRoles.topicId, start_param)
            ))
            .limit(1);

        console.log('[Role API] Query result:', roleEntry);

        if (roleEntry.length > 0) {
            console.log('[Role API] Found role:', roleEntry[0].role);
            return NextResponse.json({ role: roleEntry[0].role });
        }
    } catch (e) {
        console.error("[Role API] Role Check Error", e);
    }

    console.log('[Role API] No role found, defaulting to student');
    return NextResponse.json({ role: 'student' });
}
