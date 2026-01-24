"""
Automation Packs Router - CRUD operations for add-on modules.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AutomationPack, ClientAutomation
from ..schemas import (
    AutomationPackCreate, AutomationPackUpdate, 
    AutomationPackResponse, AutomationPackWithStats
)

router = APIRouter()


# ============================================================
# CREATE
# ============================================================

@router.post("/", response_model=AutomationPackResponse, status_code=201)
def create_pack(pack: AutomationPackCreate, db: Session = Depends(get_db)):
    """
    Create a new automation pack.
    
    Automation packs are add-on modules that can be sold to clients.
    Examples: GST Health Pack, Inventory Alert Pack, F-1 MIS Pack.
    """
    # Check for duplicate code
    existing = db.query(AutomationPack).filter(AutomationPack.code == pack.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Pack with code '{pack.code}' already exists")
    
    db_pack = AutomationPack(**pack.model_dump())
    db.add(db_pack)
    db.commit()
    db.refresh(db_pack)
    return db_pack


# ============================================================
# READ
# ============================================================

@router.get("/", response_model=List[AutomationPackResponse])
def list_packs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    active_only: bool = Query(True, description="Only show active packs"),
    db: Session = Depends(get_db)
):
    """
    List all automation packs.
    """
    query = db.query(AutomationPack)
    
    if active_only:
        query = query.filter(AutomationPack.is_active == 1)
    
    return query.offset(skip).limit(limit).all()


@router.get("/with-stats", response_model=List[AutomationPackWithStats])
def list_packs_with_stats(db: Session = Depends(get_db)):
    """
    List all packs with installation counts.
    """
    packs = db.query(AutomationPack).filter(AutomationPack.is_active == 1).all()
    
    result = []
    for pack in packs:
        installation_count = db.query(ClientAutomation).filter(
            ClientAutomation.pack_id == pack.id
        ).count()
        
        pack_data = AutomationPackWithStats(
            id=pack.id,
            name=pack.name,
            code=pack.code,
            description=pack.description,
            target_sectors=pack.target_sectors,
            required_existing_products=pack.required_existing_products,
            price_band=pack.price_band,
            is_active=pack.is_active,
            created_at=pack.created_at,
            installation_count=installation_count,
            potential_client_count=0  # Will be computed by scoring endpoint
        )
        result.append(pack_data)
    
    return result


@router.get("/{pack_id}", response_model=AutomationPackResponse)
def get_pack(pack_id: int, db: Session = Depends(get_db)):
    """
    Get a specific automation pack by ID.
    """
    pack = db.query(AutomationPack).filter(AutomationPack.id == pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    return pack


# ============================================================
# UPDATE
# ============================================================

@router.patch("/{pack_id}", response_model=AutomationPackResponse)
def update_pack(pack_id: int, pack_update: AutomationPackUpdate, db: Session = Depends(get_db)):
    """
    Update an automation pack.
    """
    pack = db.query(AutomationPack).filter(AutomationPack.id == pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    update_data = pack_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pack, field, value)
    
    db.commit()
    db.refresh(pack)
    return pack


# ============================================================
# DELETE
# ============================================================

@router.delete("/{pack_id}", status_code=204)
def delete_pack(pack_id: int, db: Session = Depends(get_db)):
    """
    Delete an automation pack.
    """
    pack = db.query(AutomationPack).filter(AutomationPack.id == pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    db.delete(pack)
    db.commit()
    return None
