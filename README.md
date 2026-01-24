# TCIS - Tally Client Intelligence Suite

**Metavision Technology Internal Application**

A rule-based decision support tool for lead prioritization, client upsell recommendations, and support risk assessment. Built for B.Tech CSE final year project demonstration.

## 🎯 What It Does

TCIS helps Metavision Technology (a TallyPrime solutions provider) answer:
- **Which leads should we prioritize?** → Lead scoring based on sector, size, source, and engagement
- **Which clients need upselling?** → Identify clients with missing automation packs
- **Which clients are at risk?** → Flag clients with high support ticket volumes

All scoring is **deterministic and rule-based** (no ML), making it easy to explain in a viva.

## 📁 Project Structure

```
TCIS/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # DB connection
│   │   └── routers/
│   │       ├── leads.py     # Lead CRUD
│   │       ├── clients.py   # Client CRUD
│   │       ├── packs.py     # Automation Pack CRUD
│   │       ├── tickets.py   # Ticket CRUD
│   │       └── scoring.py   # Scoring logic (★ core business intelligence)
│   ├── seed_data.py         # Sample data generator
│   ├── init_db.sql          # SQL schema
│   └── requirements.txt
├── frontend/
│   ├── streamlit_app.py     # Streamlit dashboard
│   └── requirements.txt
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Seed Sample Data
```bash
python seed_data.py
```

Expected output:
```
TCIS Database Seeder
==================================================
Creating database tables...
  ✓ Tables created
Clearing existing data...
  ✓ Existing data cleared
Seeding data...
  ✓ Created 8 automation packs
  ✓ Created 25 leads
  ✓ Created 25 clients
  ✓ Created 40 tickets
  ✓ Created 8 pack installations
==================================================
✅ Database seeding complete!
```

### Step 3: Run Backend
```bash
uvicorn app.main:app --reload
```

API will be available at:
- Swagger Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
pip install -r requirements.txt
```

### Step 5: Run Frontend
```bash
streamlit run streamlit_app.py
```

Dashboard will open at: http://localhost:8501

## 📊 API Endpoints

### Core CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads |
| POST | `/api/leads` | Create lead |
| GET | `/api/clients` | List clients |
| POST | `/api/clients` | Create client |
| GET | `/api/packs` | List automation packs |
| GET | `/api/tickets` | List tickets |
| GET | `/api/tickets/stats` | Ticket statistics |

### Scoring (★ Business Intelligence)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scoring/leads/ranked` | Get leads ranked by score |
| GET | `/api/scoring/clients/ranked` | Get clients with upsell & risk scores |
| GET | `/api/scoring/packs/potential` | Get packs with potential client counts |

## 🧮 Scoring Rules (For Viva)

### Lead Scoring (0-100)

| Factor | Weight | Logic |
|--------|--------|-------|
| Sector | 23% | manufacturing=1.0, trading=0.7, services=0.5 |
| Size | 23% | large=1.0, medium=0.7, small=0.4 |
| Source | 23% | referral=1.0, partner=0.8, indiamart=0.6, justdial=0.5, cold=0.3 |
| Modules | 15% | +5 points per interested module (max 15) |
| Recency | 15% | <7d=1.0, <30d=0.7, <90d=0.4, else=0.2 |

**Suggested Actions:**
- Score ≥70 + stale contact → "Call today"
- Score ≥50 + multiple modules → "Send brochure"
- Score <30 → "Low priority"

### Client Upsell Scoring (0-100)

| Factor | Weight | Logic |
|--------|--------|-------|
| Product Gap | 40% | Only TallyPrime=40, +MIS=30, +2 more=20, complete=10 |
| Last Project | 30% | >24 months=30, >12 months=25, >6 months=15, recent=10 |
| Sector/Size | 30% | (sector_weight + size_weight) / 2 × 30 |

**Pack Recommendations:** Based on ticket patterns (GST issues → GST_HEALTH pack)

### Client Risk Scoring (0-100)

| Factor | Max Points | Logic |
|--------|------------|-------|
| Ticket Volume | 40 | 8 points per ticket in last 90 days |
| Severity | 30 | Weighted average (critical=4, high=3, medium=2, low=1) |
| Resolution Time | 30 | Avg >14 days=30, >7 days=20, >3 days=10 |

**Risk Flags:**
- Score ≥60 → "High support load" or "Training needed"
- Score ≥40 → "Monitor closely"

## 🏗 System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Streamlit     │  HTTP   │    FastAPI      │
│   Frontend      │◄───────►│    Backend      │
│  (Dashboard)    │         │   (REST API)    │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │     SQLite      │
                            │    Database     │
                            └─────────────────┘
```

**Layer Responsibilities:**
1. **Frontend (Streamlit):** User interface, data visualization, filtering
2. **Backend (FastAPI):** Business logic, scoring algorithms, data validation
3. **Database (SQLite):** Persistent storage, queryable via SQLAlchemy ORM

## 📝 Project Abstract

TCIS (Tally Client Intelligence Suite) is a rule-based decision support system designed for Metavision Technology, a TallyPrime solutions provider based in Mumbai. The system addresses the challenge of managing leads and clients across disparate spreadsheets by providing a centralized platform with automated prioritization.

Key features include deterministic lead scoring, client upsell opportunity identification, and support risk assessment. The scoring algorithms use explicit business rules (sector weights, source quality, recency factors) rather than black-box ML models, ensuring transparency and explainability. The system is built with FastAPI for the backend, SQLite for persistence, and Streamlit for internal dashboards.

## 👥 Team

- Developed for B.Tech CSE Final Year Project
- Client: Metavision Technology (TallyPrime Partner)

## 📄 License

Internal use only - Metavision Technology
