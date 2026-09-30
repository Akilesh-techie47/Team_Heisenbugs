# LostFound+ — Full File, Folder & Code Structure

> Stack: React 19 + Vite 8 + Tailwind 4 (frontend :5173) + Express 4 + JWT + bcrypt (backend :5000). No DB — in-memory arrays + frontend localStorage fallback.
> Workflow: `Report(lost/found) → Auto-Match(suggested) → Claim(PENDING) → Admin Approve/Reject → Handover OTP → COMPLETED/RECOVERED → Story + Audit + Notification`
> Run: `npm run install:all` then `npm run dev`. Frontend `http://localhost:5173`, Backend `http://localhost:5000/api/health`.
> Demo: User `alex.rivera@campus.edu / password123`, Admin `a.vance@campus.admin.edu / adminpassword123` (admin only via `/admin/login`).

## 0. Root tree

```
Project demo_02/
  package.json            # orchestrator, workspaces [frontend,backend], concurrently
  tsconfig.json           # references only: frontend + backend
  .env / .env.example     # LEGACY (use backend/.env + frontend/.env now)
  .gitignore              # node_modules/, dist/, .env*
  README.md / metadata.json / bun.lock / package-lock.json
  frontend/               # all client code
  backend/                # all server code
```

### Root `package.json`
- `name: lostfound-plus`, `workspaces:[frontend,backend]`.
- Scripts: `dev` = `concurrently dev:backend + dev:frontend`; `dev:frontend` = `npm --prefix frontend run dev`; `dev:backend` = `npm --prefix backend run dev`; `build` = frontend build; `start` = backend start; `lint`, `install:all`.
- Deps: only `concurrently@9`. All real deps moved to frontend/backend package.json.

### Root `tsconfig.json`
- `{files:[], references:[frontend,backend]}` — no direct compile, editor only.

---

## 1. `backend/` — Express API (port 5000)

```
backend/
  server.ts               # entire API + data stores + auth + routes (1198 lines)
  package.json            # express, jsonwebtoken, bcryptjs, cors, dotenv | dev: tsx, typescript, @types/*
  tsconfig.json           # ES2022, bundler, include:[server.ts], noEmit
  .env / .env.example     # PORT=5000, JWT_SECRET, GEMINI_API_KEY, APP_URL, FRONTEND_URL=5173
```

### `backend/package.json` — code used
- `dependencies`: `express` (routing), `jsonwebtoken` (sign/verify 7d tokens), `bcryptjs` (hashSync/compareSync passwords), `cors` (allow 5173), `dotenv` (load .env).
- `devDependencies`: `tsx` (run TS directly), `typescript`, `@types/express/jsonwebtoken/bcryptjs/cors/node`.
- Scripts: `dev/start: tsx server.ts`, `lint: tsc --noEmit`.

### `backend/server.ts` line-by-line
- `1-7`: `import express, path, url(fileURLToPath), jwt, bcrypt, dotenv, cors`. Removed old `vite` middleware import after split.
- `9-12`: `dotenv.config({path: cwd/.env}); dotenv.config(); __filename/__dirname` via `import.meta.url`.
- `14-22`: `PORT=5000`, `JWT_SECRET` fallback, `FRONTEND_URL`, `cors({origin:[5173,3000]})`, `express.json()`, `GET /api/health → {status:ok}`.
- `22-94` `users[5]`: `USR-001..004 USER/password123` (Alex, Elena, Marcus, Jordan with name/email/passwordHash/role/dept/avatar/phone/counts) + `USR-ADM ADMIN/adminpassword123` (Dr. Arthur Vance). Comment: admin never via signup.
- `96-198` `items[4]`: fields `id(LF-2026-XXX), userId, type(lost/found), title, category, brand, color, location, building, date, time, description, distinguishingFeatures, privateVerificationInfo, securityQuestion/Answer, contactName/Email/Phone, status(ACTIVE/CLAIMED/RECOVERY_AUTHORIZED/RECOVERED), custodyStatus, dropOffLocation, createdAt`. Seeds: 001 lost backpack ↔ 002 found daypack, 003 lost earbuds ↔ 004 found earbuds.
- `200-275` `claims[2]`: `CLM-7801 APPROVED OTP 482910` + `CLM-7802 PENDING OTP 918234`. Fields `itemId/Title/Category, claimantId/Name/Email/Phone, finderName, dropOffLocation, status, reviewedBy/At, handoverOtp/qrCodeString, evidence{lastSeenLocation,lostTime,contents,marks,accessory,serial}, proofSubmitted, adminNotes, timeline[5 steps], createdAt`.
- `277-294` `matches[1]`: `MATCH-001 lost 001↔found 002, 94%, status suggested, matchedOn[4], notes, detectedAt`.
- `296-328` `notifications[3]`: `NOTIF-001 CLAIM_APPROVED, 002 POTENTIAL_MATCH, 003 CLAIM_SUBMITTED` for USR-001 with `type/title/message/read/link/createdAt`.
- `330-354` `auditLogs[2]`: `AUD-9912 CLAIM_APPROVED, 9911 REPORT_VERIFIED` with `actor/actorId/action/entity/entityId/timestamp/details/result`.
- `356-379` `recoveredStories[2]`: `REC-091/092` with `title/category/owner/finder/timeToRecover/date/testimonial/badge`.
- `383-432` Middleware: `AuthenticatedRequest{user{id,email,role,name}}`; `requireAuth` checks `Bearer`, `jwt.verify`, 401; `requireAdmin` checks `role==='ADMIN'` 403; `sanitizeItemForUser` returns full if ADMIN/owner else strips `privateVerificationInfo,securityAnswer`.
- `437-477` `POST /api/auth/register`: validate fullName/email/password, 409 if exists, force `role:USER`, hash, push, sign 7d, return user+token.
- `480-517` `POST /api/auth/login`: validate, find user, block ADMIN→403 to `/admin/login`, `bcrypt.compareSync`, sign `role:USER`.
- `520-561` `POST /api/auth/admin-login`: reject non-ADMIN 403, verify, sign `role:ADMIN`, push `AUDIT ADMIN_LOGIN`.
- `564-572` `GET /api/auth/me` (auth): return user sans hash.
- `577-612` `GET /api/items?type,category,query`: optional JWT decode, sanitize each, filter.
- `615-632` `GET /api/items/:id`: sanitize single.
- `635-693` `POST /api/items` (auth): gen `LF-2026-XXX`, set `custodyStatus`, unshift, auto-match partner (`type!=` + `category==`/`building==`) → `MATCH-XXXX 82-97%` + `POTENTIAL_MATCH` notif.
- `696-712` `DELETE /api/items/:id` (auth): owner or ADMIN.
- `717-726` `GET /api/matches`, `DELETE /api/matches/:id` (auth).
- `731-740` `GET /api/claims` (auth): ADMIN all, USER own by id/email.
- `743-802` `POST /api/claims` (auth): gen OTP, `LF-HANDOVER-otp`, force `PENDING`, timeline, item `ACTIVE→CLAIMED`, `CLAIM_SUBMITTED` notif.
- `807-825` `GET /api/admin/dashboard` (auth+admin): counts pending/approved/reports/users.
- `828-857` `GET /api/admin/users|items|claims|claims/:id|matches` (admin): full private data.
- `860-916` `PATCH /api/admin/claims/:id/approve` (admin): `APPROVED`, timeline verify, item `RECOVERY_AUTHORIZED`, `CLAIM_APPROVED` notif with OTP, audit.
- `919-967` `PATCH /api/admin/claims/:id/reject` (admin): `REJECTED`, item `CLAIMED→ACTIVE`, notif+audit.
- `970-1040` `POST /api/handover/verify {claimId,inputOtp}` (auth): find by id/otp, require APPROVED, check otp or `123456` master, `COMPLETED`, item `RECOVERED`, new `REC-XXX` story, notif+audit.
- `1043-1091` `PATCH /api/admin/recovery/:id/confirm` + `/items/:id/recovery` (admin): manual RECOVERED + audit.
- `1094-1141` `DELETE /api/admin/items/:id`, `GET /api/admin/analytics` (totals + category/status breakdown + recoveryRate), `GET /api/admin/audit`.
- `1146-1173` `GET /api/notifications`, `PATCH /:id/read`, `PATCH /read-all`, `GET /api/recovered` (auth).
- `1175-1198` `startServer()`: serve `../frontend/dist` statically if exists (prod), else pure API; `listen 0.0.0.0:PORT`.

---

## 2. `frontend/` — React SPA (port 5173)

```
frontend/
  index.html              # Vite entry, fonts, #root
  vite.config.ts          # react+tailwind, @->./src, proxy /api->5000
  package.json            # react, vite, tailwind, axios...
  tsconfig.json           # allowJs, react-jsx, @/*->src/*
  .env / .env.example     # VITE_API_URL=http://localhost:5000
  src/
    main.jsx              # createRoot render
    App.jsx               # router + guards
    index.css             # tailwind theme tokens
    services/api.js       # axios + localStorage fallback (605 lines)
    data/mockData.js      # seed items/matches/claims/users (579 lines)
    context/AuthContext.jsx + DataContext.jsx
    components/layout/ (Layout,Navbar,Footer)
    components/common/ (Badge,ItemCard,StatCard)
    components/verification/ (ClaimModal,ItemDetailModal)
    components/search/ (Search,SearchMethodSelector,SearchAnimation,ItemDetails,MatchCard,Matches)
    pages/ (13 pages)
    assets/images/ (5 jpgs: hero, backpack, earbuds, wallet, keys)
```

### `frontend/index.html` (21 lines)
- `6-11` title/meta `LostFound+`, fonts `Plus Jakarta Sans + JetBrains Mono` via Google Fonts.
- `16-18` body classes `bg-[#F7F8FA]`, `#root` div, `script /src/main.jsx`.

### `frontend/vite.config.ts` (28 lines)
- `1-4` imports `tailwindcss, react, path, defineConfig`.
- `8` plugins `[react(), tailwindcss()]`.
- `11` alias `@ → ./src` via `import.meta.dirname` (fixed Vite8 `__dirname` warning).
- `14-24` server `port 5173`, `proxy /api → VITE_API_URL||5000`, HMR toggle via `DISABLE_HMR`.

### `frontend/package.json`
- Deps: `react/react-dom@19`, `react-router-dom@7`, `axios`, `lucide-react` (icons), `motion` (animations), `@tailwindcss/vite+tailwindcss@4`, `@google/genai`.
- Dev: `vite@8`, `@vitejs/plugin-react@6`, `esbuild@0.28.2` (fixed Vite8 peer), `typescript`, `@types/*`, `autoprefixer`.
- Scripts: `dev: vite`, `build: vite build`, `preview`, `lint: tsc --noEmit`.

### `frontend/src/main.jsx` (10 lines)
- Imports React, createRoot, App, index.css; renders `<StrictMode><App/></StrictMode>` to `#root`.

### `frontend/src/App.jsx` (170 lines)
- `1-20` imports BrowserRouter, Auth/Data providers, Layout, 12 pages.
- `22-36` `ProtectedRoute`: unauth→`/login`, admin→`/admin`.
- `39-76` `AdminProtectedRoute`: unauth→`/admin/login`, non-admin→403 page with links.
- `78-170` Routes inside `<Layout>`: public `/, /login, /admin/login, /register`; protected `/home/report/search/matches/claims/handover/recovered`; admin `/admin`; `/moderator→/admin`; `*→/`.

### `frontend/src/index.css` (23 lines)
- `@import tailwindcss`; `@theme` tokens `--font-sans/mono, --color-primary-blue #199FEF, light-blue, brand-black #15161A, grays, border, bg, success, danger`; body font/bg.

### `frontend/src/services/api.js` (605 lines) — dual backend+localStorage
- `1-22` imports mockData, `STORAGE_KEYS` 9 keys (ITEMS, CLAIMS, MATCHES, MODERATION, RECOVERED, AUTH, TOKEN, NOTIFS, AUDIT).
- `25-48` `initStorage()` seeds localStorage if empty.
- `51-65` `apiClient = axios.create({baseURL: VITE_API_URL||5000})` + interceptor adds `Bearer` token.
- `68-74` `asyncSimulate(cb,80ms)` fallback helper.
- `78-204` `auth.login/adminLogin/register/getCurrentUser/getMe/logout`: try backend, on fail fabricate `jwt-token-*` locally; admin fallback checks email contains admin/vance.
- `208-311` `items.getAll/getById/create/delete`: backend + localStorage mirror + client auto-match.
- `314-461` `matches.getAll/dismiss`, `claims.getAll/create/approve/reject`.
- `464-517` `handover.verifyOtp`: backend, fallback checks otp or `123456`, marks COMPLETED/RECOVERED + story.
- `520-604` `admin.getDashboard/getUsers/getItems/getClaims/getAnalytics/getAuditLogs/deleteItem/confirmRecovery`, `notifications.getAll/markAsRead/markAllAsRead`, `recovered.getAll`.

### `frontend/src/data/mockData.js` (579 lines)
- `8-28` `ASSET_IMAGES{hero,backpack,earbuds,wallet,keys}`, `CATEGORIES[11]`, `LOCATIONS[9]`.
- `42-374` `INITIAL_ITEMS[15]`: 001-008 detailed (security Q/A, image, custody), 009-015 catalog fillers.
- `376-422` `INITIAL_MATCHES[3]` 94/91/96%; `424-479` `INITIAL_CLAIMS[2]`; `481-540` `INITIAL_RECOVERED[3]` + `MODERATION_QUEUE[2]`; `542-579` `DEMO_USERS{user,moderator,admin}`.

### Contexts
- `context/AuthContext.jsx` (110 lines): `currentUser=api.auth.getCurrentUser()`; `useEffect getMe()` validates; `login/adminLogin/register/logout` set state; `roleNormalized`, `isAdmin`; provides `{currentUser,role,isAdmin,isAuthenticated,isLoading,...}`.
- `context/DataContext.jsx` (155 lines): states items/matches/claims/notifs/audit/analytics/users/stories/loading; `refreshAllData` Promise.all + admin extra; `createItem/createClaim/approve/reject/delete/dismiss/executeHandover/adminConfirmRecovery/markRead` all refresh.

### `components/layout/`
- `Layout.jsx` (16): flex column `Navbar + Outlet + Footer`.
- `Navbar.jsx` (535): brand `LostFound+` + ADMIN badge; nav per role (admin 9 `?tab=` links, user 7, guest 3); bell with unread + dropdown + markRead; profile avatar/dropdown + logout→`/login`; mobile drawer.
- `Footer.jsx` (64): 4 cols Platform/Verification/Custody addresses + bottom bar.

### `components/common/`
- `Badge.jsx` (46): `StatusBadge{type,text}` — lost red, found blue, recovered green, potential_match amber.
- `ItemCard.jsx` (113): image+fallback, Badge+ID, category/date/time, title, location, desc, footer `View Specs` + `Claim This` (found only) or Reward.
- `StatCard.jsx` (33): `label/value(mono)/subtext/icon/trend`.

### `components/verification/`
- `ClaimModal.jsx` (321): evidence state 10 fields; `getCategorySpecificLabel()` per category (serial/contents/cards/fobs); `handleSubmit` requires marks/contents/answer → `createClaim` → onSuccess; UI header, disclaimer, item banner, 5 signals, security challenge, phone+desk, PENDING footer.
- `ItemDetailModal.jsx` (209): header Badge+ID, image+title/desc/brand/color/category, location/time grid, distinguishingFeatures, custody/dropOff/reward, footer Claim (found) / I Found (lost).

### `components/search/`
- `Search.jsx` (708): state machine `select_method→input_form→cinematic_analysis→results`; image upload/sample + details form; `handleAnalysisComplete` builds 91/94/92% candidates (LF-009 primary, LF-010 secondary); results side-by-side + MatchCards + ItemDetails + ClaimModal.
- `SearchMethodSelector.jsx` (125): 3 cards image/details/both + no-photo banner.
- `SearchAnimation.jsx` (282): steps per mode, cycles 5 candidate images every 180ms, steps every 700ms, `onComplete` 3900ms; split view or pipeline stepper.
- `ItemDetails.jsx` (254): XX% header, side-by-side, signal grid, reasons, privacy notice, footer.
- `MatchCard.jsx` (103): image + FOUND + XX%, meta, pills, View/Claim.
- `Matches.jsx` (104): maps raw matches → MatchCard format.

### `pages/` (13)
- `LandingPage.jsx` (301): hero CTAs + 98.4%/<18h/1200+ stats + 4 image cards; 4-steps Report/Find/Verify/Recover; CTA.
- `LoginPage.jsx` (283): split brand + form, validate email/pwd≥4, `login→/home`, QuickFill Alex, links.
- `AdminLoginPage.jsx` (236): same split, `adminLogin→/admin`, QuickFill Vance.
- `RegisterPage.jsx` (353): fullName/email/dept/pwd/confirm/terms, `register→/home`, role locked Student.
- `HomePage.jsx` (226): welcome + Report/Search, match banner, 4 StatCards, tabs recent/my_reports, ItemCards + modals.
- `ReportPage.jsx` (630): lost/found toggle, 4 sections Specs/Location/Photo+Security/Contact, sample images, `createItem→modal ID`.
- `SearchPage.jsx` (382): tabs matcher/catalog; catalog search + grid/table + status/category/location filters + table; modals.
- `MatchesPage.jsx` (155): MatchCard grid + empty state + modals.
- `ClaimsPage.jsx` (295): filter all/PENDING/APPROVED/COMPLETED; card header+timeline+evidence+contacts+OTP box (LOCKED until approved) + Handover button.
- `HandoverPage.jsx` (265): claimId+otp inputs (default CLM-8812/482910), `executeHandover`, pending pickups list, success receipt REC-XXXX.
- `RecoveredPage.jsx` (155): metrics 1248/98.4%/45m/430+, search, story cards, CTA.
- `ModeratorPage.jsx` (212): LEGACY queue (uses missing `moderationQueue` — dead, redirected `/moderator→/admin`).
- `AdminPage.jsx` (1609): 8 tabs `?tab=pending/claims/lost/found/recovery/users/analytics/audit`; pending list, claims evidence-vs-private + Approve/Reject, lost/found tables + delete, recovery OTP terminal + cases, users, desks + category bars, audit table, Case Dossier modal (Side A claimant / Side B finder+private) + reject modal.

### Assets
- `assets/images/`: `hero_lost_items_*.jpg`, `item_backpack_*.jpg`, `item_earbuds_*.jpg`, `item_wallet_*.jpg`, `item_keys_*.jpg` — imported in mockData as `ASSET_IMAGES`.

## 3. Ports, env & commands
- Backend `:5000` (`backend/.env` PORT, JWT_SECRET, FRONTEND_URL). Frontend `:5173` (`frontend/.env` VITE_API_URL). Proxy `/api→5000` in vite.config.
- `npm run install:all`, `npm run dev` (both), `dev:frontend/backend`, `build` (frontend/dist), `start` (backend + dist), `lint`.
