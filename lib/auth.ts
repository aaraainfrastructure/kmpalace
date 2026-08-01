import { Request } from 'express';

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'Snowboy@2226').trim();

export function verifyAdmin(req: Request | any): boolean {
  if (!req) return false;
  
  const headers = req.headers || {};
  const authHeader = headers.authorization || headers.Authorization;
  const adminKeyHeader = headers['x-admin-key'] || headers['X-Admin-Key'];

  if (authHeader && String(authHeader).replace('Bearer ', '').trim() === ADMIN_PASSWORD) {
    return true;
  }
  if (adminKeyHeader && String(adminKeyHeader).trim() === ADMIN_PASSWORD) {
    return true;
  }
  return false;
}
