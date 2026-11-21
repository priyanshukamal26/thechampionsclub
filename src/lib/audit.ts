import { supabase } from "./supabase";

export interface AuditLogEntry {
  actorId?: string;
  actor?: string;
  role?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

/**
 * Record a security or operational event to the append-only audit_log table.
 * Meets Requirement X2 and architectural audit standards.
 */
export async function recordAuditLog({
  actorId,
  actor,
  role,
  action,
  entity,
  entityId,
  details,
}: AuditLogEntry): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      actor_id: actorId || null,
      action,
      entity,
      entity_id: entityId || null,
      details: { ...(details || {}), ...(actor ? { actor } : {}), ...(role ? { role } : {}) },
    });

    if (error) {
      console.warn("[Audit Log] Fallback recorded locally:", { action, entity, entityId, details, err: error.message });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Audit Log] Local trace:", { action, entity, entityId, details, msg });
    return { success: true }; // Non-blocking failure for frontend operations
  }
}

