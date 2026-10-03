# Eco Metrics — Complete Frontend Prompt Pack for Claude

This document contains the complete prompt sequence for generating the **Eco Metrics ESG & BRSR Reporting Platform** frontend with Claude.

Use the prompts in the recommended order. Build the application incrementally so Claude can inspect and reuse the existing project structure instead of duplicating components.

---

# 1. MASTER PROMPT

```text
You are a senior frontend architect and UI/UX engineer.

Build a production-quality but hackathon-friendly frontend for:

"Eco Metrics"

An ESG & BRSR Reporting Platform for centralized collection, validation, consolidation, analytics and reporting.

The platform is designed around an enterprise ESG reporting workflow.

TECH STACK:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React
- Recharts
- React Hook Form
- Zod
- Axios
- TanStack Query where useful

IMPORTANT:
The frontend must be designed as a real enterprise ESG reporting application, NOT as a generic admin dashboard.

CORE ORGANIZATION HIERARCHY:
Organization / Group
→ Subsidiary
→ Business Unit
→ Project
→ Reporting Period
→ ESG Data
→ Validation
→ Review
→ Approval
→ BRSR Mapping
→ Reports

USER ROLES:
1. Project User
2. BU Manager
3. Subsidiary Admin
4. ESG/Sustainability Team
5. Group Admin
6. Management

ROLE BEHAVIOR:
- Project User: enter project ESG data, upload evidence, submit data
- BU Manager: review project submissions, request correction, approve
- Subsidiary Admin: monitor subsidiary, consolidate and review
- ESG Team: validate ESG data, manage BRSR, reporting and SDG mapping
- Group Admin: organization-wide management, users, consolidation and approval
- Management: high-level analytics, KPI dashboards and final reports

BRSR STRUCTURE:

Section A:
- Details of Listed Entity
- Products/Services
- Operations
- Employees
- Holding/Subsidiary/Associate/JV
- CSR Details
- Transparency and Disclosures
- Complaints/Grievances
- Material Responsible Business Conduct Issues

Section B:
- Policies and management processes
- Board approval
- Procedures
- Value-chain coverage
- Codes / Certifications / Standards
- Commitments, Goals and Targets
- Performance against targets
- Governance, leadership and oversight

Section C:
- Principle 1
- Principle 2
- Principle 3
- Principle 4
- Principle 5
- Principle 6
- Principle 7
- Principle 8
- Principle 9

Each principle supports Essential and Leadership indicators.

BRANDING:
- The product name is "Eco Metrics"
- Do not display "MEIL ESG" in the visible product branding
- Use "Eco Metrics" as the primary application name
- Subtitle: "ESG & BRSR Reporting Platform"
- Browser title: "Eco Metrics | ESG & BRSR"
- The application should feel like a modern independent ESG platform
- Organization names can still appear as data inside the application

DESIGN LANGUAGE:
Create a professional ESG/corporate visual system.

Primary visual direction:
- Deep forest green
- Emerald/teal accents
- White surfaces in light mode
- Very light gray page backgrounds in light mode
- Dark charcoal surfaces in dark mode
- High readability
- Minimal use of red/orange only for warnings and errors

STYLE:
- Modern enterprise SaaS
- Clean
- Professional
- Spacious
- Data-dense but readable
- Strong hierarchy
- Rounded cards
- Subtle borders
- Soft shadows
- Excellent typography
- No excessive gradients
- No flashy gaming-style UI
- No unnecessary glassmorphism

LIGHT / DARK THEME:
Implement a complete Light / Dark theme switcher.

Requirements:
- Add a theme toggle in the top navigation/header
- Support:
  1. Light
  2. Dark
  3. System preference (optional but preferred)
- Follow system preference on first visit
- Remember selected theme using localStorage
- Every component must support both themes
- Cards, tables, forms, charts, modals, sidebar, dropdowns, alerts, badges and BRSR interfaces must adapt automatically
- Use CSS variables/design tokens rather than hardcoded colors
- Do not simply invert colors
- Dark mode should use a professional dark charcoal/green ESG palette instead of pure black
- Ensure good contrast and accessibility
- Theme toggle should use Lucide icons: Sun and Moon
- Animate the icon transition subtly with Framer Motion
- Tooltip should describe the current action
- Theme transition should be smooth, around 200–300ms
- Avoid flashing the wrong theme during page load
- Theme support must work on every page and component

RESPONSIVE REQUIREMENTS:
Desktop:
- Full left sidebar
- Top header
- Multi-column dashboard layouts

Tablet:
- Collapsible sidebar
- Two-column cards where appropriate
- Responsive tables

Mobile:
- Sidebar becomes drawer/bottom navigation
- Cards become one column
- Tables become horizontally scrollable or transform into stacked cards
- Forms become single column
- Charts resize correctly
- Touch-friendly controls
- Minimum 44px touch targets

ANIMATION REQUIREMENTS:
Use Framer Motion.

Animations should be subtle and professional:
- page fade/slide transitions
- sidebar open/close
- card hover elevation
- modal scale/fade
- dropdown animation
- tab transitions
- chart entrance animation
- progress bar animation
- table row hover
- skeleton loading shimmer
- success/error toast animation

Do NOT over-animate.
Animations must never interfere with accessibility or usability.

ACCESSIBILITY:
- Keyboard navigation
- Focus states
- ARIA labels
- Good contrast
- Reduced-motion support
- Semantic HTML

ARCHITECTURE:
Use reusable components.

Create:
components/
pages/
layouts/
hooks/
services/
api/
types/
utils/

Do NOT duplicate UI code.

Create reusable:
Button
Input
Select
DatePicker
Modal
Drawer
Badge
StatusBadge
Card
StatCard
DataTable
EmptyState
LoadingState
Skeleton
Tabs
ProgressBar
Search
FilterBar
Breadcrumbs
Toast
ConfirmDialog
FileUploader
KPI widget
ChartCard

DATA:
Do not hardcode values directly throughout components.
Use typed mock data/services where API is not connected yet.

API:
Create a centralized Axios API client using:
VITE_API_URL

Prepare the frontend for:
GET /api/v1/dashboard
GET /api/v1/projects
GET /api/v1/esg
POST /api/v1/esg/environmental
POST /api/v1/esg/social
POST /api/v1/esg/governance
GET /api/v1/brsr/sections
GET /api/v1/brsr/principles
GET /api/v1/brsr/indicators
GET /api/v1/brsr/responses
POST /api/v1/brsr/responses
GET /api/v1/validation
POST /api/v1/validation/run
GET /api/v1/approvals
POST /api/v1/approvals/:id/action
GET /api/v1/reports
POST /api/v1/reports/generate
GET /api/v1/sdgs
GET /api/v1/audit
GET /api/v1/users

IMPORTANT:
The frontend must reflect actual ESG/BRSR workflow:
DATA ENTRY → VALIDATION → REVIEW → APPROVAL → BRSR → CONSOLIDATION → REPORT

Create realistic enterprise UI states:
- Draft
- Submitted
- Under Review
- Correction Required
- Validated
- Approved
- Final

Every page should have:
- responsive layout
- page title
- breadcrumb
- action area
- loading state
- empty state
- error state
- success feedback
- responsive behavior
- subtle animation

Do not build a generic "CRM" UI.
The website must look specifically designed for ESG and BRSR reporting.

Before writing code, inspect the existing project structure and reuse existing components, styles, routes, types and API utilities wherever possible. Do not create duplicate components or conflicting design systems.
```

---

# 2. APP SHELL / LAYOUT PROMPT

```text
Build the main application shell for the Eco Metrics ESG & BRSR portal.

Create:
- Desktop sidebar
- Tablet collapsible sidebar
- Mobile drawer
- Top navigation/header
- Breadcrumbs
- Global search
- Reporting year selector
- Organization scope selector
- Notification icon
- User profile menu
- Light/Dark/System theme switcher

Sidebar sections:
Dashboard
Organization
Projects
ESG Data
BRSR
Validation
Approvals
ESG Analytics
SDG Mapping
Reports
Audit Trail
Users & Roles
Settings

Branding:
ECO METRICS
ESG & BRSR Reporting Platform

Sidebar should show active route with animated indicator.

Add:
- animated sidebar collapse
- mobile slide-in drawer
- hover tooltips when collapsed
- smooth page transitions
- responsive header
- sticky top header where appropriate
- theme switcher with Sun/Moon icons
- localStorage theme persistence
- system theme detection

Create reusable:
AppLayout
Sidebar
TopHeader
Breadcrumbs
ThemeToggle
MobileNav
```

---

# 3. LOGIN PAGE PROMPT

```text
Create a professional login page for the Eco Metrics ESG & BRSR platform.

Layout:
Desktop:
- Left: ESG-themed illustration/data visualization
- Right: login card

Mobile:
- Hide or reduce decorative illustration
- Center the login form

Brand:
Eco Metrics
ESG & BRSR Reporting Platform

Fields:
- Email
- Password
- Remember me
- Forgot password

Buttons:
- Sign In

Below login:
"Secure ESG & BRSR Reporting Platform"

Include a theme toggle on the login page as well.

Add role-aware authentication preparation.

Use:
React Hook Form
Zod validation
Axios login request

API:
POST /api/v1/auth/login

After login:
redirect to dashboard.

Animations:
- page fade in
- login card slide-up
- input focus transition
- button loading animation
- error shake only on validation failure
- subtle theme-switch animation

Use professional ESG visual language.
Do not make it look like a generic banking login.
```

---

# 4. DASHBOARD PROMPT

```text
Create the main Eco Metrics ESG Dashboard.

The dashboard must NOT just be a collection of generic KPI cards.

Top section:
- "ESG Dashboard"
- Reporting year
- Organization scope
- Role indicator
- Export button

Hierarchy filter:
Organization / Group
→ Subsidiary
→ Business Unit
→ Project

KPI cards:
- ESG Completion
- BRSR Completion
- Pending Reviews
- Validation Alerts
- Projects Reporting
- Approved Records

Main visualizations:
1. ESG reporting completion trend
2. Environmental performance
3. Social performance
4. Governance compliance
5. BRSR Section A/B/C completion

Add:
- projects requiring attention
- validation alerts
- pending approvals
- recent submissions
- target vs actual
- evidence completion
- data quality score

Add "Reporting Status" section:
Project
BU
Subsidiary
ESG Team
Group

Each level should display:
- completion
- submitted
- pending
- correction required
- approved

Add quick actions:
Enter ESG Data
Review Data
Open BRSR
Generate Report

Add:
- period-over-period comparison
- filterable KPI summaries
- clear empty states
- useful drill-down interactions

Animation:
- KPI count-up
- cards fade/slide
- progress bars animate
- charts animate when entering viewport
- alert cards appear smoothly
- hover interactions
- reduced-motion fallback

Make dashboard responsive.

Do not use fake-looking random dashboard metrics without labels.
All demo values should come from typed mock data or API services.
```

---

# 5. ORGANIZATION COMPONENT PROMPT

```text
Create an Organization Management page specifically for Eco Metrics.

Show hierarchy as an interactive tree:

Organization / Group
├── Subsidiary
│   ├── Business Unit
│   │   ├── Project
│   │   └── Project
│   └── Business Unit
└── Subsidiary

Desktop:
- left hierarchy tree
- right details panel

Mobile:
- hierarchy becomes accordion

Each node should show:
- name
- type
- status
- number of projects
- ESG completion
- BRSR completion

Actions:
- Add subsidiary
- Add business unit
- Add project
- Edit
- View details

Use animated tree expansion.

Create reusable:
OrganizationTree
OrganizationNode
OrganizationDetailsPanel
HierarchyBreadcrumb

Respect user role and organization scope when showing controls.
```

---

# 6. PROJECTS PAGE PROMPT

```text
Create the Eco Metrics Projects Management page.

Show:
- Search
- Subsidiary filter
- Business Unit filter
- State/location filter
- Reporting year filter
- ESG status filter
- BRSR status filter

Project table columns:
Project Code
Project Name
Subsidiary
Business Unit
Location
ESG Completion
BRSR Completion
Validation Status
Approval Status
Last Updated
Action

Desktop:
- table

Tablet:
- compact table

Mobile:
- project cards

Each project can open:
Project Overview
ESG Data
Documents
Validation
BRSR
Approval History

Add animated filtering and table transitions.

Use status badges:
Draft
Submitted
Under Review
Correction Required
Validated
Approved
Final

Support:
- pagination
- sorting
- search
- empty state
- loading state
- error state
```

---

# 7. ESG DATA CENTER PROMPT

```text
Create the main Eco Metrics ESG Data Center.

Header:
ESG Data
Reporting Year
Organization
Business Unit
Project

Tabs:
Environmental
Social
Governance

Each tab must provide:
- Summary
- Data entry
- Previous period comparison
- Validation status
- Evidence
- Submission status

Environmental fields include examples such as:
Electricity
Fuel
Renewable Energy
Water
Waste
Scope 1
Scope 2
Scope 3

Social:
Employees
Workers
Male/Female representation
Training
Safety incidents
Injuries
Fatalities
Turnover
Grievances
Community initiatives

Governance:
Anti-corruption
Ethics
Whistleblower
Conflict of interest
Compliance
Board oversight

Use form sections rather than one giant form.

Each section:
Title
Description
Fields
Unit
Source/evidence
Remarks
Save Draft
Submit

Show:
Current year
Previous year
Difference
% change

Add "Attach Evidence" button.

Use React Hook Form + Zod.

Animations:
- tab slide
- form section expand
- save success
- validation warning
- progress updates

Make the forms fully responsive.
```

---

# 8. ENVIRONMENTAL COMPONENT PROMPT

```text
Create a dedicated Environmental ESG data page for Eco Metrics.

Sections:

Energy:
- electricity consumption
- fuel consumption
- renewable energy
- energy intensity

Water:
- water withdrawal
- water consumption
- recycled/reused water

Waste:
- hazardous waste
- non-hazardous waste
- recycled waste
- disposed waste

Emissions:
- Scope 1
- Scope 2
- Scope 3

For each metric:
Value
Unit
Reporting period
Previous period
Change
Evidence
Remarks
Validation state

Show mini trend charts beside important metrics.

Add automatic warning if:
- value is negative
- unit missing
- required field missing
- unusual increase/decrease

Use polished ESG data-entry UX.

Support:
- Save Draft
- Validate
- Submit
- Attach Evidence

Mobile:
- one-column layout
- stacked metric cards
- scrollable charts if necessary
```

---

# 9. SOCIAL COMPONENT PROMPT

```text
Create the Social ESG page for Eco Metrics.

Sections:

Workforce:
- permanent employees
- other employees
- workers
- male
- female

Diversity:
- women representation
- differently abled employees/workers
- management diversity

Training:
- employees trained
- workers trained
- total training hours

Health & Safety:
- incidents
- injuries
- fatalities
- lost time incidents

Employee turnover:
- current year
- previous year
- year before previous year

Grievances:
- employees/workers
- communities
- customers
- investors
- value chain partners
- others

Community:
- initiatives
- beneficiaries
- expenditure
- impact

Use cards, tables and structured forms.

Add current vs previous year comparisons.

Mobile layout must stack sections cleanly.

Use subtle Framer Motion transitions.
```

---

# 10. GOVERNANCE COMPONENT PROMPT

```text
Create the Governance ESG page for Eco Metrics.

Sections:
- Ethics
- Anti-corruption
- Whistleblower
- Conflict of interest
- Compliance
- Board oversight
- Responsible business policies
- Training and awareness
- Governance incidents

For each:
Policy status
Board approval
Procedure
Value-chain coverage
Evidence
Last reviewed
Status

Add a governance compliance score.

Add timeline:
Policy Created
Board Approved
Implemented
Reviewed

Add:
- status filters
- evidence links
- review history
- correction workflow

Use subtle animations and professional corporate design.
```

---

# 11. BRSR WORKSPACE PROMPT

```text
Create the central BRSR Workspace for Eco Metrics.

Top:
BRSR Reporting Workspace
FY selector
Reporting boundary selector
Organization selector
Completion percentage

Left navigation:
SECTION A
SECTION B
SECTION C

SECTION A:
Entity Details
Products / Services
Operations
Employees
Holding/Subsidiary/Associate/JV
CSR
Transparency & Disclosures
Complaints & Grievances
Material Issues

SECTION B:
Policies
Procedures
Value Chain
Certifications
Goals & Targets
Performance
Governance & Oversight

SECTION C:
P1
P2
P3
P4
P5
P6
P7
P8
P9

When selecting a section:
show indicators/questions in the center.

For each indicator display:
Indicator Code
Question
Essential/Leadership
Current response
Status
Evidence
Reviewer
Last updated

Actions:
Edit
Save
Submit
View Evidence
View History

Add completion percentage for every section.

Use animated section transitions.

Make the BRSR workspace responsive:
Desktop = three-panel layout
Tablet = two-panel layout
Mobile = stacked accordion/navigation

Add a clear hierarchy:
Section → Principle → Indicator → Response
```

---

# 12. BRSR SECTION A PROMPT

```text
Create a detailed BRSR Section A interface based on the provided Annexure.

Sections:

1. Details of Listed Entity
- CIN
- Name
- Year of incorporation
- Registered office
- Corporate address
- Email
- Telephone
- Website
- Financial year
- Stock exchanges
- Paid-up capital
- Contact person
- Reporting boundary
- Assurance provider
- Assurance type

2. Products / Services

3. Operations

4. Employees and Workers
- workforce categories
- women representation
- differently abled employees/workers
- turnover trends

5. Holding / Subsidiary / Associate / JV

6. CSR Details

7. Transparency and Disclosures
- complaints
- grievance mechanism
- material responsible business conduct issues

Create collapsible sections.

Every section must support:
Save Draft
Submit
Evidence
Comments
History

Use progress completion indicators.

Do not invent additional BRSR questions.
Keep the field labels aligned with the Annexure.

Use responsive forms:
desktop = two columns
tablet = two columns where practical
mobile = one column
```

---

# 13. BRSR SECTION B PROMPT

```text
Create BRSR Section B for Eco Metrics.

Create a principle matrix:

                P1 P2 P3 P4 P5 P6 P7 P8 P9

Rows:
Policy coverage
Board approved
Procedure available
Value chain coverage
Codes/certifications
Commitments
Goals
Targets
Performance
Governance
Oversight

Click a principle to open detailed form.

For policies include:
- policy name
- description
- principle mapping
- board approval
- web link
- procedure availability
- value chain coverage
- certifications/standards

For targets:
- commitment
- baseline
- target
- target year
- actual
- status
- reason if target not met

Use progress indicators.

Animations:
- matrix hover
- detail drawer slide
- save transitions
- expandable rows

Ensure the matrix works on mobile by converting it into cards or stacked rows.
```

---

# 14. BRSR SECTION C PROMPT

```text
Create BRSR Section C for Eco Metrics.

Display the 9 NGRBC principles.

Each principle card must show:
- Principle number
- Principle name
- Essential indicators completion
- Leadership indicators completion
- Total completion

Principles:
P1
P2
P3
P4
P5
P6
P7
P8
P9

When user opens a principle:

Show tabs:
Essential Indicators
Leadership Indicators

Each indicator row:
Indicator code
Question
Data type
Current value
Unit
Status
Evidence
Validation
Action

Statuses:
Not Started
Draft
Submitted
Validation Required
Validated
Approved

Provide:
Previous period comparison
Comments
Evidence upload
Change history

Use animated accordion/cards.

Do not put all questions on one massive screen.
Use pagination or grouping if necessary.

Make long BRSR questions readable on mobile.
```

---

# 15. VALIDATION CENTER PROMPT

```text
Create an ESG/BRSR Validation Center for Eco Metrics.

Top KPIs:
- Total Records
- Valid
- Warnings
- Errors
- Pending Validation

Filters:
Project
Subsidiary
Business Unit
Reporting Year
ESG category
Principle
Severity
Status

Validation table:
Record
Metric
Project
Value
Rule
Severity
Status
Detected At
Action

Severity:
Error
Warning
Info

Actions:
Review
Accept
Request Correction
Resolve

Create a right-side detail drawer showing:
- submitted value
- previous value
- validation rule
- evidence
- comments
- history

Add animated status transitions.

Use clear visual distinction without excessive colors.

Prevent unauthorized users from seeing actions they cannot perform.
```

---

# 16. APPROVAL CENTER PROMPT

```text
Create the Approval Center for Eco Metrics.

Workflow visualization:

Project User
      ↓
BU Manager
      ↓
Subsidiary Admin
      ↓
ESG Team
      ↓
Authorized Approver
      ↓
FINAL

Show each submission as a card/table row.

Fields:
Project
Data Category
Reporting Period
Submitted By
Submitted Date
Validation Status
Current Approval Level
Status
Action

Actions:
Review
Approve
Reject
Request Correction

Approval drawer:
Summary
ESG data
BRSR mapping
Evidence
Validation results
Comments
History

Create an animated horizontal approval timeline.

Mobile:
Timeline becomes vertical.

Do not allow an Approve button if required validation is incomplete.

Show clear reason when an action is unavailable.
```

---

# 17. ESG ANALYTICS PROMPT

```text
Create the ESG Analytics page for Eco Metrics.

Sections:

Environmental:
- Energy
- Water
- Waste
- Scope 1
- Scope 2
- Scope 3

Social:
- Workforce
- Diversity
- Training
- Safety
- Turnover
- Grievances

Governance:
- Policies
- Compliance
- Ethics
- Training
- Incidents

Charts:
- yearly trend
- project comparison
- subsidiary comparison
- target vs actual
- current vs previous year

Filters:
Year
Subsidiary
Business Unit
Project
ESG category

Use Recharts.

Add animated chart entrance and tooltip interactions.

Use accessible chart labels.

Charts must resize correctly in both themes and on mobile.
```

---

# 18. SDG MAPPING PROMPT

```text
Create an SDG Mapping page for Eco Metrics.

Show the 17 UN Sustainable Development Goals.

Layout:
Desktop:
- ESG activities on left
- SDG goals on right

Allow mapping:

ESG Activity
→ SDG Goal
→ Reason
→ Evidence
→ Reporting Period

Examples can include:
Water initiatives → SDG 6
Clean energy → SDG 7
Employee wellbeing → SDG 3
Education/community initiatives → relevant SDG

Show:
Mapped
Unmapped
Partially mapped

Add filters:
ESG category
Project
Subsidiary
Reporting Year

Use SDG cards with numbers and accessible labels.

Use subtle card animations.

Make drag-and-drop optional, not required.
Ensure mapping is usable on mobile.
```

---

# 19. REPORT CENTER PROMPT

```text
Create the ESG & BRSR Report Center for Eco Metrics.

Header:
Report Center
Reporting Year
Organization
Boundary

Show reporting readiness:

ESG Data
████████ 92%

Validation
███████ 84%

Approval
██████ 76%

BRSR
███████ 81%

Report sections:
- ESG Summary
- BRSR Section A
- BRSR Section B
- BRSR Section C
- Environmental
- Social
- Governance
- SDG Mapping

Report statuses:
Draft
Under Review
Validated
Approved
Final

Buttons:
Preview
Generate PDF
Export Excel
Download
View Version History

Add report generation modal:
- report type
- year
- boundary
- sections
- include evidence
- include charts

Show generated reports history.

Use animation during generation:
Preparing data
Validating
Consolidating
Generating
Completed

Ensure reports use approved/authorized data only.
```

---

# 20. AUDIT TRAIL PROMPT

```text
Create an Audit Trail page for the Eco Metrics ESG/BRSR platform.

Show every important system action.

Columns:
Timestamp
User
Role
Action
Entity
Entity ID
Previous Value
New Value
IP/device where appropriate

Filters:
User
Role
Date range
Entity
Action
Project
Reporting period

Actions:
Created
Updated
Submitted
Validated
Approved
Rejected
Generated Report
Uploaded Evidence

Add expandable row to view detailed changes.

Create a professional timeline view on mobile.

Animate timeline entries as they appear.

Do not expose sensitive information unnecessarily.
```

---

# 21. USERS & ROLES PROMPT

```text
Create a Users & Roles management page for Eco Metrics.

Roles:
Project User
BU Manager
Subsidiary Admin
ESG/Sustainability Team
Group Admin
Management

User table:
Name
Email
Role
Organization
Subsidiary
Business Unit
Project
Status
Last Login
Action

Create user modal.

Role permissions matrix:

                    View  Create  Edit  Submit  Validate  Approve
Project User
BU Manager
Subsidiary Admin
ESG Team
Group Admin
Management

Do not allow unauthorized controls.

Use role-specific UI.

Animations:
- modal
- row expansion
- permission toggle
- success toast

Add role filter and organization scope filtering.
```

---

# 22. AI ESG ASSISTANT PROMPT

```text
Create an AI ESG Assistant panel for the Eco Metrics ESG/BRSR platform.

The assistant must behave as an ESG reporting assistant, not a general chatbot.

Possible tasks:
- explain an ESG metric
- identify missing data
- explain validation warnings
- suggest relevant BRSR indicator mapping
- summarize approved ESG data
- summarize reporting progress
- explain SDG mapping
- create a draft executive summary

UI:
Floating AI button
→ opens right-side panel

Panel:
Conversation area
Suggested prompts
Input box
Send button

Suggested prompts:
"Show missing ESG data"
"Which projects require review?"
"Explain this BRSR indicator"
"Summarize FY 2025-26 ESG performance"
"Show validation anomalies"

IMPORTANT:
AI must respect the logged-in user's permissions.
AI must not access unauthorized organization/project data.
AI must not directly modify approved records.
AI-generated values must never be presented as factual database values unless retrieved from the API.

Add loading animation and message transitions.

Include light/dark theme support in the AI panel.
```

---

# 23. SHARED ESG DATA TABLE PROMPT

```text
Create a reusable enterprise DataTable component for Eco Metrics ESG/BRSR data.

Features:
- sorting
- filtering
- pagination
- search
- column visibility
- row selection
- responsive mobile layout
- sticky header
- empty state
- loading skeleton
- error state

For mobile:
convert wide rows into expandable cards.

Support:
status badges
progress bars
icons
action menus

Use Framer Motion for:
row appearance
filter transition
expanded row animation

Make it generic and strongly typed.

Support both light and dark themes.
Do not hardcode theme-specific values.
```

---

# 24. FORM COMPONENT PROMPT

```text
Create a reusable Eco Metrics ESG Form System.

Components:
ESGForm
FormSection
FormField
NumberField
TextField
SelectField
DateField
UnitField
EvidenceUploader
RemarksField
PreviousValueDisplay
ValidationMessage

Features:
- React Hook Form
- Zod validation
- autosave draft
- dirty state detection
- unsaved changes warning
- inline validation
- accessible labels
- keyboard navigation

Create consistent layout:
Label
Input
Unit
Help text
Validation message

Support:
desktop two-column forms
mobile one-column forms

Use subtle field focus animation.

All form components must support:
- light mode
- dark mode
- loading states
- disabled states
- error states
- success states
```

---

# 25. MOBILE RESPONSIVE PROMPT

```text
Audit the entire Eco Metrics ESG & BRSR frontend for responsive behavior.

Breakpoints:
- mobile
- tablet
- desktop
- large desktop

Fix all:
- overflowing tables
- oversized charts
- sidebar problems
- modal width
- long BRSR questions
- form layouts
- dropdown positioning
- button wrapping
- navigation
- organization hierarchy
- approval timeline
- BRSR navigation

Mobile rules:
- no horizontal page overflow
- all buttons touch-friendly
- tables become cards or controlled horizontal-scroll containers
- sidebar becomes drawer
- charts scale to container
- filters wrap
- forms become one-column
- BRSR navigation becomes accordion
- report cards stack vertically

Tablet:
- 2-column forms
- collapsible sidebar
- compact dashboard
- responsive BRSR workspace

Desktop:
- dense data layout
- multi-column dashboard
- persistent navigation

Large desktop:
- use additional horizontal space without making content excessively wide

Test at:
375px
390px
768px
1024px
1280px
1440px
1920px

Check both light and dark themes at every breakpoint.
```

---

# 26. ANIMATION AUDIT PROMPT

```text
Review the complete Eco Metrics application and add polished but subtle animations.

Use Framer Motion.

Required:
- route/page transitions
- sidebar transitions
- dropdown transitions
- modal scale/fade
- drawer slide
- card hover
- button feedback
- progress bar animation
- KPI count-up
- chart entrance
- table row transitions
- skeleton loading
- toast animation
- success state
- validation status changes
- approval workflow transitions
- BRSR tab transitions
- theme toggle animation

Rules:
- animation duration approximately 150–400ms for UI interactions
- use easing appropriate for enterprise UI
- avoid excessive bouncing
- avoid large zoom effects
- support prefers-reduced-motion
- animations must not reduce performance
- respect mobile performance

Do not animate every element.
Prioritize feedback and navigation.

Do not use animations that obscure important data or delay task completion.
```

---

# 27. FINAL QUALITY-CHECK PROMPT

```text
Perform a complete frontend quality audit of the Eco Metrics ESG & BRSR Reporting Platform.

Check:

1. Does the UI represent the hierarchy?
Organization / Group
→ Subsidiary
→ Business Unit
→ Project?

2. Are the six user roles represented correctly?

3. Does the frontend contain:
- Dashboard
- Organization
- Projects
- ESG Data
- BRSR
- Validation
- Approvals
- ESG Analytics
- SDG Mapping
- Reports
- Audit Trail
- Users & Roles
- Settings?

4. Does BRSR contain:
Section A
Section B
Section C
Principles P1–P9
Essential and Leadership indicators?

5. Are ESG categories represented:
Environmental
Social
Governance?

6. Is the workflow represented:
Draft
Submitted
Review
Validation
Approval
Final?

7. Are forms responsive?

8. Are tables responsive?

9. Are charts responsive?

10. Is navigation responsive?

11. Are animations subtle and professional?

12. Are loading, empty, error and success states implemented?

13. Is light/dark/system theme support implemented globally?

14. Is the selected theme persisted?

15. Are all UI components readable in dark mode?

16. Is all repeated UI extracted into reusable components?

17. Are API calls centralized?

18. Is mock data isolated from production API services?

19. Are role permissions reflected in the UI?

20. Does the website look like an ESG/BRSR enterprise product rather than a generic admin template?

21. Does the visible product branding consistently say "Eco Metrics"?

22. Is "MEIL ESG" removed from product branding while allowing organization names to appear as data where relevant?

23. Are all pages accessible by keyboard?

24. Are focus states visible?

25. Does prefers-reduced-motion work?

26. Are there any layout overflow issues?

27. Are there any duplicate or conflicting design components?

28. Are all pages using the same design tokens and theme system?

Fix all issues you find.
Do not rewrite working components unnecessarily.

Before changing architecture, inspect the existing code and make targeted improvements.
```

---

# 28. GLOBAL REUSE / CONSISTENCY PROMPT

Use this whenever Claude starts creating duplicate components or inconsistent styles:

```text
Before creating any new UI component:

1. Inspect the existing components directory.
2. Reuse an existing component if it provides the required behavior.
3. Extend existing components when appropriate.
4. Reuse existing design tokens, spacing, typography and theme variables.
5. Do not create duplicate buttons, cards, modals, tables or form controls.
6. Keep the Eco Metrics design system consistent across every route.
7. Do not create a new color palette on individual pages.
8. Do not introduce a second UI library unless explicitly requested.
9. Keep all animations consistent with the global Framer Motion rules.
10. Keep all theme colors in shared CSS variables or design tokens.
```

---

# 29. API INTEGRATION PROMPT

Use this after the UI is complete:

```text
Now connect the Eco Metrics frontend to the backend.

Use a centralized Axios API client.

Environment variable:
VITE_API_URL

Use these endpoints:

Authentication:
POST /api/v1/auth/login

Dashboard:
GET /api/v1/dashboard

Organization:
GET /api/v1/organization

Projects:
GET /api/v1/projects
GET /api/v1/projects/:id

ESG:
GET /api/v1/esg
POST /api/v1/esg/environmental
POST /api/v1/esg/social
POST /api/v1/esg/governance

BRSR:
GET /api/v1/brsr/sections
GET /api/v1/brsr/principles
GET /api/v1/brsr/indicators
GET /api/v1/brsr/responses
POST /api/v1/brsr/responses

Validation:
GET /api/v1/validation
POST /api/v1/validation/run

Approvals:
GET /api/v1/approvals
POST /api/v1/approvals/:id/action

Reports:
GET /api/v1/reports
POST /api/v1/reports/generate

SDG:
GET /api/v1/sdgs

Audit:
GET /api/v1/audit

Users:
GET /api/v1/users

Requirements:
- replace mock data only where the corresponding API exists
- keep loading states
- keep empty states
- keep error states
- handle expired authentication
- preserve role permissions
- centralize API errors
- do not expose sensitive backend errors directly to users
- use typed API responses
- keep API base URL configurable
```

---

# 30. RECOMMENDED BUILD ORDER

Use the prompts in this order:

```text
1. Master Prompt
        ↓
2. App Shell
        ↓
3. Login
        ↓
4. Dashboard
        ↓
5. Organization
        ↓
6. Projects
        ↓
7. ESG Data Center
        ↓
8. Environmental
9. Social
10. Governance
        ↓
11. BRSR Workspace
        ↓
12. Section A
13. Section B
14. Section C
        ↓
15. Validation
16. Approvals
        ↓
17. Analytics
18. SDG Mapping
19. Reports
20. Audit Trail
21. Users & Roles
22. AI Assistant
        ↓
23. Shared DataTable
24. Shared Form System
        ↓
25. Responsive Audit
26. Animation Audit
27. API Integration
28. Final Quality Check
```

---

# 31. IMPORTANT INSTRUCTION TO ADD TO EVERY COMPONENT PROMPT

```text
Before writing code, inspect the existing project structure and reuse existing components, styles, routes, types and API utilities wherever possible. Do not create duplicate components or conflicting design systems.

The product name visible in the UI must be "Eco Metrics".

Every component must support:
- responsive behavior
- light/dark theme
- accessible states
- loading state
- empty state
- error state
- success feedback where relevant
- subtle professional animations
```

---

# 32. FINAL DESIGN GOAL

The finished application should feel like this:

```text
                     ECO METRICS
              ESG & BRSR REPORTING PLATFORM

┌─────────────────────────────────────────────────────────────┐
│ Search   Organization   FY 2025-26   Theme   Notifications │
├───────────────┬─────────────────────────────────────────────┤
│ Dashboard     │                                             │
│ Organization  │              MAIN WORKSPACE                 │
│ Projects      │                                             │
│ ESG Data      │  ESG Metrics → Validation → Approval       │
│ BRSR          │  → BRSR → SDG → Reports                   │
│ Validation    │                                             │
│ Approvals     │                                             │
│ Analytics     │                                             │
│ SDG Mapping   │                                             │
│ Reports       │                                             │
│ Audit Trail   │                                             │
│ Users/Roles   │                                             │
│ Settings      │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

The important product story is:

```text
DATA COLLECTION
      ↓
VALIDATION
      ↓
REVIEW
      ↓
APPROVAL
      ↓
BRSR MAPPING
      ↓
CONSOLIDATION
      ↓
ANALYTICS
      ↓
SDG MAPPING
      ↓
ESG / BRSR REPORT
      ↓
AUDIT TRAIL
```

This should be visible through the product's navigation and workflows, not just described in documentation.
