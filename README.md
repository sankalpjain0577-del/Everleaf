# Everleaf — AI Wedding Gallery

A shared wedding photo gallery. Guests upload from their phones, the app scores
burst uploads for sharpness to surface a "best shot," and guests can find every
photo they appear in with a selfie search powered by face-api.js.

## What's actually built (read this first)

The source PDF asked for a 40–60 page enterprise spec (full auth system, multi-tier
dashboards, payments, Docker, CI/CD, bride/groom auto-separation AI, guest face
search, best-shot detection). That's too much for one deliverable, so this is a
**working MVP** that implements the real core of every section at a smaller scale:

| Section from the PDF | What's implemented |
|---|---|
| Authentication | Email/password, JWT, roles: `couple`, `guest` |
| Dashboards | Couple dashboard with event code, photo counts, best-shot counts |
| Pricing plans | Free / Plus / Premium tiers (display only — no payment gateway wired up) |
| Gallery & Storage | Multer file uploads stored on disk, SQLite metadata |
| Best-shot detection | Real Laplacian-variance sharpness scoring (via `sharp`), sharpest photo per upload batch is flagged |
| Guest selfie face search | Real face detection + 128-d face descriptors via `face-api.js` (client-side), Euclidean-distance matching on the server |
| Bride & Groom separation | Same face-descriptor pipeline — clusters of matching faces can be labeled by the couple (the label step isn't built as a UI yet; descriptors and matching are) |
| Backend architecture / API / DB | Express + SQLite (`better-sqlite3`), documented below |
| Responsive design | Tailwind, mobile-first |
| Deployment | Docker Compose + step-by-step cloud deploy below |

Not included: payment processing, admin role UI, email notifications, automated
tests, CI/CD pipeline. These are straightforward to add on top of this scaffold —
ask if you want any of them built out next.

## Project structure

```
wedding-gallery/
├── backend/           Express API + SQLite + file uploads
│   ├── server.js
│   ├── db.js
│   ├── routes/         auth.js, gallery.js, pricing.js
│   ├── middleware/auth.js
│   └── uploads/         uploaded photos land here
├── frontend/           React (Vite) + Tailwind
│   └── src/
│       ├── pages/       Landing, Login, Register, Pricing, Dashboard, Gallery, Upload, FaceSearch
│       ├── components/  Navbar, ProtectedRoute
│       └── context/     AuthContext
├── docker-compose.yml
└── README.md (this file)
```

---

## Run it locally (fastest way to see it working)

Requires **Node.js 18+**.

**Terminal 1 — backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run start
```
The API runs at `http://localhost:5000`.

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. The dev server proxies `/api` and `/uploads`
to the backend automatically (see `frontend/vite.config.js`), so no extra
configuration is needed.

**Try it:**
1. Register as "I'm the couple" — you'll get an event code (e.g. `6Z8E62`).
2. Open a second browser (or incognito window), register as "I'm a guest" using that code.
3. As the guest, go to Upload and add a few photos of the same face together (a "burst") — the sharpest one is auto-flagged ★ best shot, and faces get tagged for search.
4. Go to "Find My Photos" and upload a selfie — it'll match against tagged faces in the gallery.

---

## Run it with Docker (one command, closer to production)

Requires **Docker** and **Docker Compose**.

```bash
docker compose up --build
```
- Frontend (served by nginx, proxies API calls internally): `http://localhost:8080`
- Backend API directly: `http://localhost:5000`

Data persists in named Docker volumes (`backend_uploads`, `backend_db`) across restarts.
To reset everything: `docker compose down -v`.

---

## Make it accessible anywhere, anytime

You have two real options depending on how permanent you need this to be.

### Option A — Quick share (minutes, temporary)
Good for testing with a few guests today, not for the actual wedding.

1. Run the app locally (`docker compose up --build`, or the two-terminal setup above).
2. Install [ngrok](https://ngrok.com/download) and run:
   ```bash
   ngrok http 8080
   ```
3. Ngrok gives you a public URL like `https://random-name.ngrok-free.app` — share that. It stays live only while your computer and ngrok session are running.

### Option B — Real deployment (permanent, recommended)
Deploy backend and frontend as two small cloud services. Free tiers exist on
**Render**, **Railway**, and **Fly.io** — steps below use Render as an example,
the others are nearly identical.

**1. Push this project to a GitHub repo.**

**2. Deploy the backend:**
- On Render: New → Web Service → connect your repo → root directory `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Add environment variables: `JWT_SECRET` (a long random string), `CLIENT_ORIGIN` (your frontend's URL, set after step 3)
- **Important:** the free tier's disk is not persistent — for a real wedding, add a persistent disk (Render supports this on paid plans) or switch photo storage to S3/Cloudinary before the event. SQLite also needs a persistent disk for the same reason.

**3. Deploy the frontend:**
- On Render (or Vercel/Netlify, which are great for static React builds): New → Static Site → root directory `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Add a rewrite/proxy rule (or an environment variable pointing `axios`'s `baseURL` at your backend's live URL instead of the relative `/api` used in dev) so the frontend talks to the deployed backend. The simplest change: in `frontend/src/lib/api.js`, set `baseURL` to your backend's full URL, e.g. `https://your-backend.onrender.com/api`.

**4. Update `CLIENT_ORIGIN`** on the backend to your live frontend URL, and redeploy the backend so CORS allows it.

Once both are deployed, the app is reachable from any device with the frontend's URL — no VPN, no local machine needed, works for guests on their own phones anywhere.

---

## API reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a couple (starts an event) or guest (joins via event code) |
| POST | `/api/auth/login` | — | Get a JWT |
| GET | `/api/auth/me` | Bearer token | Current user info |
| POST | `/api/gallery/upload` | Bearer token | Upload photos (multipart, field `photos`), auto-scores + flags best shot |
| GET | `/api/gallery` | Bearer token | List all photos for your event |
| DELETE | `/api/gallery/:id` | Bearer token | Delete a photo (owner or couple) |
| POST | `/api/gallery/:id/faces` | Bearer token | Store face descriptors computed client-side for a photo |
| POST | `/api/gallery/face-search` | Bearer token | Match a selfie's face descriptor against the event's tagged photos |
| GET | `/api/pricing` | — | Pricing plan data |

## Notes on the AI features

- **Best-shot detection** is a real algorithm (Laplacian-variance sharpness, computed server-side with `sharp`) — not a placeholder.
- **Face search** uses `face-api.js` running entirely in the guest's browser (models load from a CDN at runtime), so no photos or biometric images are sent to any third-party AI service — only the resulting 128-number face descriptor is sent to your own backend for comparison.
- **Bride & groom auto-separation**, as scoped in the original spec, needs one more UI step: letting the couple label which face-descriptor cluster is "Bride" and which is "Groom" from their reference photos. The detection and matching pipeline this depends on is already built — this is a good next increment.
