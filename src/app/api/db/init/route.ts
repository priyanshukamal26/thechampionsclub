import { NextResponse } from "next/server";
import { isDbConfigured, ensureTablesExist, getDatabaseUrl } from "@/lib/db";

export async function GET() {
  const configured = isDbConfigured();
  const rawUrl = getDatabaseUrl();
  const maskedUrl = rawUrl
    ? rawUrl.replace(/:([^@]+)@/, ":****@")
    : null;

  if (!configured) {
    return NextResponse.json({
      configured: false,
      message: "Neon DATABASE_URL is not configured or is a placeholder.",
      maskedUrl,
    });
  }

  const initialized = await ensureTablesExist();

  return NextResponse.json({
    configured: true,
    initialized,
    maskedUrl,
    message: initialized
      ? "Neon database is connected and tables (users, profiles, members, audit_log, bookings, orders) are verified."
      : "Database connection failed or timed out. Check connection string.",
  });
}

export async function POST() {
  return GET();
}
