'use server';

import { cookies } from 'next/headers';
import { validateTelegramWebAppData, parseInitData } from '@/lib/telegram-auth';
import { env } from '@/lib/env';
import { db } from '@/db';
import { users, userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SESSION_DURATION = 60 * 60 * 24; // 24 hours

export async function login(initData: string) {
  const isValid = validateTelegramWebAppData(initData, env.BOT_TOKEN);
  
  if (!isValid) {
    throw new Error('Invalid initData');
  }

  const { user } = parseInitData(initData);
  if (!user) throw new Error('No user data');

  // Upsert user
  await db.insert(users).values({
    telegramId: user.id.toString(),
    firstName: user.first_name,
    username: user.username,
  }).onConflictDoUpdate({
    target: users.telegramId,
    set: {
      firstName: user.first_name,
      username: user.username,
    }
  });

  // Set cookie
  (await cookies()).set('telegram-session', initData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION,
    sameSite: 'lax',
    path: '/',
  });
  
  return { success: true };
}

export async function logout() {
  (await cookies()).delete('telegram-session');
}
