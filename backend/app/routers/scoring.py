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
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter

from ..database import get_db
from ..models import Lead, Client, Ticket, AutomationPack, ClientAutomation
from ..schemas import LeadWithScore, ClientWithScore


router = APIRouter()


# ============================================================
# SCORING WEIGHTS (CONFIGURABLE)
# ============================================================
# These weights can be tuned based on business priorities.
# Currently calibrated for Indian SME B2B software sales.

# Lead scoring weights
SECTOR_WEIGHTS = {
    "manufacturing": 1.0,   # Higher value deals, longer retention
    "trading": 0.7,         # Medium value
    "services": 0.5         # Smaller, more price-sensitive
}

SIZE_WEIGHTS = {
    "large": 1.0,           # >100 employees - bigger deals
    "medium": 0.7,          # 20-100 employees
    "small": 0.4            # <20 employees
}

SOURCE_WEIGHTS = {
    "referral": 1.0,        # Highest conversion rate
    "partner": 0.8,         # Channel partner leads
    "indiamart": 0.6,       # Marketplace leads
    "justdial": 0.5,        # Directory leads
    "website": 0.4,         # Inbound website
    "cold": 0.3             # Cold outreach
}

# Module interest weights (more modules = higher score)
MODULE_WEIGHT = 0.1  # Per module interested in

# Ticket type to pack recommendation mapping
TICKET_TO_PACK_MAP = {
    "gst": "GST_HEALTH",
    "inventory": "INV_ALERT", 
    "report": "F1_MIS",
    "performance": None,     # No specific pack
    "training": None
}

# Severity weights for risk scoring
SEVERITY_WEIGHTS = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1
}


# ============================================================
# LEAD SCORING FUNCTIONS
# ============================================================

def compute_lead_score(lead: Lead) -> Tuple[float, str]:
    """
    Compute a numeric lead score (0-100) based on:
    - Sector (manufacturing > trading > services)
    - Company size
    - Lead source (referral > cold)
    - Number of interested modules
    - Recency of last contact
    
    Returns:
        tuple: (score: float, suggested_next_action: str)
    
    Scoring Formula:
        base_score = (sector_weight + size_weight + source_weight) / 3 * 70
        module_bonus = min(num_modules * 10, 15)
        recency_bonus = recency_weight * 15
        final_score = base_score + module_bonus + recency_bonus
    """
    # Get weights from lookup tables (default to lowest if not found)
    sector_weight = SECTOR_WEIGHTS.get(lead.sector, 0.3)
    size_weight = SIZE_WEIGHTS.get(lead.size, 0.3)
    source_weight = SOURCE_WEIGHTS.get(lead.source, 0.3)
    
    # Base score from sector, size, source (max 70 points)
    base_score = ((sector_weight + size_weight + source_weight) / 3) * 70
    
    # Module interest bonus (max 15 points)
    num_modules = 0
    if lead.interested_modules:
        modules = [m.strip() for m in lead.interested_modules.split(",") if m.strip()]
        num_modules = len(modules)
    module_bonus = min(num_modules * 5, 15)
    
    # Recency bonus (max 15 points)
    recency_weight = 0.2  # Default: old/no contact
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
    final_score = min(100, max(0, final_score))  # Clamp to 0-100
    
    # Determine suggested action based on score and recency
    if lead.status == "won":
        action = "Closed - Convert to client"
    elif lead.status == "lost":
        action = "Lost - Review in 6 months"
    elif final_score >= 70:
        if recency_weight < 0.7:
            action = "High priority - Call today"
        else:
            action = "Follow up within 48 hours"
    elif final_score >= 50:
        if num_modules >= 2:
            action = "Send product brochure package"
        else:
            action = "Schedule discovery call"
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
    all_packs: List[AutomationPack]
) -> Tuple[float, List[str]]:
    """
    Compute upsell opportunity score (0-100) based on:
    - Current products (fewer = more potential)
    - Time since last project
    - Sector and size
    - Ticket patterns suggesting needs
    
    Returns:
        tuple: (upsell_score: float, recommended_pack_codes: List[str])
    
    Scoring Formula:
        base_score = product_gap_score * 0.4 + recency_score * 0.3 + size_sector_score * 0.3
    """
    recommended_packs = []
    
    # === Product Gap Score (max 40 points) ===
    # Clients with only TallyPrime have highest upsell potential
    existing = set()
    if client.existing_products:
        existing = set(p.strip().lower() for p in client.existing_products.split(","))
    
    # Core products list
    all_core_products = {"tallyprime", "f1_mis", "hrms", "inventory", "gst"}
    products_owned = len(existing & all_core_products)
    
    # More owned = less upsell potential
    if products_owned <= 1:
        product_gap_score = 40
    elif products_owned == 2:
        product_gap_score = 30
    elif products_owned == 3:
        product_gap_score = 20
    else:
        product_gap_score = 10
    
    # === Recency Score (max 30 points) ===
    # Long time since last project = opportunity
    recency_score = 15  # Default
    if client.last_project_date:
        months_since = (date.today() - client.last_project_date).days / 30
        if months_since >= 24:
            recency_score = 30
        elif months_since >= 12:
            recency_score = 25
        elif months_since >= 6:
            recency_score = 15
        else:
            recency_score = 10  # Recently purchased
    
    # === Size/Sector Score (max 30 points) ===
    sector_weight = SECTOR_WEIGHTS.get(client.sector, 0.5)
    size_weight = SIZE_WEIGHTS.get(client.size, 0.5)
    size_sector_score = (sector_weight + size_weight) / 2 * 30
    
    # === Final upsell score ===
    upsell_score = round(product_gap_score + recency_score + size_sector_score, 1)
    upsell_score = min(100, max(0, upsell_score))
    
    # === Pack Recommendations ===
    # Based on ticket patterns
    ticket_types = [t.issue_type for t in tickets]
    type_counts = Counter(ticket_types)
    
    for ticket_type, count in type_counts.items():
        if count >= 2:  # Recurring issue
            pack_code = TICKET_TO_PACK_MAP.get(ticket_type)
            if pack_code and pack_code not in installed_pack_codes:
                recommended_packs.append(pack_code)
    
    # Also recommend packs based on product gaps
    for pack in all_packs:
        if pack.code in installed_pack_codes:
            continue
        if pack.code in recommended_packs:
            continue
            
        # Check if client meets requirements
        required = set()
        if pack.required_existing_products:
            required = set(p.strip().lower() for p in pack.required_existing_products.split(","))
        
        if required and not required.issubset(existing):
            continue  # Client doesn't have required products
        
        # Check sector match
        if pack.target_sectors:
            target_sectors = set(s.strip().lower() for s in pack.target_sectors.split(","))
            if client.sector and client.sector.lower() not in target_sectors:
                continue
        
        # Add as recommendation if not already in list
        if len(recommended_packs) < 3:
            recommended_packs.append(pack.code)
    
    return upsell_score, recommended_packs[:3]  # Max 3 recommendations


def compute_client_risk_score(tickets: List[Ticket]) -> Tuple[float, str]:
    """
    Compute support risk score (0-100) based on:
    - Number of tickets in last 90 days
    - Severity of tickets
    - Average resolution time
    
    Returns:
        tuple: (risk_score: float, risk_flag: str or None)
    
    Scoring Formula:
        volume_score = min(num_recent_tickets * 10, 40)
        severity_score = weighted_severity_average * 30
        resolution_score = avg_resolution_days_penalty
    """
    # Filter to recent tickets (last 90 days)
    cutoff = datetime.utcnow() - timedelta(days=90)
    recent_tickets = [t for t in tickets if t.created_at and t.created_at >= cutoff]
    
    if not recent_tickets:
        return 0.0, None
    
    # === Volume Score (max 40 points) ===
    volume_score = min(len(recent_tickets) * 8, 40)
    
    # === Severity Score (max 30 points) ===
    severity_sum = sum(SEVERITY_WEIGHTS.get(t.severity, 1) for t in recent_tickets)
    max_possible = len(recent_tickets) * 4  # If all critical
    severity_ratio = severity_sum / max_possible if max_possible > 0 else 0
    severity_score = severity_ratio * 30
    
    # === Resolution Time Score (max 30 points) ===
    resolution_times = []
    for t in recent_tickets:
        if t.resolved_at and t.created_at:
            days = (t.resolved_at - t.created_at).days
            resolution_times.append(days)
    
    resolution_score = 0
    if resolution_times:
        avg_days = sum(resolution_times) / len(resolution_times)
        if avg_days >= 14:
            resolution_score = 30
        elif avg_days >= 7:
            resolution_score = 20
        elif avg_days >= 3:
            resolution_score = 10
        else:
            resolution_score = 5
    
    # === Final risk score ===
    risk_score = round(volume_score + severity_score + resolution_score, 1)
    risk_score = min(100, max(0, risk_score))
    
    # Determine risk flag
    risk_flag = None
    if risk_score >= 60:
        # Check if mostly training issues
        training_count = sum(1 for t in recent_tickets if t.issue_type == "training")
        if training_count >= len(recent_tickets) * 0.5:
            risk_flag = "Training needed"
        else:
            risk_flag = "High support load"
    elif risk_score >= 40:
        risk_flag = "Monitor closely"
    
    return risk_score, risk_flag


# ============================================================
# API ENDPOINTS
# ============================================================

@router.get("/leads/ranked", response_model=List[LeadWithScore])
def get_ranked_leads(
    limit: int = 50,
    min_score: float = 0,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all leads ranked by score (highest first).
    
    Excludes 'won' and 'lost' leads by default.
    Use status_filter to include specific statuses.
    """
    query = db.query(Lead)
    
    # Exclude closed leads unless specifically requested
    if status_filter:
        query = query.filter(Lead.status == status_filter)
    else:
        query = query.filter(Lead.status.notin_(["won", "lost"]))
    
    leads = query.all()
    
    # Score each lead
    scored_leads = []
    for lead in leads:
        score, action = compute_lead_score(lead)
        
        if score >= min_score:
            scored_leads.append({
                "id": lead.id,
                "name": lead.name,
                "company": lead.company,
                "email": lead.email,
                "phone": lead.phone,
                "sector": lead.sector,
                "size": lead.size,
                "source": lead.source,
                "interested_modules": lead.interested_modules,
                "last_contact_date": lead.last_contact_date,
                "status": lead.status,
                "notes": lead.notes,
                "created_at": lead.created_at,
                "lead_score": score,
                "suggested_next_action": action
            })
    
    # Sort by score descending
    scored_leads.sort(key=lambda x: x["lead_score"], reverse=True)
    
    return scored_leads[:limit]


@router.get("/clients/ranked", response_model=List[ClientWithScore])
def get_ranked_clients(
    limit: int = 50,
    min_upsell_score: float = 0,
    risk_filter: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all clients ranked by upsell opportunity (highest first).
    
    Also includes risk scoring and pack recommendations.
    """
    clients = db.query(Client).all()
    all_packs = db.query(AutomationPack).filter(AutomationPack.is_active == 1).all()
    
    scored_clients = []
    for client in clients:
        # Get client's tickets
        tickets = db.query(Ticket).filter(Ticket.client_id == client.id).all()
        
        # Get installed pack codes
        installed = db.query(ClientAutomation).filter(
            ClientAutomation.client_id == client.id
        ).all()
        installed_codes = []
        for inst in installed:
            pack = db.query(AutomationPack).filter(AutomationPack.id == inst.pack_id).first()
            if pack:
                installed_codes.append(pack.code)
        
        # Compute scores
        upsell_score, recommended = compute_client_upsell_score(
            client, tickets, installed_codes, all_packs
        )
        risk_score, risk_flag = compute_client_risk_score(tickets)
        
        # Apply filters
        if upsell_score < min_upsell_score:
            continue
        if risk_filter and risk_flag != risk_filter:
            continue
        
        scored_clients.append({
            "id": client.id,
            "name": client.name,
            "company": client.company,
            "email": client.email,
            "phone": client.phone,
            "sector": client.sector,
            "size": client.size,
            "existing_products": client.existing_products,
            "annual_revenue_band": client.annual_revenue_band,
            "start_date": client.start_date,
            "last_project_date": client.last_project_date,
            "account_manager": client.account_manager,
            "notes": client.notes,
            "created_at": client.created_at,
            "upsell_score": upsell_score,
            "recommended_packs": recommended,
            "risk_score": risk_score,
            "risk_flag": risk_flag
        })
    
    # Sort by upsell score descending
    scored_clients.sort(key=lambda x: x["upsell_score"], reverse=True)
    
    return scored_clients[:limit]


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
    for client in clients:
        tickets = db.query(Ticket).filter(Ticket.client_id == client.id).all()
        installed = db.query(ClientAutomation).filter(
            ClientAutomation.client_id == client.id
        ).all()
        installed_codes = []
        for inst in installed:
            p = db.query(AutomationPack).filter(AutomationPack.id == inst.pack_id).first()
            if p:
                installed_codes.append(p.code)
        
        _, recommended = compute_client_upsell_score(client, tickets, installed_codes, all_packs)
        
        for pack_code in recommended:
            if pack_code in pack_potentials:
                pack_potentials[pack_code]["potential_count"] += 1
    
    return list(pack_potentials.values())
