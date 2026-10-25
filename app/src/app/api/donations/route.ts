import { NextResponse } from "next/server";

import { donations, getSessionUserFromRequest, recordAuditEntry } from "@/lib/store";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const user = getSessionUserFromRequest(cookieHeader ?? undefined);
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.item !== "string") {
    return NextResponse.json({ error: "Missing donation payload." }, { status: 400 });
  }

  const id = `DON-${Date.now()}`;
  const donation = {
    id,
    donorId: user.id,
    item: body.item,
    quantity: Number(body.quantity ?? 1),
    area: body.area || "Viman Nagar",
    ngoId: body.ngoId || "ngo-3",
    status: "Requested",
    createdAt: new Date().toISOString(),
  };

  donations.push(donation);
  recordAuditEntry({
    actor: user.id,
    role: user.role,
    action: "donation_created",
    resource: id,
    outcome: "requested",
    timestamp: donation.createdAt,
  });
  return NextResponse.json({ ok: true, donation });
}
