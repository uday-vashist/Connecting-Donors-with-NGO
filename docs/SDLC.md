# SDLC

## Purpose

This project follows a lean software development lifecycle for a donor-to-NGO allocation MVP. The goal is to validate the problem, implement only the logic we can prove, and avoid overbuilding before the product behaviour is stable.

## Lifecycle stages

### 1. Audit and problem framing
- Review the existing static prototype.
- Identify which parts are real product logic versus demo UI only.
- Separate the explainable ranking engine from simulated functionality.

### 2. Foundation and validation
- Create a real Next.js app with TypeScript.
- Add deterministic scoring and eligibility tests.
- Verify the engine before UI expansion.

### 3. MVP implementation
- Add seeded demo users and login flow.
- Add donation and ranking APIs.
- Keep the interface simple and transparent.

### 4. Verification
- Run Vitest for core logic.
- Run the production build to confirm the app compiles.
- Validate that API routes and provider flows are reachable.

### 5. Hardening and scale-up
- Move from in-memory data to a persisted database.
- Add complete permission enforcement and ownership checks.
- Add inventory transfer transactions and report generation.

## Quality gates

- Unit tests must pass for scoring, eligibility, transitions, and audit integrity.
- Production build must succeed.
- Risks and unsupported claims must be documented honestly.
- No simulated impact metrics are allowed to masquerade as real data.

## Release posture

This repository is intentionally conservative. It is a working MVP with a demonstrable engine and a small authenticated interface, not a full production deployment.
