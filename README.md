# Connecting-Donors-with-NGO


**Explainable donation allocation and resource accountability for NGOs**

SevaSetu extends Sevadeep's donor–NGO model (Relfor Foundation, Pune). It helps
donations reach verified NGOs that need them, records each donation through to
confirmed delivery, keeps NGO inventory consistent, and reports only what has
actually been confirmed.

## Problem

Connecting donors to NGOs is only the first step. Donations also need to match
real needs, reach verified organisations, be confirmed on delivery, and be
accounted for in inventory. Surplus at one NGO may help another.

## Objectives

- Rank NGOs for each donation using transparent, explainable criteria
- Track each donation from allocation to confirmed delivery
- Allow only verified NGOs to receive allocations
- Keep inventory consistent during transfers between NGOs
- Report from confirmed records, not estimates
- Support English, Hindi and Marathi with a simple mobile-friendly interface

## Core features

1. **Explainable allocation:** ranks eligible NGOs by need, urgency, quantity
   and distance, and shows each factor's contribution. Compared against a
   distance-only baseline.
2. **Donation lifecycle:** Requested, Matched, Allocated, In Transit,
   Delivered, Confirmed. Invalid transitions are rejected by the backend.
3. **NGO verification:** application-level review with visible status.
   This is not a legal or government verification.
4. **Audit trail and delivery evidence:** who did what, and when, linked to
   each donation.
5. **Inventory and redistribution:** surplus above a protected minimum can be
   transferred to a verified NGO's request in one atomic transaction.
6. **Evidence-based reports:** counts confirmed outcomes only, with CSV export.
7. **Multilingual and accessible UI:** English, Hindi, Marathi.
8. **Simple by design:** one main action per screen, plain language.

## Workflow

1. An NGO registers and a reviewer approves or rejects it.
2. A donor submits a donation.
3. The engine ranks eligible NGO requests with a score breakdown.
4. An authorised user confirms the allocation.
5. The donation moves through the lifecycle with delivery evidence.
6. The receiving NGO confirms receipt, and inventory updates once.
7. Eligible surplus can be transferred to other verified NGOs.
8. Reports summarise confirmed activity.

## Users and roles

- **Donor:** offers resources and follows progress
- **NGO representative:** manages requests and inventory, confirms deliveries
- **Reviewer:** reviews NGO registrations
- **Admin:** configures the system and reviews audit records

Permissions are enforced on the backend.

## Tech stack

<filled in by the agent after the repository audit>

## Getting started

<verified setup steps only>

## Running tests

<verified commands only>

## Implementation status

<one line per feature: implemented and tested / partial / simulated / planned>

## Known limitations

<honest list>

## Responsible use

- Demo data is separate from real records and is labelled as demo.
- Simulated deliveries or impact are never presented as real.
- Reports and logs avoid exposing sensitive personal data.

## Documentation

- `docs/SDLC.md`
- `docs/FLOW.md`
- `docs/SURVEY.md`

## Team

<team name, members, roles, Symbiosis Institute of Technology, Pune>
