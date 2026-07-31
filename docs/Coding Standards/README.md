# GTM Smart Gate — Coding Standards & Conventions

## Golden Rules

1. **One Component Per File** — Never export multiple UI components from a single file.
2. **One Responsibility Per Module** — Controllers parse HTTP, Services contain logic, Repositories run SQL.
3. **No Business Logic in Routes** — Routes are strictly mount declarations.
4. **No Direct DB Calls in Controllers** — All data access goes through Repositories.
5. **No API Calls Inside React Components** — Use services layer and custom hooks.

---

## Frontend Naming Conventions

| Element            | Convention           | Example                        |
|--------------------|----------------------|--------------------------------|
| React Component    | PascalCase           | `CustomerDetailsPage.jsx`      |
| Custom Hook        | `useCamelCase`       | `useModal.js`                  |
| CSS Class          | `kebab-case`         | `.page-header-bar`             |
| Constants File     | `camelCase`          | `routes.js`, `api.js`          |
| Mock Data          | `camelCase.json`     | `customers.json`               |

## Backend Naming Conventions

| Element            | Convention           | Example                           |
|--------------------|----------------------|-----------------------------------|
| Controller         | `entity.controller.js` | `customer.controller.js`        |
| Route File         | `entity.routes.js`   | `customer.routes.js`              |
| Service            | `entity.service.js`  | `customer.service.js`             |
| Repository         | `entity.repository.js` | `customer.repository.js`        |
| Model / Schema     | `entity.model.js`    | `customer.model.js`               |
| Middleware         | `name.middleware.js` | `auth.middleware.js`              |

## Commit Message Format (Conventional Commits)

```
feat(customers): add 4-step creation wizard
fix(auth): handle expired JWT refresh token gracefully
chore(deps): upgrade react-router-dom to v6.24
docs(api): document /customers endpoint response schema
refactor(sidebar): extract nav group into NavGroup component
```
