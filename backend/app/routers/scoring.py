"""
Scoring Router - Deterministic scoring logic for leads and clients.

This module contains the core business intelligence logic:
1. Lead Scoring: Prioritize which leads to follow up with
2. Client Upsell Scoring: Identify clients for upsell opportunities  
3. Client Risk Scoring: Flag clients with high support load

All scoring is RULE-BASED (deterministic), not ML-based.
This makes it easy to explain, debug, and adjust.
"""
from typing import List, Tuple
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import Counter
import math

from ..database import get_db
from ..models import (
    Lead, Client, Ticket, AutomationPack, ClientAutomation, 
    ScoringConfig, ScoreHistory
)
from ..schemas import (
    LeadWithScore, ClientWithScore, 
    ScoringConfigResponse, ScoringConfigUpdate,
    ScoreHistoryResponse
)


router = APIRouter()


# ============================================================
# UTILITY: FETCH DB WEIGHTS
# ============================================================

def get_weights_from_db(db: Session):
    """Fetch all scoring weights from the database."""
    configs = db.query(ScoringConfig).all()
    weights = {c.key: c.value for c in configs}
    return weights


# ============================================================
# LEAD SCORING FUNCTIONS
# ============================================================

def compute_lead_score(lead: Lead, weights: dict) -> Tuple[float, str]:
    """
    Compute a numeric lead score (0-100) using dynamic weights.
    """
    # Get weights from DB-backed dict (fallback to defaults if missing)
    sector_weight = weights.get(f"sector_{lead.sector}", 0.3)
    size_weight = weights.get(f"size_{lead.size}", 0.3)
    source_weight = weights.get(f"source_{lead.source}", 0.3)
    
    # Base score from sector, size, source (max 70 points)
    base_score = ((sector_weight + size_weight + source_weight) / 3) * 70
    
    # Module interest bonus (max 15 points)
    num_modules = 0
    if lead.interested_modules:
        modules = [m.strip() for m in lead.interested_modules.split(",") if m.strip()]
        num_modules = len(modules)
    module_bonus = min(num_modules * 5, 15)
    
    # Recency bonus (max 15 points)
    recency_weight = 0.2
    if lead.last_contact_date:
        days_since = (date.today() - lead.last_contact_date).days
        if days_since <= 7:
            recency_weight = 1.0
        elif days_since <= 30:
            recency_weight = 0.7
        elif days_since <= 90:
            recency_weight = 0.4
        else:
            recency_weight = 0.2
    recency_bonus = recency_weight * 15
    
    # Final score
    final_score = round(base_score + module_bonus + recency_bonus, 1)
    final_score = min(100, max(0, final_score))
    
    # Action determination (Logic remains same for consistency)
    if lead.status == "won":
        action = "Closed - Convert to client"
    elif lead.status == "lost":
        action = "Lost - Review in 6 months"
    elif final_score >= 70:
        action = "High priority - Call today" if recency_weight < 0.7 else "Follow up within 48 hours"
    elif final_score >= 50:
        action = "Send product brochure package" if num_modules >= 2 else "Schedule discovery call"
    elif final_score >= 30:
        action = "Add to nurture email sequence"
    else:
        action = "Low priority - monthly check-in"
    
    return final_score, action


# ============================================================
# CLIENT SCORING FUNCTIONS
# ============================================================

def compute_client_upsell_score(
    client: Client, 
    tickets: List[Ticket],
    installed_pack_codes: List[str],
    all_packs: List[AutomationPack],
    weights: dict
) -> Tuple[float, List[str]]:
    """
    Compute upsell opportunity score (0-100) using dynamic weights.
    """
    recommended_packs = []
    
    # === Product Gap Score (max 40 points) ===
    existing = set()
    if client.existing_products:
        existing = set(p.strip().lower() for p in client.existing_products.split(","))
    
    all_core_products = {"tallyprime", "f1_mis", "hrms", "inventory", "gst"}
    products_owned = len(existing & all_core_products)
    
    product_gap_score = max(10, 40 - (products_owned * 10))
    
    # === Recency Score (max 30 points) ===
    recency_score = 15
    if client.last_project_date:
        months_since = (date.today() - client.last_project_date).days / 30
        if months_since >= 24: recency_score = 30
        elif months_since >= 12: recency_score = 25
        elif months_since >= 6: recency_score = 15
        else: recency_score = 10
    
    # === Size/Sector Score (max 30 points) ===
    sector_weight = weights.get(f"sector_{client.sector}", 0.5)
    size_weight = weights.get(f"size_{client.size}", 0.5)
    size_sector_score = (sector_weight + size_weight) / 2 * 30
    
    # === Final upsell score ===
    upsell_score = round(product_gap_score + recency_score + size_sector_score, 1)
    upsell_score = min(100, max(0, upsell_score))
    
    # Pack recommendations logic (Mapping remains static as it's product-based)
    TICKET_TO_PACK_MAP = {"gst": "GST_HEALTH", "inventory": "INV_ALERT", "report": "F1_MIS"}
    ticket_types = [t.issue_type for t in tickets]
    type_counts = Counter(ticket_types)
    
    for ticket_type, count in type_counts.items():
        if count >= 2:
            pack_code = TICKET_TO_PACK_MAP.get(ticket_type)
            if pack_code and pack_code not in installed_pack_codes:
                recommended_packs.append(pack_code)
    
    for pack in all_packs:
        if len(recommended_packs) >= 3: break
        if pack.code in installed_pack_codes or pack.code in recommended_packs: continue
        
        # Sector matching
        if pack.target_sectors:
            target_sectors = set(s.strip().lower() for s in pack.target_sectors.split(","))
            if client.sector and client.sector.lower() not in target_sectors: continue
            
        recommended_packs.append(pack.code)
    
    return upsell_score, recommended_packs


def compute_client_risk_score(tickets: List[Ticket]) -> Tuple[float, str]:
    """
    Compute support risk score (0-100). (Static logic for now)
    """
    cutoff = datetime.utcnow() - timedelta(days=90)
    recent_tickets = [t for t in tickets if t.created_at and t.created_at >= cutoff]
    
    if not recent_tickets:
        return 0.0, None
    
    volume_score = min(len(recent_tickets) * 8, 40)
    
    SEVERITY_WEIGHTS = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    severity_sum = sum(SEVERITY_WEIGHTS.get(t.severity, 1) for t in recent_tickets)
    max_possible = len(recent_tickets) * 4
    severity_score = (severity_sum / max_possible) * 30 if max_possible > 0 else 0
    
    resolution_times = [(t.resolved_at - t.created_at).days for t in recent_tickets if t.resolved_at and t.created_at]
    resolution_score = 0
    if resolution_times:
        avg_days = sum(resolution_times) / len(resolution_times)
        if avg_days >= 14: resolution_score = 30
        elif avg_days >= 7: resolution_score = 20
        elif avg_days >= 3: resolution_score = 10
        else: resolution_score = 5
    
    risk_score = round(volume_score + severity_score + resolution_score, 1)
    risk_score = min(100, max(0, risk_score))
    
    risk_flag = None
    if risk_score >= 60:
        training_count = sum(1 for t in recent_tickets if t.issue_type == "training")
        risk_flag = "Training needed" if training_count >= len(recent_tickets) * 0.5 else "High support load"
    elif risk_score >= 40:
        risk_flag = "Monitor closely"
    
    return risk_score, risk_flag


# ============================================================
# API ENDPOINTS
# ============================================================

@router.get("/config", response_model=List[ScoringConfigResponse])
def get_scoring_config(db: Session = Depends(get_db)):
    """Get all scoring weights currently in the database."""
    return db.query(ScoringConfig).all()


@router.patch("/config/{key}", response_model=ScoringConfigResponse)
def update_scoring_config(key: str, update: ScoringConfigUpdate, db: Session = Depends(get_db)):
    """Update a specific scoring weight."""
    config = db.query(ScoringConfig).filter(ScoringConfig.key == key).first()
    if not config:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Config key not found")
    
    config.value = update.value
    db.commit()
    db.refresh(config)
    return config


@router.get("/leads/ranked", response_model=List[LeadWithScore])
def get_ranked_leads(
    limit: int = 50,
    state: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get leads ranked by dynamic score."""
    weights = get_weights_from_db(db)
    query = db.query(Lead).filter(Lead.status.notin_(["won", "lost"]))
    if state:
        query = query.filter(Lead.state == state)
    leads = query.all()
    
    scored_leads = []
    for lead in leads:
        score, action = compute_lead_score(lead, weights)
        
        # Log to history for trend analysis
        history = ScoreHistory(entity_id=lead.id, entity_type="lead", score=score)
        db.add(history)
        
        data = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
        data.update({"lead_score": score, "suggested_next_action": action})
        scored_leads.append(data)
    
    db.commit()
    scored_leads.sort(key=lambda x: x["lead_score"], reverse=True)
    return scored_leads[:limit]


@router.get("/clients/ranked", response_model=List[ClientWithScore])
def get_ranked_clients(
    limit: int = 50,
    state: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get clients with upsell and risk scores."""
    weights = get_weights_from_db(db)
    query = db.query(Client)
    if state:
        query = query.filter(Client.state == state)
    clients = query.all()
    all_packs = db.query(AutomationPack).filter(AutomationPack.is_active == 1).all()
    
    scored_clients = []
    for client in clients:
        tickets = db.query(Ticket).filter(Ticket.client_id == client.id).all()
        installed = db.query(ClientAutomation).filter(ClientAutomation.client_id == client.id).all()
        installed_codes = [db.query(AutomationPack).get(inst.pack_id).code for inst in installed if db.query(AutomationPack).get(inst.pack_id)]
        
        upsell_score, recommended = compute_client_upsell_score(client, tickets, installed_codes, all_packs, weights)
        risk_score, risk_flag = compute_client_risk_score(tickets)
        
        # Log to history
        history = ScoreHistory(entity_id=client.id, entity_type="client", score=upsell_score)
        db.add(history)
        
        data = {c.name: getattr(client, c.name) for c in client.__table__.columns}
        data.update({
            "upsell_score": upsell_score,
            "recommended_packs": recommended,
            "risk_score": risk_score,
            "risk_flag": risk_flag
        })
        scored_clients.append(data)
    
    db.commit()
    scored_clients.sort(key=lambda x: x["upsell_score"], reverse=True)
    return scored_clients[:limit]


@router.get("/history/{entity_type}/{entity_id}", response_model=List[ScoreHistoryResponse])
def get_score_history(
    entity_type: str, 
    entity_id: int, 
    limit: int = 20, 
    days: int = None,
    db: Session = Depends(get_db)
):
    """Get scorecard history with optional time filtering."""
    query = db.query(ScoreHistory).filter(
        ScoreHistory.entity_type == entity_type,
        ScoreHistory.entity_id == entity_id
    )
    
    if days:
        cutoff = datetime.now() - timedelta(days=days)
        query = query.filter(ScoreHistory.recorded_at >= cutoff)
        
    return query.order_by(ScoreHistory.recorded_at.desc()).limit(limit).all()


@router.get("/packs/potential")
def get_packs_with_potential(db: Session = Depends(get_db)):
    """
    Get all packs with count of potential clients who could benefit.
    """
    all_packs = db.query(AutomationPack).filter(AutomationPack.is_active == 1).all()
    clients = db.query(Client).all()
    
    pack_potentials = {}
    
    for pack in all_packs:
        pack_potentials[pack.code] = {
            "id": pack.id,
            "name": pack.name,
            "code": pack.code,
            "description": pack.description,
            "price_band": pack.price_band,
            "installation_count": 0,
            "potential_count": 0
        }
        
        # Count installations
        pack_potentials[pack.code]["installation_count"] = db.query(ClientAutomation).filter(
            ClientAutomation.pack_id == pack.id
        ).count()
    
    # Count potential clients for each pack
    weights = get_weights_from_db(db)
    for client in clients:
        tickets = db.query(Ticket).filter(Ticket.client_id == client.id).all()
        installed = db.query(ClientAutomation).filter(
            ClientAutomation.client_id == client.id
        ).all()
        installed_codes = [db.query(AutomationPack).get(inst.pack_id).code for inst in installed if db.query(AutomationPack).get(inst.pack_id)]
        
        _, recommended = compute_client_upsell_score(client, tickets, installed_codes, all_packs, weights)
        
        for pack_code in recommended:
            if pack_code in pack_potentials:
                pack_potentials[pack_code]["potential_count"] += 1
    
    return list(pack_potentials.values())


@router.get("/geo/summary")
def get_geo_summary(
    sector: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get geographic intelligence summary.
    Now aggregated by STATE for the new India-centric dashboard.
    """
    weights = get_weights_from_db(db)
    
    # Base query for aggregation
    lead_query = db.query(Lead)
    client_query = db.query(Client)
    
    if sector:
        lead_query = lead_query.filter(Lead.sector == sector)
        client_query = client_query.filter(Client.sector == sector)
        
    leads = lead_query.all()
    clients = client_query.all()
    packs = db.query(AutomationPack).filter(AutomationPack.is_active == 1).all()
    
    summary = {
        "filters": {"sector": sector},
        "states": {},
        "unmapped": {"count": 0}
    }
    
    def ensure_state(st, reg):
        if st not in summary["states"]:
            summary["states"][st] = {
                "name": st,
                "region": reg,
                "lead_count": 0,
                "client_count": 0,
                "total_score": 0.0,
                "lead_score_sum": 0.0,
                "city_data": {}
            }

    # Process Leads
    for lead in leads:
        if not lead.state:
            summary["unmapped"]["count"] += 1
            continue
            
        ensure_state(lead.state, lead.region)
        score, _ = compute_lead_score(lead, weights)
        
        st_data = summary["states"][lead.state]
        st_data["lead_count"] += 1
        st_data["lead_score_sum"] += score
        st_data["total_score"] += score
        
        if lead.city:
            if lead.city not in st_data["city_data"]:
                st_data["city_data"][lead.city] = {"count": 0, "score_sum": 0.0}
            st_data["city_data"][lead.city]["count"] += 1
            st_data["city_data"][lead.city]["score_sum"] += score

    # Process Clients
    for client in clients:
        if not client.state:
            summary["unmapped"]["count"] += 1
            continue
            
        ensure_state(client.state, client.region)
        tickets = db.query(Ticket).filter(Ticket.client_id == client.id).all()
        installed = db.query(ClientAutomation).filter(ClientAutomation.client_id == client.id).all()
        
        # Optimized lookup
        pack_map = {p.id: p.code for p in packs}
        installed_codes = [pack_map.get(inst.pack_id) for inst in installed if inst.pack_id in pack_map]
        
        upsell_score, _ = compute_client_upsell_score(client, tickets, installed_codes, packs, weights)
        
        st_data = summary["states"][client.state]
        st_data["client_count"] += 1
        st_data["total_score"] += upsell_score
        
        if client.city:
            if client.city not in st_data["city_data"]:
                st_data["city_data"][client.city] = {"count": 0, "score_sum": 0.0}
            st_data["city_data"][client.city]["count"] += 1
            st_data["city_data"][client.city]["score_sum"] += upsell_score

    # Finalize Metrics
    for name, data in summary["states"].items():
        total_count = data["lead_count"] + data["client_count"]
        
        if total_count > 0:
            raw_density = data["total_score"] / math.sqrt(total_count)
            data["opportunity_density"] = min(100, round((raw_density / 3.0), 1))
            data["avg_lead_score"] = round(data["lead_score_sum"] / data["lead_count"], 1) if data["lead_count"] > 0 else 0
            
            # Nuanced Risk & Recommendation Logic
            if data["opportunity_density"] < 30:
                data["risk_level"] = "HIGH"
                data["recommended_action"] = "SCOUT" if data["client_count"] == 0 else "RETENTION"
            elif data["opportunity_density"] < 60:
                data["risk_level"] = "MEDIUM"
                data["recommended_action"] = "NURTURE"
            else:
                data["risk_level"] = "LOW"
                data["recommended_action"] = "EXPAND" if data["opportunity_density"] < 80 else "AGGRESSIVE"

            # Override for high-potential emerging markets
            if data["avg_lead_score"] > 80 and data["lead_count"] > 2:
                data["recommended_action"] = "AGGRESSIVE"
        else:
            data["opportunity_density"] = 0
            data["avg_lead_score"] = 0
            data["risk_level"] = "LOW"
            data["recommended_action"] = "SCOUT"
            
        # Extract Top Cities
        top_cities = []
        for city_name, city_metrics in data["city_data"].items():
            top_cities.append({
                "name": city_name,
                "count": city_metrics["count"],
                "avg_quality": round(city_metrics["score_sum"] / city_metrics["count"], 1)
            })
        data["top_cities"] = sorted(top_cities, key=lambda x: x["avg_quality"], reverse=True)[:3]
        
        # Cleanup internal keys
        del data["city_data"]
        del data["lead_score_sum"]
        del data["total_score"]

    return summary
