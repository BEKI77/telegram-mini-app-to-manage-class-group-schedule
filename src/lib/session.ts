import { cookies } from 'next/headers';
import { parseInitData } from '@/lib/telegram-auth';

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('telegram-session');
  
  if (!session) return null;
  
  try {
    const data = parseInitData(session.value);
    return data;
  } catch (e) {
    return null;
  }
}
