/**
 * server/lib/security.ts — التوقيع المركزي HMAC-SHA256 + تشفير كلمات المرور
 * (بطاقات الدخول، قيود الدفع، بطاقات التشغيل — كلها من مصدر واحد)
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { APP_SECRET } from '../config.js';

export function hmacSign(payload: string): string {
  return crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
}

/** مقارنة ثابتة الزمن لمنع هجمات التوقيت */
export function hmacVerify(payload: string, providedSig: string): boolean {
  const expected = hmacSign(payload);
  try {
    return providedSig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function hashPassword(pw: string): string {
  return bcrypt.hashSync(pw, 10);
}

export function comparePassword(pw: string, hash: string): boolean {
  return bcrypt.compareSync(pw, hash);
}

export function uid(prefix: string, len = 12): string {
  return prefix + crypto.randomUUID().slice(0, len);
}
