"""
Pydantic Schemas for TCIS API.

These schemas define the request/response format for the REST API.
Separate from ORM models to allow flexibility in what data is exposed.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


# ============================================================
# LEAD SCHEMAS
# ============================================================

class LeadBase(BaseModel):
    """Base fields shared by create and update operations."""
    name: str = Field(..., max_length=100, description="Contact person name")
    company: str = Field(..., max_length=150, description="Company name")
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    sector: str = Field("services", description="manufacturing/trading/services")
    size: str = Field("small", description="small/medium/large")
    source: str = Field("cold", description="referral/partner/indiamart/justdial/website/cold")
    interested_modules: Optional[str] = Field(None, description="Comma-separated: tally,mis,hrms,inventory,gst")
    last_contact_date: Optional[date] = None
    status: str = Field("new", description="new/contacted/qualified/proposal/negotiation/won/lost")
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    """Schema for creating a new lead."""
    pass


class LeadUpdate(BaseModel):
    """Schema for updating a lead. All fields optional."""
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    size: Optional[str] = None
    source: Optional[str] = None
    interested_modules: Optional[str] = None
    last_contact_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class LeadResponse(LeadBase):
    """Schema for lead responses. Includes ID and timestamps."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LeadWithScore(LeadResponse):
    """Lead with computed scoring information."""
    lead_score: float = Field(..., description="Computed lead score (0-100)")
    suggested_next_action: str = Field(..., description="Recommended next step")


# ============================================================
# CLIENT SCHEMAS
# ============================================================

class ClientBase(BaseModel):
    """Base fields for client operations."""
    name: str = Field(..., max_length=100, description="Primary contact name")
    company: str = Field(..., max_length=150, description="Company name")
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    sector: str = Field("services")
    size: str = Field("small")
    existing_products: Optional[str] = Field(None, description="Comma-separated: tallyprime,f1_mis,hrms,inventory,gst")
    annual_revenue_band: Optional[str] = Field(None, description="0-50k/50k-2L/2L-5L/5L+")
    start_date: Optional[date] = None
    last_project_date: Optional[date] = None
    account_manager: Optional[str] = None
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client. All fields optional."""
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    size: Optional[str] = None
    existing_products: Optional[str] = None
    annual_revenue_band: Optional[str] = None
    start_date: Optional[date] = None
    last_project_date: Optional[date] = None
    account_manager: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(ClientBase):
    """Schema for client responses."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ClientWithScore(ClientResponse):
    """Client with computed upsell and risk scoring."""
    upsell_score: float = Field(..., description="Upsell opportunity score (0-100)")
    recommended_packs: List[str] = Field(default_factory=list, description="Suggested automation pack codes")
    risk_score: float = Field(..., description="Support risk score (0-100)")
    risk_flag: Optional[str] = Field(None, description="High support load / Training needed / None")


# ============================================================
# AUTOMATION PACK SCHEMAS
# ============================================================

class AutomationPackBase(BaseModel):
    """Base fields for automation pack operations."""
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=20, description="Short unique code e.g. GST_HEALTH")
    description: Optional[str] = None
    target_sectors: Optional[str] = Field(None, description="Comma-separated sectors")
    required_existing_products: Optional[str] = Field(None, description="Products needed for this pack")
    price_band: Optional[str] = Field(None, description="10k-25k/25k-50k/50k-1L/1L+")
    is_active: int = Field(1, description="1=active, 0=discontinued")


class AutomationPackCreate(AutomationPackBase):
    """Schema for creating a new pack."""
    pass


class AutomationPackUpdate(BaseModel):
    """Schema for updating a pack. All fields optional."""
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    target_sectors: Optional[str] = None
    required_existing_products: Optional[str] = None
    price_band: Optional[str] = None
    is_active: Optional[int] = None


class AutomationPackResponse(AutomationPackBase):
    """Schema for pack responses."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AutomationPackWithStats(AutomationPackResponse):
    """Pack with installation statistics."""
    installation_count: int = Field(0, description="Number of clients with this pack")
    potential_client_count: int = Field(0, description="Clients who could benefit from this pack")


# ============================================================
# TICKET SCHEMAS
# ============================================================

class TicketBase(BaseModel):
    """Base fields for ticket operations."""
    client_id: int
    issue_type: str = Field("training", description="gst/inventory/report/performance/training")
    severity: str = Field("medium", description="low/medium/high/critical")
    subject: str = Field(..., max_length=200)
    description: Optional[str] = None
    status: str = Field("open", description="open/in_progress/resolved/closed")
    resolution_notes: Optional[str] = None


class TicketCreate(TicketBase):
    """Schema for creating a new ticket."""
    pass


class TicketUpdate(BaseModel):
    """Schema for updating a ticket. All fields optional."""
    issue_type: Optional[str] = None
    severity: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None


class TicketResponse(TicketBase):
    """Schema for ticket responses."""
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# CLIENT AUTOMATION (JUNCTION) SCHEMAS
# ============================================================

class ClientAutomationBase(BaseModel):
    """Base fields for client-pack relationship."""
    client_id: int
    pack_id: int
    installed_date: Optional[date] = None
    notes: Optional[str] = None


class ClientAutomationCreate(ClientAutomationBase):
    """Schema for recording a pack installation."""
    pass


class ClientAutomationResponse(ClientAutomationBase):
    """Schema for installation responses."""
    id: int

    class Config:
        from_attributes = True
