# EMIS TDC — COMPREHENSIVE SYSTEM AUDIT & IMPLEMENTATION ROADMAP

**Project**: Teacher Development Centre Information System (TDC-IS)  
**Domain**: Malawi Education Management Information System (EMIS)  
**Stack**: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4 + Dexie.js (IndexedDB)  
**Audit Date**: 2026-05-15  
**Current Status**: Pre-Alpha / Foundational Prototype  
**Production Readiness**: 25%

---

## 1. EXECUTIVE SUMMARY

The EMIS TDC project is a single-page application built entirely on IndexedDB (via Dexie.js) with React 19 and TypeScript. It serves as a Ministry of Education management information system for primary and secondary education data across Malawi's 28 districts.

### Current State

The codebase has a **strong UI/UX foundation** with consistent dark sidebar navigation, well-designed tables, charts, modals, and card-based layouts. However, **the system is functionally incomplete** — many features exist as UI shells with hardcoded mock data, no backend API, no authentication, no RBAC, and limited actual CRUD operations.

### Health Assessment

| Category | Score | Status |
|---|---|---|
| UI/UX Design | 8/10 | Strong, consistent design system |
| Client-Side Architecture | 6/10 | Good React patterns, but no state management |
| Backend / API | 0/10 | No backend exists — 100% client-side IndexedDB |
| Data Layer | 4/10 | Dexie schema defined, but incomplete relations |
| Feature Completeness | 3/10 | ~30% of expected features have real logic |
| Code Quality | 6/10 | Good TypeScript usage, some type gaps fixed |
| Build Stability | 8/10 | Builds clean with zero errors (after fixes) |
| Testing | 0/10 | No tests |
| Security | 1/10 | No auth, no RBAC, no HTTPS, no sanitization |
| Documentation | 2/10 | ERD.md exists, no inline documentation |

---

## 2. CURRENT SYSTEM ARCHITECTURE

### 2.1 Architecture Diagram

```
index.html
  └─ index.tsx (mounts App)
       └─ App.tsx (HashRouter + Routes)
            ├─ LandingPage.tsx (splash screen → sets showApp=true)
            └─ <App> (sidebar + router)
                 ├─ Routes:
                 │   ├─ / → Dashboard.tsx
                 │   ├─ /upload → DataUpload.tsx (TermlyReport form)
                 │   ├─ /learners → LearnerRegistry.tsx
                 │   ├─ /hr → TeacherRegistry.tsx
                 │   ├─ /school-profile → SchoolProfile.tsx
                 │   ├─ /assistant → Assistant.tsx
                 │   ├─ /infrastructure → RecordsRegistry.tsx (type="infrastructure")
                 │   ├─ /materials → RecordsRegistry.tsx (type="materials")
                 │   ├─ /finance → RecordsRegistry.tsx (type="finance")
                 │   ├─ /zonal/* → ZonalModule.tsx (10 types)
                 │   ├─ /settings → ZonalModule.tsx (type="settings")
                 │   ├─ /publications → PublicationsView (placeholder)
                 │   ├─ /notices → NoticesView (placeholder)
                 │   └─ * → PlaceholderView
                 └─ db.ts (Dexie IndexedDB + seed data)
```

### 2.2 Data Flow

```
User Action → React Component → Dexie Query/Add/Update → IndexedDB
                                   ↕
                             useLiveQuery (reactive)
                                   ↕
                            localStorage (zonal aggregates)
                                   ↕
                            geminiService.ts (AI queries)
```

### 2.3 Key Files

| File | Lines | Purpose |
|---|---|---|
| `types.ts` | 338 | All TypeScript interfaces |
| `db.ts` | 377 | Dexie schema, tables, seed data |
| `App.tsx` | 271 | App shell, sidebar, routing |
| `LandingPage.tsx` | 330+| Splash/landing page |
| `Dashboard.tsx` | 229 | Main KPI dashboard |
| `DataUpload.tsx` | 1311 | Termly report multi-tab form |
| `LearnerRegistry.tsx` | 559 | Learner CRUD |
| `TeacherRegistry.tsx` | 999 | Teacher CRUD + TCM + transfers + leaves |
| `SchoolProfile.tsx` | 1754 | School detail view with 17 sub-tabs |
| `ZonalModule.tsx` | 1243 | Zonal aggregate analytics (10 domains) |
| `RecordsRegistry.tsx` | 191 | Infrastructure/materials/finance registry |
| `Assistant.tsx` | 149 | AI chat interface |
| `KPICard.tsx` | 34 | Reusable KPI card |
| `analyticsService.ts` | 63 | Zonal aggregate recalculation |
| `validationService.ts` | 93 | Termly report validation |
| `geminiService.ts` | 70+ | Google Gemini AI integration |
| `constants.ts` | 15 | Malawi regions/districts constants |

---

## 3. FULLY IMPLEMENTED FEATURES

These features have real logic, database integration, and working UI:

1. **Learner CRUD** — Add, list, filter, search, delete learners with IndexedDB persistence. Multi-step registration modal with NIN verification simulation.

2. **Teacher CRUD** — Add, list, filter, search teachers. Dashboard with analytics. Teacher profile view. TCM compliance portal. Transfer management. Leave management. Staffing reports.

3. **School Profile** — Comprehensive school detail view with 17 tabs (Overview, Legal Identity, Geographic, Governance, Enrollment, Registry, SNE, Promotion, Staff, Exams, Finance, Infrastructure, Assets, Inspections). AI summary generation.

4. **Data Upload (Termly Report)** — Multi-tab form with Enrolment, Attendance, Teachers, Infrastructure, Textbooks, Exams, Health, Finance, Special Needs sections. Auto-save, validation, submit, unlock workflows. Real-time KPI tracking (PTR, PCR, PLR).

5. **Zonal Aggregates** — 10 domain-specific analytics views (Enrolment, Infrastructure, Exams, Attendance, Textbooks, Health, Inclusion, Finance, Reports, Settings) with Recharts charts.

6. **Infrastructure / Materials / Finance Registries** — School-level data tables with stable random projections.

7. **Dashboard** — KPI cards with live counts, audit log activity feed, enrollment trend chart, zonal aggregate display.

8. **AI Assistant** — Chat interface with Gemini AI integration for EMIS queries and data analysis.

9. **Validation Service** — Recursive negative value checking, enrollment-consistency rules, attendance-to-enrollment cross-validation.

10. **Database Seeding** — 10 schools, 2 learners, 2 teachers, 2 finance records, 2 exam records, 2 promotion records seeded on first load.

---

## 4. PARTIALLY IMPLEMENTED FEATURES

| Feature | What Works | What's Missing |
|---|---|---|
| **Learner Edit** | Delete works | Edit button shows toast only, no edit modal |
| **School Form (Add/Edit)** | Modal exists, submits to DB | No field-level validation, no Geocoding |
| **School Delete** | Works with confirmation | No cascade to related records |
| **Transfer Management** | Add + list | No status transition workflow |
| **Leave Management** | Add + list + Study leave conditional fields | No approval workflow |
| **Termly Report Auto-Save** | Saves on tab change | No debounced auto-save on field change |
| **Zonal Aggregate Recalculation** | Called on submit, stored in localStorage | Not loaded on Dashboard mount automatically |
| **Export** | Toast messages only | No actual file generation |
| **Promotion Records** | DB schema + seed data | No UI for adding/editing |
| **Standardised Exam Scores** | DB schema + seed data | No UI for adding individual scores |
| **PSLCE Results** | DB schema | No UI |
| **Finance SIG** | DB schema + seed data | No full CRUD UI |
| **Assets** | DB schema | No full CRUD UI |
| **Inspections** | DB schema | No full CRUD UI, only placeholder data |
| **Audit Logs** | Created on school updates | Not created for learner/teacher changes |
| **AI Summary** | Gemini integration works | Uses different API version than geminiService |

---

## 5. MISSING FEATURES (Not Started)

### Core EMIS Modules (0% complete)

1. **Authentication / Login** — No user accounts, no login screen, no session management. The `showApp` boolean is a flat state toggle.
2. **User Management** — No users table, no roles, no permissions.
3. **RBAC (Role-Based Access Control)** — No concept of roles (Admin, School Admin, Zonal Officer, Ministry, Teacher, etc.)
4. **Multi-School Switching** — System is hardcoded to "Lilongwe Demonstration School" in the header.
5. **Backend API** — No server, no REST/graphQL, no real-time sync.

### Data Management

6. **Bulk Import (CSV/XLSX)** — The "Bulk Data Registry" button exists on the Dashboard but there's no actual file upload/parse logic.
7. **Data Export (Real)** — All export buttons show toasts only. No XLSX, CSV, or PDF generation.
8. **PDF Reports** — No PDF generation for any module.
9. **Data Backup / Restore** — No export/import of IndexedDB data.

### School Operations

10. **Class / Stream Management** — No timetables, no class stream assignment.
11. **Student Attendance (Daily)** — Only termly aggregate attendance in DataUpload.
12. **Teacher Payroll** — No payroll integration or salary data.
13. **Discipline Records** — No discipline module.
14. **Timetable Management** — No timetable module.
15. **Transport Management** — No transport module.

### Communication

16. **Notifications / Alerts** — Notice board is a placeholder page.
17. **Announcements** — Publications page is a placeholder.
18. **SMS / Email Integration** — None.

### Infrastructure

19. **Full Asset Lifecycle** — Assets table exists but no UI.
20. **Inventory Management** — No inventory tracking.
21. **Maintenance Scheduling** — No maintenance module.

### Analytics & Reporting

22. **Real Reports** — All analytics are static/hardcoded chart data.
23. **Data Completeness Dashboard** — No visual indicator of data submission progress across schools.
24. **Comparative Reports** — No year-over-year or school-to-school comparison views beyond what ZonalModule shows.

---

## 6. BROKEN FEATURES (Fixed in Current Session)

The following were broken at audit time and have been fixed:

| Issue | File | Fix Applied |
|---|---|---|
| `TeacherTransfer.requestDate` doesn't exist | `TeacherRegistry.tsx:498` | Changed to `initiatedDate` |
| `TeacherTransfer.fromSchoolId/toSchoolId` don't exist | `TeacherRegistry.tsx:500-501` | Changed to `sourceSchoolId/destinationSchoolId` |
| `selectedSchool.capacity` doesn't exist | `DataUpload.tsx:97` | Changed to `(infrastructure.classrooms || 8) * 45` |
| `school.id.split()` fails on number | `RecordsRegistry.tsx:100` | Added `String()` wrapper |
| `Learner` type missing `isRefugee`, `parentDetails`, etc. | `types.ts` | Added missing fields + `ParentDetails` interface |
| `Asset` type missing `serialNumber`, `lastAuditDate` | `types.ts` | Added missing fields |
| `PromotionRecord` missing `academicYear` | `types.ts` | Added optional field |
| Missing routes for `/publications`, `/notices` | `App.tsx` | Added routes + placeholder components |
| CSS typo: `-track-y-1/2` | `LearnerRegistry.tsx:183` | Fixed to `-translate-y-1/2` |
| Old Gemini API (`getGenerativeModel`) | `SchoolProfile.tsx:413` | Updated to `models.generateContent` |
| `Asset.status` → `Asset.condition` | `SchoolProfile.tsx:1269-1273` | Fixed property reference |
| `.finally()` not on Dexie union type | `SchoolProfile.tsx:1475` | Replaced with async/await pattern |
| `reduce` accumulator typed as `unknown` | `DataUpload.tsx:439` | Added explicit `<number>` generic |
| `key` prop missing from props interface | `TeacherRegistry.tsx:851` | Added `key?: React.Key` |

---

## 7. ARCHITECTURE PROBLEMS

### 7.1 No Backend (Critical)

The entire system runs on IndexedDB in the browser. This means:
- Data is isolated to a single browser on a single machine
- No multi-user access
- No data persistence across devices
- No backup mechanism
- Data lost on clearing browser storage
- No server-side validation

**Recommendation**: This is the single biggest architectural gap. The system needs a backend (Node.js + Express/Python + Django) with a proper database (PostgreSQL).

### 7.2 No State Management

The app relies entirely on React's `useState` and Dexie's `useLiveQuery`. There is no:
- Global state management (Redux, Zustand, Context)
- Request state tracking (loading/success/error)
- Cross-component communication for data changes

### 7.3 No API Abstraction Layer

Services like `analyticsService.ts` and `validationService.ts` talk directly to Dexie. There's no repository pattern or API abstraction, making future migration to a backend very difficult.

### 7.4 Mock Data Dependency

Many UI sections render hardcoded mock data instead of querying the database:
- `Dashboard.tsx` Enrollment Chart — hardcoded months/values
- `ZonalModule.tsx` — All charts use static arrays
- `SchoolProfile.tsx` — Inspection history is hardcoded
- `SchoolProfile.tsx` — Enrollment table inputs have `defaultValue={25}` and `defaultValue={28}`

### 7.5 No Error Boundaries

The app has zero React error boundaries. Any runtime error will white-screen the entire application.

---

## 8. SECURITY PROBLEMS

| Issue | Severity | Details |
|---|---|---|
| No Authentication | Critical | Anyone can access the system |
| No Authorization | Critical | No role-based access |
| Gemini API Key Exposure | High | `process.env.API_KEY` bundled in client JS |
| No Input Sanitization | Medium | All form inputs accept raw text |
| No XSS Protection | Medium | Report content rendered directly |
| No HTTPS Enforcement | Low | No fetch calls (IndexedDB only) |
| LocalStorage Secrets | High | Aggregate data stored in plain localStorage |
| No Session Management | Critical | Front-end toggle `showApp` is not a session |

---

## 9. PERFORMANCE PROBLEMS

| Issue | Details |
|---|---|
| No lazy loading | All components loaded eagerly |
| No code splitting | Single JS bundle (~1.5MB) |
| No pagination for large datasets | Learners table renders all records |
| No memoization on expensive renders | Several components recalculate on every render |
| Recharts bundles full library | Significant JS size for static charts |
| No bundle analysis | Potential for tree-shaking improvements |
| No image optimization | All images loaded from external URLs |
| No caching strategy | No service worker, no offline support beyond IndexedDB |

---

## 10. UI/UX CONSISTENCY ISSUES (No Redesign Required)

| Issue | Impact |
|---|---|
| `LandingPage.tsx` uses emerald/amber theme while app uses slate/blue | Visual inconsistency between public and authenticated areas |
| "Module under development" shown for missing routes | Unclear UX for placeholder views |
| Toast-only exports (no actual file saved) | Misleading UX |
| School header shows "Lilongwe Demonstration School" always | Not dynamic |
| `isDashboard` header only shown on root route | Other routes lack breadcrumbs |
| No loading skeletons — only `animate-spin` div | Skeleton loading would improve UX |
| No responsive tables | Tables don't horizontally scroll on mobile |
| Search inputs in some tables have no debounce | Excessive query execution |

---

## 11. DATABASE PROBLEMS

| Issue | Impact | Severity |
|---|---|---|
| No relational integrity enforcement | Deleting a school won't cascade to learners/teachers | High |
| `version(9)` — 9 schema versions | Indicates many iterations without cleanup | Medium |
| `TermlyReport.id` is a composite string | No auto-increment; fragile ID generation | Medium |
| No migration system | Schema changes require `deleteDatabase()` | Critical |
| No indexes on `auditLogs.performedBy` | Filtering by user will be slow | Low |
| `Infrastructure` table has no `schoolId` | Can't link infrastructure to schools | High |
| No `dateOfBirth` index on `learners` | Age-based queries will be slow | Low |
| `teacherTransfers` sort uses `initiatedDate` (number) | Correct after fix | Fixed |

---

## 12. PHASED IMPLEMENTATION ROADMAP

### Phase 0: Foundation (Week 1-2)
**Priority**: Critical  
**Complexity**: High  
**Risk**: High  
**Dependencies**: None  

| Task | Effort | Description |
|---|---|---|
| 0.1 | 5d | **Backend Architecture** — Set up Node.js/Express or Python/FastAPI project structure with PostgreSQL |
| 0.2 | 3d | **Database Migration** — Mirror Dexie schema to PostgreSQL with proper relations, foreign keys, cascades |
| 0.3 | 2d | **API Layer** — Create RESTful API endpoints for all CRUD operations matching existing Dexie queries |
| 0.4 | 3d | **Authentication** — Implement JWT-based auth with login, register, session refresh |
| 0.5 | 2d | **RBAC Models** — Create roles (Admin, Zonal, SchoolAdmin, Teacher, Viewer) with permission tables |
| 0.6 | 1d | **Error Boundaries** — Add React error boundary wrapper |

### Phase 1: Core Stabilization (Week 3-4)
**Priority**: High  
**Complexity**: Medium  
**Risk**: Medium  
**Dependencies**: Phase 0

| Task | Effort | Description |
|---|---|---|
| 1.1 | 3d | **API Integration** — Replace direct Dexie calls with API service functions (abstraction layer) |
| 1.2 | 2d | **Offline Fallback** — Keep Dexie as offline cache; API-first with IndexedDB fallback |
| 1.3 | 1d | **Loading States** — Add loading skeletons to all list/detail views |
| 1.4 | 1d | **Empty States** — Ensure all lists show helpful empty state messages |
| 1.5 | 1d | **Error States** — Add error display for failed API calls |
| 1.6 | 2d | **Data Sync Service** — Implement background sync between API and IndexedDB |

### Phase 2: Data Completeness (Week 5-6)
**Priority**: High  
**Complexity**: Medium  
**Risk**: Low  
**Dependencies**: Phase 1

| Task | Effort | Description |
|---|---|---|
| 2.1 | 2d | **Learner Edit** — Implement full edit modal with same fields as registration |
| 2.2 | 2d | **School Edit Form** — Add field validation, district-region auto-fill |
| 2.3 | 1d | **Delete Cascades** — Confirm before deleting schools/teachers with related records |
| 2.4 | 2d | **Promotion Records UI** — Add/add/edit/delete interface |
| 2.5 | 2d | **Exam Score Entry UI** — Add form for individual and bulk exam scores |
| 2.6 | 1d | **PSLCE Results UI** — Add entry interface |
| 2.7 | 2d | **Finance SIG Full CRUD** — Add edit/delete for finance records |
| 2.8 | 1d | **Assets CRUD** — Implement full asset management |
| 2.9 | 2d | **Inspections Module** — Full inspection record management |

### Phase 3: Workflow Completion (Week 7-8)
**Priority**: High  
**Complexity**: Medium  
**Risk**: Medium  
**Dependencies**: Phase 2

| Task | Effort | Description |
|---|---|---|
| 3.1 | 2d | **Transfer Approval Workflow** — Status transitions (Pending→Approved→Completed) |
| 3.2 | 2d | **Leave Approval Workflow** — Status transitions with email/SMS notification |
| 3.3 | 1d | **Termly Report Lock/Unlock** — Working lock with permission check |
| 3.4 | 2d | **Audit Log Integration** — Log every create/update/delete across all modules |
| 3.5 | 1d | **Dashboard Real Data** — Replace hardcoded chart data with live DB queries |
| 3.6 | 1d | **Multi-School Header** — Dynamic header showing selected school |

### Phase 4: Reports & Exports (Week 9-10)
**Priority**: Medium  
**Complexity**: High  
**Risk**: Medium  
**Dependencies**: Phase 2

| Task | Effort | Description |
|---|---|---|
| 4.1 | 3d | **XLSX Export** — Implement actual Excel export for all table views |
| 4.2 | 3d | **PDF Report Generation** — Generate PDF reports for school profile, termly data |
| 4.3 | 2d | **CSV Import** — Parse CSV/XLSX for bulk learner/teacher import |
| 4.4 | 2d | **Data Backup** — Export full IndexedDB data as JSON |
| 4.5 | 1d | **Data Restore** — Import JSON backup |
| 4.6 | 3d | **Print-optimized Views** — Add print stylesheets for reports |

### Phase 5: Analytics & Dashboards (Week 11-12)
**Priority**: Medium  
**Complexity**: High  
**Risk**: Medium  
**Dependencies**: Phase 1-2

| Task | Effort | Description |
|---|---|---|
| 5.1 | 3d | **Dynamic Charts** — Replace hardcoded chart data with real DB aggregation queries |
| 5.2 | 2d | **Year-over-Year Comparison** — Add trend views across academic years |
| 5.3 | 2d | **Data Completeness Dashboard** — Show submission rates per school/zone |
| 5.4 | 1d | **Zonal Ranking** — Rank schools by KPI metrics |
| 5.5 | 2d | **Export Dashboard** — Dashboard export to PDF/Image |

### Phase 6: Security & Permissions (Week 13-14)
**Priority**: High  
**Complexity**: High  
**Risk**: High  
**Dependencies**: Phase 0

| Task | Effort | Description |
|---|---|---|
| 6.1 | 2d | **Route Guards** — Protected routes based on auth/role |
| 6.2 | 2d | **UI Permission Guards** — Show/hide menu items, buttons based on role |
| 6.3 | 1d | **API Authorization** — Backend middleware for permission checking |
| 6.4 | 1d | **Input Sanitization** — Server-side sanitization for all inputs |
| 6.5 | 1d | **API Key Security** — Move Gemini key to backend proxy |

### Phase 7: Performance (Week 15)
**Priority**: Low  
**Complexity**: Medium  
**Risk**: Low  
**Dependencies**: Phase 1

| Task | Effort | Description |
|---|---|---|
| 7.1 | 1d | **Code Splitting** — Lazy-load components by route |
| 7.2 | 1d | **Virtual Scrolling** — For large tables (react-window) |
| 7.3 | 1d | **Debounced Search** — Add debounce to all search inputs |
| 7.4 | 0.5d | **useMemo/useCallback Audit** — Ensure expensive computations are memoized |
| 7.5 | 0.5d | **Bundle Analysis** — Analyze and optimize vendor bundle |

### Phase 8: Production Readiness (Week 16)
**Priority**: High  
**Complexity**: Low  
**Risk**: Low  
**Dependencies**: All prior phases

| Task | Effort | Description |
|---|---|---|
| 8.1 | 1d | **Environment Configs** — .env for dev/staging/production |
| 8.2 | 1d | **Build Pipeline** — Docker compose for backend + frontend |
| 8.3 | 1d | **CI/CD Setup** — GitHub Actions or similar |
| 8.4 | 1d | **Error Monitoring** — Sentry or similar integration |
| 8.5 | 0.5d | **Documentation** — README update with setup instructions |
| 8.6 | 0.5d | **Testing Strategy** — Set up Vitest for unit tests |
| 8.7 | 1d | **Database Migration Scripts** — Alembic/Prisma migrations |

---

## 13. IMPLEMENTATION PRIORITY MATRIX

```
Priority Legend: [C]ritical [H]igh [M]edium [L]ow

Task                          Impact    Effort    Priority
─────────────────────────────────────────────────────────
Backend Architecture          Critical  5d         C
Authentication & RBAC         Critical  5d         C
API Layer                     Critical  3d         C
Error Boundaries              High      1d         C
Offline-First Data Layer      High      3d         H
Learner Edit Modal            High      2d         H
Full Report Exports (XLSX)    Medium    3d         H
Delete Cascades               High      1d         H
Dynamic Charts (Real Data)    High      3d         H
Backup/Restore                Medium    2d         H
PDF Generation                Medium    3d         M
Performance Optimization      Low       3d         M
Testing Framework             Medium    2d         M
CI/CD Pipeline                Medium    1d         M
Mobile Responsiveness         Low       2d         L
```

---

## 14. RISK ANALYSIS

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Backend migration breaks existing UI** | Medium | High | Keep Dexie as fallback; dual-write during transition |
| **User adoption without auth** | High | Medium | Implement auth before deployment |
| **Data loss during IndexedDB → PostgreSQL migration** | Medium | High | Build export/import tool for seed data |
| **Gemini API key exposed in production** | High | High | Move AI calls behind backend proxy |
| **Large school dataset performance** | Medium | Medium | Implement pagination + virtual scrolling |
| **Browser compatibility issues** | Low | Medium | Test in Chrome/Firefox/Edge only |
| **No test coverage** | High | Medium | Start with critical path tests |

---

## 15. PRODUCTION READINESS CHECKLIST

### Must-Have Before Production

- [x] **Build succeeds with zero errors** — COMPLETE
- [x] **No TypeScript errors** — COMPLETE (exit code 0)
- [ ] **Authentication system** — NOT STARTED
- [ ] **Role-based access control** — NOT STARTED
- [ ] **Backend API** — NOT STARTED
- [ ] **Database (PostgreSQL)** — NOT STARTED
- [ ] **Error boundaries on all routes** — NOT STARTED
- [ ] **Loading states on all data fetches** — PARTIAL
- [ ] **Empty states on all lists** — PARTIAL
- [ ] **Input validation (frontend + backend)** — PARTIAL
- [ ] **Data export (real files)** — NOT STARTED
- [ ] **Data backup mechanism** — NOT STARTED
- [ ] **API key security** — NOT STARTED
- [ ] **HTTPS enforcement** — NOT STARTED
- [ ] **Session management** — NOT STARTED

### Should-Have

- [ ] **PDF report generation**
- [ ] **CSV/XLSX import**
- [ ] **Print-optimized views**
- [ ] **Responsive mobile layout**
- [ ] **Search debouncing**
- [ ] **Virtual scrolling for large datasets**
- [ ] **Code splitting / lazy loading**
- [ ] **Error monitoring (Sentry)**
- [ ] **CI/CD pipeline**
- [ ] **Unit tests for critical paths**
- [ ] **Docker setup**

### Nice-to-Have

- [ ] **Email/SMS notifications**
- [ ] **Dark mode**
- [ ] **PWA / offline support**
- [ ] **Real-time sync between users**
- [ ] **Advanced analytics with ML predictions**
- [ ] **Bulk SMS integration**
- [ ] **GIS mapping features**

---

## 16. TECHNICAL DEBT SUMMARY

| Area | Debt Level | Details |
|---|---|---|
| No Backend | Critical | Entire system is single-browser only |
| No Auth | Critical | Zero security |
| Hardcoded Data | High | 15+ locations with static mock data |
| No Tests | High | Zero test coverage |
| No State Management | Medium | useState sprawl |
| Direct DB Access | Medium | No repository/abstraction layer |
| Version 9 Schema | Low | Schema iterations without cleanup migration |

---

## 17. FINAL RECOMMENDATIONS

### Immediate (Week 1-2)

1. **Build the backend** — This is the single most critical gap. Without it, the system cannot be used in production. A Node.js/Express with PostgreSQL would be the most compatible choice since the frontend is already in JavaScript.

2. **Add authentication** — Implement JWT-based login before any real deployment. Without auth, the system has no users, no sessions, no security.

3. **Add error boundaries** — A React error boundary wrapper prevents white-screen crashes and provides graceful fallbacks.

### Short-term (Week 3-8)

4. **Create an API abstraction layer** — Wrap all Dexie calls in service functions that can switch between API and IndexedDB. This enables offline-first operation.

5. **Complete all CRUD UIs** — Implement editing for learners, full CRUD for assets, inspections, finance SIG, promotions, and exam scores.

6. **Implement real exports** — Add actual XLSX/CSV/PDF generation. Currently all export buttons show toast messages only.

7. **Real data for charts** — Replace static chart data with live database aggregations.

### Medium-term (Week 9-16)

8. **Implement RBAC** — Role-based access control across the entire UI and API.

9. **Add reporting engine** — School, zonal, and national-level reports with export capabilities.

10. **Performance optimization** — Code splitting, virtual scrolling, debouncing, memoization.

### Architectural Decision Required

**Should the system remain offline-first with IndexedDB sync, or become primarily server-based with offline fallback?**

For a school EMIS in Malawi where internet connectivity may be unreliable, the **offline-first** approach is recommended:
- IndexedDB serves as the primary data store
- Background sync pushes changes to the server when online
- Server acts as the centralized authority for multi-user data
- Conflicts resolved with "last-write-wins" initially, moving to CRDT later

This preserves the existing Dexie-based architecture while adding backend persistence.

---

## 18. SUMMARY OF PREVIOUS FIXES (This Session)

The following 12+ issues were identified and fixed during this audit session:

1. `types.ts` — Added missing Learner fields (`isRefugee`, `isOrphan`, `parentDetails`, `familiarLanguage`, `talents`) and `ParentDetails` interface
2. `types.ts` — Added missing Asset fields (`serialNumber`, `lastAuditDate`, `Repairable` condition)
3. `types.ts` — Added `academicYear` to `PromotionRecord`
4. `TeacherRegistry.tsx` — Fixed property references (`requestDate`→`initiatedDate`, `fromSchoolId`→`sourceSchoolId`, `toSchoolId`→`destinationSchoolId`)
5. `DataUpload.tsx` — Fixed `selectedSchool.capacity` (property didn't exist on School type)
6. `RecordsRegistry.tsx` — Fixed `school.id.split()` (number → string conversion)
7. `App.tsx` — Added routes for `/publications` and `/notices` (were falling through to catch-all)
8. `SchoolProfile.tsx` — Updated Gemini API from deprecated `getGenerativeModel` to `models.generateContent`
9. `SchoolProfile.tsx` — Fixed `Asset.status` to `Asset.condition`
10. `SchoolProfile.tsx` — Replaced broken `.finally()` with async/await pattern
11. `DataUpload.tsx` — Fixed `reduce` accumulator typing
12. `LearnerRegistry.tsx` — Fixed CSS typo `-track-y-1/2` → `-translate-y-1/2`
13. `TeacherRegistry.tsx` — Added `key?: React.Key` to TeacherCard props interface

**Build result**: Zero TypeScript errors, zero build errors.

---

*End of Audit Report*
