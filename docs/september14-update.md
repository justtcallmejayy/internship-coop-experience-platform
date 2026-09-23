Phase 1 — Backend foundation: COMPLETE
Phase 2 — Database setup: COMPLETE
Phase 3 — Authentication + tests: COMPLETE
Phase 4 — Profile management: NEXT
--------------------------------------------------------------------------------

By the end of this phase:

GET /profile
PATCH /profile (using custom middlewares)
profile route tests
profile validation
session user update after profile edit

The profile API will enforce:

user must be logged in
email cannot be edited
role cannot be edited
password cannot be edited here
graduation year must be reasonable if provided
LinkedIn URL must be valid if provided 
(To verify if a LinkedIn URL is correct, first confirm it follows the profile-specific format https://www.linkedin.com/in/username.  A valid URL must contain the /in/ path segment; URLs pointing to company pages (/company/), posts (/posts/), or Sales Navigator leads are not personal profile URLs. )