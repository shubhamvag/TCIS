# TCIS - Tally Client Intelligence Suite (Enterprise Version)

* Internal Operational Platform**

TCIS is a simple support system I built to help with leads, clients, and support tickets. It uses standard scoring rules to rank everything so the team knows who to call first.

##  Core Objectives
- **Sales Optimization**: Prioritize leads based on sector fit and engagement (Lead Scoring).
- **Revenue Expansion**: Identify upsell candidates using gap analysis (Client Intelligence).
- **Risk Mitigation**: Proactively flag accounts with high support loads (Support Signals).
- **Product Strategy**: Visualize market penetration of automation solutions (Portfolio Analysis).

##  Technical Architecture

### **Frontend**: `frontend/tcis-react`
A high-performance "Enterprise Dashboard" built for speed and data density.
- **Stack**: React 18, TypeScript, Vite.
- **Design System**: Tailwind CSS (Strict Light Mode, System Fonts).
- **Features**: 
    - Real-time filtering and sorting.
    - Interactive Recharts visualizations.
    - Strict Type Safety (TypeScript).

### **Backend**: `backend/app`
A robust REST API serving business logic and scoring algorithms.
- **Stack**: Python 3.9+, FastAPI, SQLAlchemy.
- **Database**: SQLite (Relational Storage).
- **Logic**: Rule-based scoring engines (Lead Score, Risk Score, Upsell Propensity).

##  Quick Start Guide

### 1. Start the Backend
```bash
cd backend
# Install dependencies (first time only)
pip install -r requirements.txt
# Seed database with sample enterprise data
python seed_data.py
# Run server
uvicorn app.main:app --reload
```
> Backend runs on: `http://localhost:8000`

### 2. Start the Frontend
```bash
cd frontend/tcis-react
# Install dependencies (first time only)
npm install
# Run development server
npm run dev
```
> Frontend runs on: `http://localhost:5173`

## 📊 Modules & Scoring Logic

### **1. Leads Intelligence**
- **Goal**: Focus sales effort on "High Quality" targets.
- **Algorithm**: Weighted sum of `Sector Match` (23%), `Company Size` (23%), `Lead Source` (23%), and `Engagement` (15%).
- **Visuals**: Scatter plot correlating Score vs. Industry.

### **2. Client Intelligence**
- **Goal**: Maximize Lifetime Value (LTV).
- **Upsell Score**: 0-100 rating based on "Product Gap" (missing modules) and "Purchase Recency".
- **Risk Flag**: Triggers when `Ticket Volume > Threshold` or `Resolution Time > SLA`.

### **3. Support Analytics**
- **Goal**: Operational Excellence.
- **Metrics**: Real-time tracking of `Active Operations`, `System Health`, and `High Load Accounts`.

## 📄 License
Internal use only 
