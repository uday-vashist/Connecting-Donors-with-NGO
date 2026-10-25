# Survey and product fit

## Problem confirmation

The main product risk is not whether the app looks polished; it is whether the allocation process is explainable, auditable, and safe. Donors need confidence that the NGO being matched is legitimate and that the need is real. NGOs need an inventory and confirmation process that does not overstate impact. Reviewers and admins need a trustworthy operational record.

## Product goals

- Maximise explainability in donation allocation.
- Reduce donor uncertainty around why a request received priority.
- Provide a verification gate for NGO credibility.
- Protect the system from invalid resource lifecycle transitions.
- Keep the system simple enough to validate with real tests.

## User validation signals

- Donor sees a visible ranking and score breakdown.
- NGO requests are filtered by verified state and eligibility rules.
- Status histories and audit checks reassure admins and reviewers.
- The team can reason about logic without depending on hidden business rules.

## Practical assessment

This MVP is a credible first pass because it makes the core idea testable. It does not yet attempt full-scale production-grade persistence or compliance controls. That is intentional, following the principle of building a smaller correct system before broadening the scope.
