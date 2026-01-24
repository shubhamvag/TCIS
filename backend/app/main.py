"""
TCIS Backend - FastAPI Application Entry Point

Metavision Tally Client Intelligence Suite
A rule-based decision support tool for lead prioritization,
client upsell recommendations, and support risk assessment.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import leads, clients, packs, tickets, scoring

# Create database tables on startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="TCIS API",
    description="Metavision Tally Client Intelligence Suite - Internal API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Streamlit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Broad for demo/local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HEALTH CHECK ENDPOINT
# ============================================================

@app.get("/health", tags=["System"])
def health_check():
    """
    Health check endpoint.
    Returns OK if the API is running.
    """
    return {"status": "ok", "service": "TCIS API", "version": "1.0.0"}


@app.get("/", tags=["System"])
def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "Welcome to TCIS API",
        "docs": "/docs",
        "health": "/health"
    }


# ============================================================
# INCLUDE ROUTERS
# ============================================================

app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(packs.router, prefix="/api/packs", tags=["Automation Packs"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["Scoring"])
