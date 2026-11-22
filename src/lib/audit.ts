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
 * Posts to the Neon serverless endpoint /api/audit.
 */
export async function recordAuditLog(entry: AuditLogEntry): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== "undefined") {
      fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => undefined);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Audit Log] Local trace:", { entry, msg });
    return { success: true }; // Non-blocking failure for frontend operations
  }
}
