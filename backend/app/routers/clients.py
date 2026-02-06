"""
Clients Router - CRUD operations for existing customers.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Client
from ..schemas import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter()


# ============================================================
# CREATE
# ============================================================

@router.post("/", response_model=ClientResponse, status_code=201)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """
    Create a new client.
    
    A client is an existing customer with installed Metavision products.
    """
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


# ============================================================
# READ
# ============================================================

@router.get("/", response_model=List[ClientResponse])
def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    sector: Optional[str] = None,
    size: Optional[str] = None,
    account_manager: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all clients with optional filters.
    
    Filters:
    - sector: manufacturing/trading/services
    - size: small/medium/large
    - account_manager: Filter by assigned account manager
    """
    query = db.query(Client)
    
    if sector:
        query = query.filter(Client.sector == sector)
    if size:
        query = query.filter(Client.size == size)
    if account_manager:
        query = query.filter(Client.account_manager == account_manager)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """
    Get a specific client by ID.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


# ============================================================
# UPDATE
# ============================================================

@router.patch("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client_update: ClientUpdate, db: Session = Depends(get_db)):
    """
    Update a client's information.
    Only provided fields will be updated.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    return client


# ============================================================
# DELETE
# ============================================================

@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """
    Delete a client.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(client)
    db.commit()
    return None
@router.get("/{client_id}/hierarchy")
def get_client_hierarchy(client_id: int, db: Session = Depends(get_db)):
    """
    Get the deep structural intelligence (parent, siblings, group metrics).
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Root Parent Detection
    root_client = client
    while root_client.parent_id:
        parent = db.query(Client).filter(Client.id == root_client.parent_id).first()
        if not parent: break
        root_client = parent

    # Syblings Detection (Other children of the same parent)
    siblings = []
    if client.parent_id:
        siblings = [
            {"id": s.id, "company": s.company, "location": f"{s.city}, {s.region}"}
            for s in db.query(Client).filter(Client.parent_id == client.parent_id, Client.id != client_id).all()
        ]

    # Recursive Tree Builder
    def build_tree(c):
        return {
            "id": c.id,
            "company": c.company,
            "city": c.city,
            "region": c.region,
            "is_current": c.id == client_id,
            "sub_branches": [build_tree(sub) for sub in c.sub_branches]
        }

    return {
        "focus_client_id": client_id,
        "parent": {
            "id": root_client.id, 
            "company": root_client.company
        } if root_client.id != client_id else None,
        "siblings": siblings,
        "tree": build_tree(root_client),
        "group_metrics": {
            "total_branches": len(root_client.sub_branches),
            "primary_region": root_client.region
        }
    }
