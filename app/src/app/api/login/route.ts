import { NextResponse } from "next/server";

import { getUserByEmail, recordAuditEntry, verifyPassword } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = verifyPassword(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  recordAuditEntry({
    actor: user.id,
    role: user.role,
    action: "login",
    resource: "session",
    outcome: "success",
    timestamp: new Date().toISOString(),
  });

  const payload = JSON.stringify({ userId: user.id, role: user.role });
  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  response.cookies.set("sevasetu-session", payload, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function GET() {
  return NextResponse.json({ ok: true, supported: ["donor", "ngo", "reviewer", "admin"] });
}
