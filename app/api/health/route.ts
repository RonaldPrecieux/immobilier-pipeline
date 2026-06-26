import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      db: "ok",
      latency_ms: Date.now() - start,
      pooler: "aws-0-eu-west-1.pooler.supabase.com:6543",
    });
  } catch (err) {
    return NextResponse.json({
      db: "error",
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
