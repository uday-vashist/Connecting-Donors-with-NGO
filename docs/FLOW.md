# App flow

## User journey

### Donor flow
1. Sign in using a seeded demo donor account.
2. Select a donor area.
3. Review eligible NGO requests ranked by score.
4. Submit a donation for an item and quantity.
5. Confirm the donation is added to the app state.
6. Re-rank the requests to see the current allocation view.

### NGO flow
1. Sign in as an NGO user.
2. Review requests relevant to the organisation.
3. Accept or process a matched allocation.
4. Confirm delivery and inventory adjustments when the workflow advances.

### Reviewer flow
1. Review NGO verification state.
2. Approve or reject the organisation for receiving allocations.

### Admin flow
1. Review audit records and allocation decisions.
2. Validate record integrity and monitor operational health.

## Core logic flow

- Eligible requests are filtered by NGO verification, item match, active status, expiry, and donor-area distance.
- Rank scoring combines compatibility, urgency, quantity fit, and distance.
- The top-ranked request is shown to the donor and can be acted on.
- Invalid transitions are prevented by explicit lifecycle rules.
- Audit entries are chained with a hash so record integrity can be checked.

## Current implementation scope

The current codebase contains the verified engine and the donor-facing flow. The deeper operational ledger, full database, and transactional inventory commands are the next large step after the MVP.
