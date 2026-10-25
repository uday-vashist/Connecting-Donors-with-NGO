export type Role = "donor" | "ngo" | "reviewer" | "admin";
export type VerificationStatus = "pending" | "verified" | "rejected" | "suspended";
export type DonationStatus =
  | "Requested"
  | "Matched"
  | "Allocated"
  | "In Transit"
  | "Delivered"
  | "Confirmed"
  | "Rejected"
  | "Cancelled"
  | "Disputed";

export interface NGO {
  id: string;
  name: string;
  type: string;
  area: string;
  status: VerificationStatus;
  needs: string[];
  urgency: number;
  distanceKm: Record<string, number>;
  protectedMinimum: number;
}

export interface ResourceRequest {
  id: string;
  item: string;
  quantity: number;
  ngoId: string;
  area: string;
  urgency: number;
  expiresAt?: string;
  createdAt: string;
  isOpen: boolean;
}

export interface ScoreBreakdown {
  compatibility: number;
  urgency: number;
  quantityFit: number;
  distance: number;
  total: number;
  contribution: Record<string, number>;
  reason: string;
  baselineTotal: number;
}

export interface AuditEntry {
  actor: string;
  role: Role;
  action: string;
  resource: string;
  outcome: string;
  timestamp: string;
}

export interface AuditRecord extends AuditEntry {
  prevHash: string;
  chainHash: string;
}

export const defaultWeights = {
  compatibility: 0.4,
  urgency: 0.25,
  quantityFit: 0.2,
  distance: 0.15,
};

export const sampleNGOs: NGO[] = [
  {
    id: "ngo-1",
    name: "Asha Bal Sadan",
    type: "Orphanage",
    area: "Kothrud",
    status: "verified",
    needs: ["Clothes", "Books", "Utensils"],
    urgency: 9,
    distanceKm: { Kothrud: 2, Baner: 7, Hadapsar: 12, "Viman Nagar": 10 },
    protectedMinimum: 12,
  },
  {
    id: "ngo-2",
    name: "Shanti Vruddhashram",
    type: "Old-age home",
    area: "Hadapsar",
    status: "verified",
    needs: ["Furniture", "Appliances", "Clothes"],
    urgency: 7,
    distanceKm: { Kothrud: 8, Baner: 10, Hadapsar: 3, "Viman Nagar": 6 },
    protectedMinimum: 18,
  },
  {
    id: "ngo-3",
    name: "Vidya Kendra",
    type: "Learning centre",
    area: "Viman Nagar",
    status: "verified",
    needs: ["Books", "Utensils", "Clothes"],
    urgency: 8,
    distanceKm: { Kothrud: 6, Baner: 4, Hadapsar: 9, "Viman Nagar": 3 },
    protectedMinimum: 20,
  },
  {
    id: "ngo-4",
    name: "Rural Care Trust",
    type: "Community organisation",
    area: "Baner",
    status: "pending",
    needs: ["Books", "Utensils"],
    urgency: 6,
    distanceKm: { Kothrud: 5, Baner: 2, Hadapsar: 7, "Viman Nagar": 8 },
    protectedMinimum: 10,
  },
];

export const sampleRequests: ResourceRequest[] = [
  {
    id: "req-1",
    item: "Books",
    quantity: 30,
    ngoId: "ngo-3",
    area: "Viman Nagar",
    urgency: 8,
    createdAt: "2026-10-01",
    isOpen: true,
  },
  {
    id: "req-2",
    item: "Clothes",
    quantity: 25,
    ngoId: "ngo-1",
    area: "Kothrud",
    urgency: 9,
    createdAt: "2026-10-02",
    isOpen: true,
  },
  {
    id: "req-3",
    item: "Utensils",
    quantity: 18,
    ngoId: "ngo-3",
    area: "Viman Nagar",
    urgency: 7,
    createdAt: "2026-10-03",
    isOpen: true,
  },
  {
    id: "req-4",
    item: "Clothes",
    quantity: 8,
    ngoId: "ngo-2",
    area: "Hadapsar",
    urgency: 6,
    createdAt: "2026-10-04",
    isOpen: true,
  },
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeFactor(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

export function isEligibleRequest(
  request: ResourceRequest,
  ngo: NGO,
  donorArea: string,
  now?: Date,
): boolean {
  const effectiveNow = now ?? new Date();
  if (ngo.status !== "verified") return false;
  if (!ngo.needs.includes(request.item)) return false;
  if (!request.isOpen) return false;
  if (request.quantity <= 0) return false;
  if (request.expiresAt) {
    const expiry = new Date(request.expiresAt);
    if (Number.isNaN(expiry.getTime()) || expiry <= effectiveNow) return false;
  }
  const distance = ngo.distanceKm[donorArea] ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(distance) || distance < 0) return false;
  return request.quantity <= ngo.protectedMinimum * 4;
}

export function computeAllocationScore(
  request: ResourceRequest,
  ngo: NGO,
  donorArea: string,
  weights = defaultWeights,
): ScoreBreakdown {
  const distance = ngo.distanceKm[donorArea] ?? 20;
  const maxDistance = 18;
  const compatibility = ngo.needs.includes(request.item) ? 1 : 0;
  const urgencyValue = clamp(request.urgency / 10, 0, 1);
  const quantityFit = clamp(request.quantity / 40, 0, 1);
  const distanceScore = clamp(1 - distance / maxDistance, 0, 1);

  const contribution = {
    compatibility: compatibility * weights.compatibility * 100,
    urgency: urgencyValue * weights.urgency * 100,
    quantityFit: quantityFit * weights.quantityFit * 100,
    distance: distanceScore * weights.distance * 100,
  };

  const total = Object.values(contribution).reduce((sum, value) => sum + value, 0);
  const baselineTotal = 0.18 * 100 + 0.1 * 100 + 0.15 * 100;

  const reason = `${ngo.name} ranks above the baseline because ${request.item} matches a verified need, urgent demand is high, and the distance from ${donorArea} is ${distance} km.`;

  return {
    compatibility: Number(compatibility.toFixed(2)),
    urgency: Number(urgencyValue.toFixed(2)),
    quantityFit: Number(quantityFit.toFixed(2)),
    distance: Number(distanceScore.toFixed(2)),
    total: Number(total.toFixed(1)),
    contribution: {
      compatibility: Number(contribution.compatibility.toFixed(1)),
      urgency: Number(contribution.urgency.toFixed(1)),
      quantityFit: Number(contribution.quantityFit.toFixed(1)),
      distance: Number(contribution.distance.toFixed(1)),
    },
    reason,
    baselineTotal: Number(baselineTotal.toFixed(1)),
  };
}

export function rankEligibleRequests(
  requests: ResourceRequest[],
  ngos: NGO[],
  donorArea: string,
  now?: Date,
): Array<ResourceRequest & { ngo: NGO; score: ScoreBreakdown }> {
  const eligible: Array<ResourceRequest & { ngo: NGO; score: ScoreBreakdown }> = [];

  for (const request of requests) {
    const ngo = ngos.find((entry) => entry.id === request.ngoId);
    if (!ngo || !isEligibleRequest(request, ngo, donorArea, now)) continue;

    eligible.push({
      ...request,
      ngo,
      score: computeAllocationScore(request, ngo, donorArea),
    });
  }

  return eligible.sort((a, b) => b.score.total - a.score.total);
}

export function getDistanceBaseline(
  requests: ResourceRequest[],
  ngos: NGO[],
  donorArea: string,
  now?: Date,
) {
  return requests
    .map((request) => {
      const ngo = ngos.find((entry) => entry.id === request.ngoId);
      if (!ngo || !isEligibleRequest(request, ngo, donorArea, now)) return null;
      const distance = ngo.distanceKm[donorArea] ?? 20;
      return { request, ngo, baseline: clamp(100 - distance * 4, 0, 100) };
    })
    .filter(Boolean) as Array<{ request: ResourceRequest; ngo: NGO; baseline: number }>;
}

export const scenarioCases = [
  {
    id: "scenario-1",
    title: "Books request in Viman Nagar",
    donorArea: "Viman Nagar",
    expectedWinner: "Vidya Kendra",
    expectedReason: "warms due to matching need and short distance",
  },
  {
    id: "scenario-2",
    title: "Clothes request in Kothrud",
    donorArea: "Kothrud",
    expectedWinner: "Asha Bal Sadan",
    expectedReason: "urgent need plus local distance",
  },
  {
    id: "scenario-3",
    title: "High-demand in Hadapsar",
    donorArea: "Hadapsar",
    expectedWinner: "Shanti Vruddhashram",
    expectedReason: "remaining close and verified",
  },
  {
    id: "scenario-4",
    title: "Pending NGO should not qualify",
    donorArea: "Baner",
    expectedWinner: "None",
    expectedReason: "pending NGO is rejected by eligibility",
  },
  {
    id: "scenario-5",
    title: "Expired request should be excluded",
    donorArea: "Kothrud",
    expectedWinner: "None",
    expectedReason: "expired item fails the checked eligibility",
  },
  {
    id: "scenario-6",
    title: "Quantity too large is capped",
    donorArea: "Baner",
    expectedWinner: "None",
    expectedReason: "request quantity exceeds the eligibility cap",
  },
];

export function runScenarioCase(
  request: ResourceRequest,
  ngos: NGO[],
  donorArea: string,
): { winner: string | null; total: number; baseline: number; eligibleCount: number } {
  const ranked = rankEligibleRequests([request], ngos, donorArea);
  const winner = ranked[0]?.ngo.name ?? null;
  const total = ranked[0]?.score.total ?? 0;
  const baseline = getDistanceBaseline([request], ngos, donorArea)[0]?.baseline ?? 0;

  return {
    winner,
    total,
    baseline,
    eligibleCount: ranked.length,
  };
}

export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildAuditChain(entries: readonly AuditEntry[]): Promise<AuditRecord[]> {
  let previousHash = "GENESIS";

  const records: AuditRecord[] = [];
  for (const entry of entries) {
    const payload = `${previousHash}|${entry.actor}|${entry.role}|${entry.action}|${entry.resource}|${entry.outcome}|${entry.timestamp}`;
    const chainHash = await sha256Hex(payload);
    records.push({
      ...entry,
      prevHash: previousHash,
      chainHash,
    });
    previousHash = chainHash;
  }

  return records;
}

export async function verifyAuditChain(records: readonly AuditRecord[]): Promise<{ valid: boolean; brokenIndexes: number[] }> {
  const brokenIndexes: number[] = [];
  let previousHash = "GENESIS";

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const expectedPrevHash = previousHash;
    const payload = `${expectedPrevHash}|${record.actor}|${record.role}|${record.action}|${record.resource}|${record.outcome}|${record.timestamp}`;
    const expectedHash = await sha256Hex(payload);

    if (record.prevHash !== expectedPrevHash || record.chainHash !== expectedHash) {
      brokenIndexes.push(index);
    }

    previousHash = record.chainHash;
  }

  return { valid: brokenIndexes.length === 0, brokenIndexes };
}

export function transitionAllowed(current: DonationStatus, next: DonationStatus): boolean {
  const matrix: Record<DonationStatus, DonationStatus[]> = {
    Requested: ["Matched", "Rejected", "Cancelled"],
    Matched: ["Allocated", "Cancelled"],
    Allocated: ["In Transit", "Cancelled"],
    "In Transit": ["Delivered", "Disputed", "Cancelled"],
    Delivered: ["Confirmed", "Disputed"],
    Confirmed: [],
    Rejected: [],
    Cancelled: [],
    Disputed: ["Allocated", "Cancelled"],
  };

  return matrix[current]?.includes(next) ?? false;
}

export function hasPermission(role: Role, action: string): boolean {
  const permissions: Record<Role, string[]> = {
    donor: ["donate", "track"],
    ngo: ["accept", "confirm_delivery", "manage_inventory"],
    reviewer: ["review_ngo"],
    admin: ["audit", "review_ngo", "manage_inventory", "confirm_donation"],
  };

  return permissions[role]?.includes(action) ?? false;
}

export function nextExpiryFirst<T extends { expiry?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const left = a.expiry ? new Date(a.expiry).getTime() : Number.POSITIVE_INFINITY;
    const right = b.expiry ? new Date(b.expiry).getTime() : Number.POSITIVE_INFINITY;
    return left - right;
  });
}
