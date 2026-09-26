# A. Phase goal

Build the student-facing browse API for approved internship/co-op experiences:

- `GET /browse/experiences`
- `GET /browse/experiences/:id`

This phase covers proposal requirements for:

- Viewing approved experience entries
- Viewing full details
- Searching by company name and role title
- Filtering by industry, work term type, and work mode
- Sorting by most recent submission date

## C. Deliverables

By the end of this phase:

- Logged-in users can view approved entries
- Logged-in users can view one approved entry
- Pending entries are hidden
- Rejected entries are hidden
- Draft entries are hidden
- Search works against `company_name` and `role_title`
- Filter works by `industry_id`
- Filter works by `work_term_type`
- Filter works by `work_mode`
- Sort returns most recent approved submissions first
- Automated API tests cover browse behavior
