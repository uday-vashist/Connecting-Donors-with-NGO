import { describe, expect, it } from "vitest";

import {
  type AuditEntry,
  buildAuditChain,
  computeAllocationScore,
  isEligibleRequest,
  rankEligibleRequests,
  sampleNGOs,
  sampleRequests,
  transitionAllowed,
  verifyAuditChain,
} from "./sevasetu";

describe("SevaSetu allocation rules", () => {
  it("ranks eligible NGO requests by score and keeps the winner consistent", () => {
    const ranked = rankEligibleRequests(sampleRequests, sampleNGOs, "Viman Nagar");

    expect(ranked.length).toBeGreaterThanOrEqual(1);
    expect(ranked[0].ngo.name).toBe("Vidya Kendra");
    expect(ranked[0].score.total).toBeGreaterThan(55);
  });

  it("excludes pending NGO status and invalid requests", () => {
    const request = { ...sampleRequests[0], ngoId: "ngo-4" };
    const ngo = sampleNGOs.find((item) => item.id === "ngo-4");
    expect(ngo).toBeDefined();
    expect(isEligibleRequest(request, ngo!, "Baner")).toBe(false);
  });

  it("keeps valid transitions and blocks invalid ones", () => {
    expect(transitionAllowed("Requested", "Matched")).toBe(true);
    expect(transitionAllowed("Matched", "Confirmed")).toBe(false);
    expect(transitionAllowed("In Transit", "Confirmed")).toBe(false);
    expect(transitionAllowed("Delivered", "Confirmed")).toBe(true);
  });

  it("computes score contributions and reveal the factor breakdown", () => {
    const score = computeAllocationScore(sampleRequests[0], sampleNGOs[2], "Viman Nagar");

    expect(score.total).toBeGreaterThan(0);
    expect(score.contribution.compatibility).toBeGreaterThan(0);
    expect(score.reason).toContain("Vidya Kendra");
  });
});

describe("Audit chain tests", () => {
  it("builds a valid hash-chain and verifies it", async () => {
    const entries: AuditEntry[] = [
      { actor: "donor-a", role: "donor", action: "donate", resource: "resource-1", outcome: "Requested", timestamp: "2026-10-23T10:00:00Z" },
      { actor: "reviewer-a", role: "reviewer", action: "review_ngo", resource: "ngo-1", outcome: "verified", timestamp: "2026-10-23T10:05:00Z" },
    ];

    const chain = await buildAuditChain(entries);
    const result = await verifyAuditChain(chain);
    expect(result.valid).toBe(true);
    expect(result.brokenIndexes).toEqual([]);
  });

  it("detects tampering in the chain", async () => {
    const entries: AuditEntry[] = [
      { actor: "donor-a", role: "donor", action: "donate", resource: "resource-1", outcome: "Requested", timestamp: "2026-10-23T10:00:00Z" },
      { actor: "reviewer-a", role: "reviewer", action: "review_ngo", resource: "ngo-1", outcome: "verified", timestamp: "2026-10-23T10:05:00Z" },
    ];

    const chain = await buildAuditChain(entries);
    chain[1].outcome = "suspended";
    const result = await verifyAuditChain(chain);
    expect(result.valid).toBe(false);
    expect(result.brokenIndexes).toContain(1);
  });
});
