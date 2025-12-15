
import { createHmac } from 'node:crypto';

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function parseInitData(initData: string) {
  const q = new URLSearchParams(initData);
  const userStr = q.get('user');
  const user = userStr ? JSON.parse(userStr) as User : null;
  const chat_instance = q.get('chat_instance');
  const chat_type = q.get('chat_type');
  const auth_date = q.get('auth_date');
  const hash = q.get('hash');
  const start_param = q.get('start_param');
  
  return {
    user,
    chat_instance,
    start_param,
    auth_date,
    hash,
    raw: initData
  };
}

export function validateTelegramWebAppData(telegramInitData: string, botToken: string) {
  const urlParams = new URLSearchParams(telegramInitData);
  const hash = urlParams.get('hash');
  
  if (!hash) return false;

  urlParams.delete('hash');
  
  const params = Array.from(urlParams.entries());
  params.sort((a, b) => a[0].localeCompare(b[0]));
  
  const dataCheckString = params.map(([key, value]) => `${key}=${value}`).join('\n');
  
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
}
