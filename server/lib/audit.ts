/**
 * server/lib/audit.ts — سجل التدقيق الموحد (كتابة حقيقية في Supabase)
 */
import crypto from 'crypto';
import { pool } from './db.js';

export interface AuditInput {
  actorUserId?: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  reason?: string;
  correlationId?: string;
  safeMetadata?: Record<string, unknown>;
}

export async function recordAudit(audit: AuditInput): Promise<void> {
  const id = 'aud-' + crypto.randomUUID();
  try {
    await pool.query(
      `INSERT INTO orbit_audit_events (id, actor_user_id, actor_name, action, resource_type, resource_id, reason, correlation_id, safe_metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        audit.actorUserId || 'system',
        audit.actorName,
        audit.action,
        audit.resourceType,
        audit.resourceId,
        audit.reason || '',
        audit.correlationId || 'req-' + Date.now(),
        JSON.stringify(audit.safeMetadata || {}),
      ]
    );
  } catch (e) {
    console.warn('Audit record error:', e);
  }
}


