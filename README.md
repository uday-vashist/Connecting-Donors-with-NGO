# Connecting Donors with NGO

SevaSetu is an explainable donation-allocation MVP for donor-to-NGO coordination. It ranks verified NGO requests by transparent scoring, records the allocation path, and provides a practical dashboard for donor actions and operational visibility.

## Problem

Connecting donors to NGOs is only the first step. A donation still needs to reach a verified organisation with a real need, be tracked through delivery, and remain accountable at the inventory level. The system must avoid overstating impact and must favour transparent, evidence-based decisions.

## Objectives

- Rank eligible NGO requests using explainable criteria
- Keep allocation logic auditable and deterministic
- Enforce simple role-based access for donor, NGO, reviewer, and admin flows
- Record donation status transitions and protect invalid lifecycle actions
- Deliver a smaller, correct MVP instead of a simulated system with weak guarantees

## Core features

1. Explainable allocation: the engine scores verified NGO needs using compatibility, urgency, quantity fit, and distance.
2. Donor and NGO workflow: the app has seeded user accounts, session-based login, donation submission, and ranked requests.
3. Lifecycle safety: donation status transitions are defined in code and invalid actions are rejected.
4. Audit chain: a hash-chain model verifies record integrity and exposes tampering.
5. Demo-friendly structure: the project is intentionally small, testable, and grounded in verified logic rather than fake scale.

## Workflow

1. A donor signs in with a seeded demo account.
2. The app ranks eligible NGO requests for a donor area.
3. The donor submits a donation and the engine recalculates the top-ranked need.
4. The request lifecycle can move through approved stages while invalid transitions are blocked.
5. Audit records can be verified to confirm chain integrity.

## Users and roles

- Donor: can sign in, submit donations, and view ranked needs.
- NGO: can receive and review requests, manage inventory, and confirm delivery actions.
- Reviewer: can review NGO verification state.
- Admin: can approve audit and operational oversight actions.

## Tech stack

- Next.js 16.4.3
- React 19
- TypeScript
- Vitest 3
- bcryptjs for password hashing
- Node.js-based local demo app and server routes

## Getting started

From the app folder:

```bash
npm install
npm run dev
```

Then open the local Next.js URL shown in the terminal.

## Running tests

```bash
npm test
npm run build
```

## Implementation status

- Implemented and tested: explainable allocation engine, eligibility checks, scenario matrix, audit-chain verification, and seeded demo auth.
- Implemented: donor dashboard, API routes for login, engine ranking, and donation creation.
- Partial: full persisted database layer, role enforcement across all workflows, real NGO verification pipeline, inventory transfer transactions, and export/report features.
- Planned: production-grade PostgreSQL + Prisma persistence, full lifecycle approval flows, CSV reports, and deployment hardening.

## Known limitations

- Data is currently in-memory for the demo MVP and not yet backed by PostgreSQL.
- Full role enforcement and ownership checks are not yet implemented across every operational workflow.
- Inventory transfers and delivery evidence workflows are modelled as logic and API stubs, not as a full transactional backend.
- The app is designed for a demo/prototype environment and should not be treated as production-critical without additional security and persistence work.

## Responsible use

- Demo data is separate from real records and is clearly labelled as demo.
- Simulated records are never presented as real-world impact.
- Reports and logs avoid exposing personal or sensitive donor information.

## Documentation

- [docs/SDLC.md](docs/SDLC.md)
- [docs/FLOW.md](docs/FLOW.md)
- [docs/SURVEY.md](docs/SURVEY.md)

## Team

SevaSetu MVP

Built as a prototype for the Connecting Donors with NGO concept, with project ownership at Symbiosis Institute of Technology, Pune.
