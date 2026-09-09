# Companio — AI-powered Dementia Care & Early Screening Platform

An **offline-first** FastAPI backend for dementia care and early cognitive
screening, designed for patients, caregivers, and healthcare workers in remote
and underserved areas.

> **Important:** Companio is a **screening and decision-support tool, not a
> medical diagnosis**. Results should be reviewed by a qualified healthcare
> professional.

---

## Features

- **Patient Registration** — demographics, medical/cognitive history, existing
  conditions, medications, linked caregiver.
- **Cognitive Screening** — a guided session covering 7 domains: memory,
  attention, orientation, language, recall, problem-solving, and daily-life
  difficulties. Tracks per-response scores and completion time.
- **AI-Style Assessment** — rule-based scoring engine computes a certified
  cognitive score (0–30), a risk category (Low / Moderate / High), key
  observations, areas needing attention, and suggested next steps.
- **Patient Monitoring** — longitudinal profile with screening history,
  cognitive score trends, symptoms/observations, medications, reminders,
  events, and follow-up history.
- **Caregiver Support** — view patient status, track assessments, receive
  alerts, create medication/appointment reminders, and record behavioural or
  cognitive observations.
- **Dashboard & Alerts** — unified overview: total patients, recent
  assessments, high-risk cases, pending follow-ups, reminders, and risk
  indicators.
- **PostgreSQL (Neon-ready)** — configured for hosted PostgreSQL via `asyncpg`
  (Neon / Supabase compatible connection strings).

---

## Tech Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.0 (async) + asyncpg (PostgreSQL)
- Pydantic v2 / pydantic-settings
- Uvicorn

---

## Project Structure

```
companio/
├── app/
│   ├── main.py              # FastAPI app, startup (create tables + seed), CORS
│   ├── config.py            # Settings (reads DATABASE_URL from .env)
│   ├── database.py          # Async engine + session
│   ├── models.py            # SQLAlchemy ORM models (12 tables)
│   ├── schemas.py           # Pydantic request/response models
│   ├── scoring.py           # Rule-based cognitive scoring engine
│   ├── question_data.py     # Default screening question bank (17 questions)
│   ├── seed.py              # Sample data (demonstrates full patient journey)
│   └── routers/
│       ├── patients.py      # registration + patient CRUD
│       ├── screenings.py    # screening sessions + responses
│       ├── assessments.py   # assessment retrieval
│       ├── caregivers.py    # caregiver module
│       ├── dashboard.py     # dashboard stats + alerts + trends
│       └── reminders.py     # medication / appointment reminders
├── .env.example
├── requirements.txt
└── README.md
```

---

## Setup

### 1. Create a virtual environment

```bash
python -m venv .venv
# Windows
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure the database (Neon / hosted PostgreSQL)

Copy `.env.example` to `.env` and fill in your Neon connection string.

```
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/dbname?sslmode=require
```

Your Neon connection string looks like:

```
postgresql://USER:PASSWORD@EP-xxx.REGION.aws.neon.tech/neondb?sslmode=require
```

Convert it to the asyncpg form by replacing `postgresql://` with
`postgresql+asyncpg://` (keep `?sslmode=require`).

> **Note:** If you don't have a database yet, you can temporarily run against
> local SQLite for quick testing by setting:
> `DATABASE_URL=sqlite+aiosqlite:///./companio.db`

### 4. Run the server

```bash
uvicorn app.main:app --reload
```

On first startup the app creates all tables and seeds sample data.

- Interactive API docs (Swagger UI): http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## Sample Seed Data

Three patients demonstrating the full risk spectrum and longitudinal trends:

| Patient | Age | Latest score | Risk | Trend |
|---|---|---|---|---|
| Joseph Kamau | 68 | 30.0 | **Low** | 30.0 → 30.0 |
| Amina Ochieng | 74 | 19.7 | **Moderate** | 22.8 → 19.7 (declining) |
| Peter Njoroge | 81 | 2.1 | **High** | 5.2 → 2.1 (declining) |

Plus caregivers, observations, and medication/appointment reminders.

---

## API Overview

Base path: `/api`

| Module | Endpoints |
|---|---|
| Patients | `POST /patients/register`, `GET /patients`, `GET /patients/{id}`, `GET /patients/{id}/history`, `PUT /patients/{id}` |
| Screenings | `GET /screenings/questions`, `POST /screenings/start`, `POST /screenings/{id}/respond`, `POST /screenings/{id}/complete`, `GET /screenings/{id}` |
| Assessments | `POST /assessments/generate/{session_id}`, `GET /assessments/patient/{patient_id}`, `GET /assessments/{id}` |
| Caregivers | `GET /caregivers/patients`, `POST /caregivers/observations`, `GET /caregivers/observations/{patient_id}`, `GET /caregivers/alerts` |
| Dashboard | `GET /dashboard/stats`, `GET /dashboard/alerts`, `GET /dashboard/trends` |
| Reminders | `POST /reminders/`, `GET /reminders/patient/{patient_id}`, `PUT /reminders/{id}/complete` |

---

## Full Patient Journey (demonstrated)

1. **Registration** → `POST /api/patients/register`
2. **Cognitive Screening** → start a session, answer all 17 questions
3. **Assessment** → complete the session; receives score, risk category,
   observations, and next steps
4. **Risk Result** → Low / Moderate / High with trending
5. **Caregiver Monitoring** → view status, record observations, get alerts
6. **Follow-up** → schedule reminders for ongoing care

---

## Notes / Limitations (Prototype)

- **Rule-based scoring** inspired by clinical instruments (e.g., MMSE/MoCA);
  it is **not** a validated clinical tool or a real ML model.
- No authentication/authorization yet (roles are modeled but endpoints are open).
- Offline sync endpoints are not yet implemented (the data model supports
  offline-first; sync can be added).
- ASCII-safe: works fully offline as a local API once running.
