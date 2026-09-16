# MEIL ESG / BRSR Portal — React Prototype

A component-per-file React prototype of the BRSR reporting portal, built from
the site map in `web_design_for_prototype.docx`. Every page is its own file;
they're wired together with plain `import`/`export`, not a page builder.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Log in with any email/password — auth is mocked.

## Build for production

```bash
npm run build
```

Outputs to `dist/`.

## File map

```
src/
  main.jsx                     entry point, mounts <App/>
  App.jsx                      route table (React Router)
  index.css                    all design tokens + component styles

  context/
    AppContext.jsx             global state: logged-in user, selected entity, period

  data/                         <- the shared "backend" for this prototype
    entities.js                 org tree: Group -> Subsidiary -> Project
    schema.js                   BRSR disclosure format, encoded as data
    mockData.js                 sample leaf-level submissions + workflow status
    aggregation.js              roll-up engine: resolve(), contributions(), scanAnomalies()

  components/
    layout/
      Sidebar.jsx                left nav (matches the site map in the brief)
      Topbar.jsx                  entity breadcrumb, period switcher, user menu
      Layout.jsx                  Sidebar + Topbar + <Outlet/> shell
    common/
      EntityTree.jsx              collapsible org-tree picker, reused on 3 pages
      DisclosureTable.jsx         renders any schema.js entry as an editable/read-only table
      StatCard.jsx                KPI tile used on Dashboard + Analytics
      StatusBadge.jsx             colored workflow-status label

  pages/                         one file per item in the sidebar
    Login.jsx
    Dashboard.jsx
    Organization.jsx
    EsgDataCollection.jsx
    BrsrIndicators.jsx
    Validation.jsx
    ReviewApproval.jsx
    Analytics.jsx
    SdgMapping.jsx
    Reports.jsx
    AuditTrail.jsx
    UserRoles.jsx
```

## How to extend it

**Add a new BRSR disclosure field** — edit `data/schema.js` only. Add an
object to the `SCHEMA` array with `rows`, `cols`, and optionally `deriveRows`
or `validate`. It renders automatically on both the ESG Data Collection and
BRSR Indicators pages via `DisclosureTable.jsx`.

**Add a new entity to the org tree** — edit `data/entities.js`. Add an entry
to `ENTITIES` and reference its id in its parent's `children` array. It
appears in every tree/dropdown automatically.

**Connect to a real backend** — replace the contents of `data/mockData.js`
with API calls (e.g. React Query), and swap the local `RESPONSES`/`STATUS`
mutations in `EsgDataCollection.jsx` and `ReviewApproval.jsx` for real
mutation calls. `aggregation.js` doesn't need to change.

**Re-theme the app** — edit the `:root` variables at the top of `index.css`.

## What's mocked vs real

- **Real:** the aggregation engine (roll-ups and ratio recomputation actually
  run), the validation rules, the routing, the entity tree, the schema-driven
  form rendering.
- **Mocked:** authentication (accepts any input), file exports (buttons show
  a confirmation banner instead of producing a file), and audit log writes
  (edits don't append new rows to Audit Trail yet).
