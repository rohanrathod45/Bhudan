# 🌏 BhuDan — Hazard Risk & Relocation Decision Support

A SIH 2026 competition-ready decision-support platform for:
**Intelligent Identification of Hazard-Based Red Zones, Carrying Capacity Assessment, and Immediate Relocation Needs for Vulnerable Habitations.**

> The system answers: **Where is the danger? → Who is vulnerable? → How serious is the risk? → Can safer locations accommodate them? → Where should they relocate? → Who should be prioritized?**

## Stack
##

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, React-Leaflet, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose (**optional**) — runs out-of-the-box in in-memory demo mode |
| Maps | Leaflet / React-Leaflet |
| Charts | Recharts |
| Auth | JWT + bcrypt, role-based access |
| VCS | Git + GitHub |
| Deploy | Render / Vercel friendly |

## Architecture

```
server/
├── index.js              # entry — connects DB, seeds demo data, mounts routes
├── config/               # db.js (Mongo connect w/ demo fallback), roles.js
├── models/               # Mongoose schemas (User, Habitation, SafeSite, Relocation)
├── middleware/           # auth.js (JWT verify + role authorize), error handlers
├── data/
│   ├── districtList.js   # ~100 districts across every Indian state & UT
│   ├── india.js          # deterministic nationwide habitation/site generator
│   └── seedData.js      # demo dataset (nationwide, incl. curated Kerala)
├── services/             # the AI engines:
│   ├── hazards.js        # hazard catalogue (4 default + 6 extensible)
│   ├── riskEngine.js     # red-zone scoring → GREEN/YELLOW/ORANGE/RED
│   ├── vulnerabilityEngine.js
│   ├── capacityEngine.js
│   ├── relocationEngine.js
│   └── analysisService.js
├── dataAccess.js         # unified store (in-memory demo ↔ MongoDB)
├── controllers/          # auth, data, analysis, relocation, user
├── routes/               # RESTful API
└── scripts/seedMongo.js
client/                   # React + Vite + Tailwind (pages, map, charts, auth)

Demo mode vs production
-----------------------
`server/.env` ships with an empty `MONGO_URI`. When absent the API uses a
seeded in-memory store, so it runs immediately with no external infra.
Set MONGO_URI=mongodb://localhost:27017/bhudan and the same code path switches
to Mongo automatically; `npm run seed` populates it.

## Run (demo mode)

```bash
# terminal 1 — backend (API on http://localhost:5000)
cd server
npm install
npm start

# terminal 2 — frontend (UI on http://localhost:5173)
cd client
npm install
npm run dev
```

> From the repo root you can use the workspace scripts instead:
> `npm start` (backend) and `npm run dev` (frontend).
> `npm run dev:server` runs the backend with nodemon auto-restart.

Sign in with `GET /api/auth/demo` → e.g. `admin@bhudan.gov.in / Admin@12345`.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bhudan.gov.in | `Admin@12345` |
| Disaster Authority | collector@bhudan.gov.in | `Disaster@12345` |
| Analyst | analyst@bhudan.gov.in | `Analyst@12345` |
| Field Officer | field@bhudan.gov.in | `Field@12345` |
| Viewer | viewer@bhudan.gov.in | `Viewer@12345` |

## API (summary)

- `/api/auth/login` · `/register` · `/me` · `/demo`
- `/api/habitations` & `/sites` (GET list/detail; POST/PUT/DELETE need Analyst+)
- `/api/analysis/district` · `/habitation/:id` · `/red-zones` · `/capacity` · `/relocation` · `/hazards` · `/meta` · `/districts`
- `/api/relocation/generate` (POST, Analyst+) · `/:id/status` (PATCH, Disaster Authority+)
- `/api/users` (Admin only)

## The Decision-Support Pipeline (deterministic)

1. **Multi-Hazard Analysis** — exposure to any registered hazard (flood, landslide, coastal_erosion, cloudburst; plus earthquake, cyclone, wildfire, drought, heatwave, avalanche already registered and ready for data).
2. **Risk Score** (0–100) = `0.32·hazard + 0.22·exposure + 0.18·vulnerability + 0.18·infrastructure + 0.10·terrain`, rescaled 0–100, with a recency/intensity boost for major recent events.
3. **Red-Zone Detection** — GREEN (<30) · YELLOW (30–54) · ORANGE (55–69) · RED (≥70).
4. **Vulnerability** (0–100, Low/Moderate/High/Critical) — vulnerable-population share, infrastructure, accessibility, distance-to-services, history.
5. **Carrying Capacity** — per-site available vs. demand → deficit/surplus; district-level sufficiency.
6. **Relocation** — priority ranking + greedy nearest-safe-site assignment (distance + ETA).
7. **Report** — every result surfaces data source, last-updated time, confidence band and explicit limitations.

> ⚠️ The risk scores are a **transparent decision-support heuristic, not a forecast**. Each result carries `confidence` and `limitations` and never claims guaranteed prediction.

## Verified live (demo mode)

```text
DISTRICTS: 103 across every Indian state & UT (from /api/analysis/districts)
Seeded  : 5 users · 300 habitations · 212 safe sites
Wayanad (curated Kerala): red=1 org=2 yel=1 grn=0
Hyderabad: analysis + relocation pipeline runs nationwide
```

> The dataset covers all states & union territories. The 5 Kerala districts retain
> their hand-tuned records; every other district gets deterministic generated data
> (same output on each seed).

## Status

- ✅ **Frontend complete & builds** — `vite build` passes (947 modules, production). Pages: Login, Register, Dashboard, GIS Map, Red Zones, Habitations (+ detail), Safe Sites, Carrying Capacity, Relocation, Reports (approval workflow), Admin. AuthContext, Axios client, protected routes, maps + charts wired to the API.
- ✅ Backend core: live-verified end-to-end (auth, 5 roles, 4 AI engines, full red-zone → vulnerability → capacity → relocation pipeline, Mongo-ready store).
- 🧪 Tests / CI & deployment config: next, if desired.