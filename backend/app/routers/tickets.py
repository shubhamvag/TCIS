"""
Tickets Router - CRUD operations for support issues.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Ticket, Client
from ..schemas import TicketCreate, TicketUpdate, TicketResponse

router = APIRouter()


# ============================================================
# CREATE
# ============================================================

@router.post("/", response_model=TicketResponse, status_code=201)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """
    Create a new support ticket.
    
    Tickets are used in risk scoring and to detect patterns
    that suggest which automation packs a client might need.
    """
    # Verify client exists
    client = db.query(Client).filter(Client.id == ticket.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_ticket = Ticket(**ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


# ============================================================
# READ
# ============================================================

@router.get("/", response_model=List[TicketResponse])
def list_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    client_id: Optional[int] = None,
    issue_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all tickets with optional filters.
    
    Filters:
    - client_id: Filter by specific client
    - issue_type: gst/inventory/report/performance/training
    - severity: low/medium/high/critical
    - status: open/in_progress/resolved/closed
    """
    query = db.query(Ticket)
    
    if client_id:
        query = query.filter(Ticket.client_id == client_id)
    if issue_type:
        query = query.filter(Ticket.issue_type == issue_type)
    if severity:
        query = query.filter(Ticket.severity == severity)
    if status:
        query = query.filter(Ticket.status == status)
    
    return query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/stats")
def get_ticket_stats(db: Session = Depends(get_db)):
    """
    Get ticket statistics for analytics dashboard.
    """
    # Tickets by type
    by_type = db.query(
        Ticket.issue_type,
        func.count(Ticket.id).label('count')
    ).group_by(Ticket.issue_type).all()
    
    # Tickets by severity
    by_severity = db.query(
        Ticket.severity,
        func.count(Ticket.id).label('count')
    ).group_by(Ticket.severity).all()
    
    # Tickets by status
    by_status = db.query(
        Ticket.status,
        func.count(Ticket.id).label('count')
    ).group_by(Ticket.status).all()
    
    # Top clients by ticket count
    top_clients = db.query(
        Client.company,
        func.count(Ticket.id).label('ticket_count')
    ).join(Ticket).group_by(Client.id).order_by(
        func.count(Ticket.id).desc()
    ).limit(10).all()
    
    return {
        "by_type": [{"type": t, "count": c} for t, c in by_type],
        "by_severity": [{"severity": s, "count": c} for s, c in by_severity],
        "by_status": [{"status": s, "count": c} for s, c in by_status],
        "top_clients": [{"company": comp, "ticket_count": cnt} for comp, cnt in top_clients]
    }


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """
    Get a specific ticket by ID.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


# ============================================================
# UPDATE
# ============================================================

@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, ticket_update: TicketUpdate, db: Session = Depends(get_db)):
    """
    Update a ticket.
    If status changes to 'resolved' or 'closed', auto-set resolved_at.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    update_data = ticket_update.model_dump(exclude_unset=True)
    
    # Auto-set resolved_at when status changes to resolved/closed
    if update_data.get('status') in ['resolved', 'closed'] and not ticket.resolved_at:
        update_data['resolved_at'] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(ticket, field, value)
    
    db.commit()
    db.refresh(ticket)
    return ticket


# ============================================================
# DELETE
# ============================================================

@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """
    Delete a ticket.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db.delete(ticket)
    db.commit()
    return None
