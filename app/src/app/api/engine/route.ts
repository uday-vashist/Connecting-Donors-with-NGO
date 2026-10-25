import { NextResponse } from "next/server";

import { rankEligibleRequests, sampleNGOs, sampleRequests } from "@/lib/sevasetu";
import { getSessionUserFromRequest, requests } from "@/lib/store";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const user = getSessionUserFromRequest(cookieHeader ?? undefined);
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const donorArea = searchParams.get("area") || "Viman Nagar";

  const ranked = rankEligibleRequests(requests, sampleNGOs, donorArea, new Date("2026-10-23T00:00:00Z"));

  return NextResponse.json({
    donorArea,
    user: { name: user.name, role: user.role },
    ranked: ranked.map((entry) => ({
      id: entry.id,
      item: entry.item,
      quantity: entry.quantity,
      ngo: entry.ngo.name,
      score: entry.score.total,
      breakDown: entry.score.contribution,
      reason: entry.score.reason,
    })),
  });
}
