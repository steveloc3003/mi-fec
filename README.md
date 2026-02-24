# MI-FEC (VManager Demo)

## 1. Project Purpose

`mi-fec` is a small front-end demo for managing videos, authors, and categories.

This project is designed to show:

- clean feature-based architecture
- practical React + TypeScript patterns
- CRUD workflows (list, add, edit, delete)
- reusable UI components
- testable business logic

## 2. Technology Stack

- `react` + `react-dom` (UI)
- `typescript` (type safety)
- `react-scripts` (CRA build tooling)
- `react-router-dom` (routing)
- `react-hook-form` (forms + validation)
- `json-server` (mock REST API)
- `jest` + `@testing-library/*` (testing)
- `playwright` (end-to-end testing)
- CSS Modules (scoped styling)

## 3. Why These Libraries

- **React**: fast UI delivery and component-based design
- **TypeScript**: fewer runtime bugs, easier refactor
- **React Router**: clear page navigation and route ownership
- **React Hook Form**: simple, performant form state/validation
- **json-server**: fast mock backend for demos and local development
- **Testing Library + Jest**: behavior-focused tests for confidence
- **CSS Modules**: avoids global CSS conflicts

## 4. Architecture & Code Structure

This codebase uses feature-first organization, with shared cross-feature utilities/components.

```text
src/
  app/                    # app-level route composition
  common/                 # shared interfaces/types
  features/videos/        # video feature (pages, components, services, tests)
  layouts/                # shell layout (header/main/footer)
  pages/                  # app-level pages (about, faq, not-found)
  shared/
    components/           # reusable UI components
    utils/                # shared utilities (date, error mapping)
```

### Why this structure

- Feature code stays together for maintainability
- Shared code is explicit and reusable
- Routing is centralized in one place for visibility
- Tests are colocated by domain for easier coverage tracking
- Nested backend DTO handling is encapsulated in a dedicated adapter layer

### Videos service architecture

`features/videos/services/` is split by responsibility:

- `api.ts`: raw HTTP calls
- `adapters.ts`: normalization and author patch builders
- `helpers.ts`: pure utilities (e.g. highest quality format)
- `videos.ts`: orchestration/repository-style feature operations

This keeps UI/components independent from backend nested shape (`authors[].videos[]`).

## 5. API/Data Model

- Mock API source: `db.json`
- API runs on port `3001`
- Main entities:
  - `Author` (contains nested `videos`)
  - `Video`
  - `Category`

Environment:

- `.env` contains `REACT_APP_API` (base API URL)

## 6. Run The Project

Prerequisites:

- Node.js (LTS recommended)
- Yarn 1.x

Install and run:

```bash
yarn install
yarn start
```

This starts:

- `json-server` at `http://localhost:3001`
- React app (default CRA port, usually `http://localhost:3000`)

## 7. Other Commands

```bash
yarn test
yarn build
yarn e2e
yarn e2e:ui
yarn e2e:headed
```

E2E setup (first time):

```bash
yarn install
yarn playwright install
```

## 8. Testing Strategy

Current tests cover:

- reusable/pure service helper logic
- adapter logic (normalization + mutation patch builders)
- service workflows (fetch/map/update/delete behaviors)
- failure paths (not found, invalid operations, fetch failures)
- form behavior and submit flows
- table behavior
- not-found routing behavior
- E2E user flows: add/edit/delete + not-found + selected failure cases

## 9. Important Compatibility Note

This project is pinned to:

- `typescript: 4.9.5`

Reason:

- `react-scripts@5` and its ESLint tooling are not fully compatible with TypeScript 5.x in this setup.

## 10. Technical Decisions

- Edit/delete routes are scoped with both `authorId` and `videoId` to avoid ambiguous operations.
- Shared utility functions are centralized (`shared/utils`) to reduce duplication.
- Reusable UI primitives are centralized (`shared/components`) for consistency.
