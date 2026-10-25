import { NextResponse } from "next/server";

import { buildAuditChain } from "@/lib/sevasetu";
import { auditEntries, getSessionUserFromRequest } from "@/lib/store";

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const records = await buildAuditChain(auditEntries);
  return NextResponse.json({ records });
}
