"""
Leads Router - CRUD operations for prospective customers.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Lead
from ..schemas import LeadCreate, LeadUpdate, LeadResponse

router = APIRouter()


# ============================================================
# CREATE
# ============================================================

@router.post("/", response_model=LeadResponse, status_code=201)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """
    Create a new lead.
    
    A lead represents a prospective customer who has shown interest
    in Metavision products (Tally, MIS, HRMS, etc.).
    """
    db_lead = Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


# ============================================================
# READ
# ============================================================

@router.get("/", response_model=List[LeadResponse])
def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    sector: Optional[str] = None,
    source: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all leads with optional filters.
    
    Filters:
    - sector: manufacturing/trading/services
    - source: referral/partner/indiamart/justdial/website/cold
    - status: new/contacted/qualified/proposal/negotiation/won/lost
    """
    query = db.query(Lead)
    
    if sector:
        query = query.filter(Lead.sector == sector)
    if source:
        query = query.filter(Lead.source == source)
    if status:
        query = query.filter(Lead.status == status)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    Get a specific lead by ID.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


# ============================================================
# UPDATE
# ============================================================

@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, lead_update: LeadUpdate, db: Session = Depends(get_db)):
    """
    Update a lead's information.
    Only provided fields will be updated.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)
    return lead


# ============================================================
# DELETE
# ============================================================

@router.delete("/{lead_id}", status_code=204)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    Delete a lead.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
    return None
