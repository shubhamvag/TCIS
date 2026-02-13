"""
SQLAlchemy ORM Models for TCIS.

Entities:
- Lead: Prospective customers interested in Tally/MIS/HRMS products
- Client: Existing customers with installed products
- AutomationPack: Add-on modules that can be sold to clients
- Ticket: Support issues raised by clients
- ClientAutomation: Junction table tracking which packs a client has installed

Business Justification for Key Fields:
- sector: Used in scoring (manufacturing > trading > services for lead priority)
- size: Company size affects both lead scoring and upsell potential
- source: Lead source influences conversion probability (referral > cold)
- existing_products: Determines upsell recommendations (fewer products = more potential)
- issue_type: Ticket patterns suggest which automation packs to recommend
"""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship, backref
import enum

from .database import Base


# ============================================================
# ENUMS - Define allowed values for categorical fields
# ============================================================

class SectorEnum(str, enum.Enum):
    """Business sector classification. Affects scoring weights."""
    MANUFACTURING = "manufacturing"
    TRADING = "trading"
    SERVICES = "services"


class CompanySizeEnum(str, enum.Enum):
    """Company size bands. Affects both scoring and pricing."""
    SMALL = "small"       # < 20 employees
    MEDIUM = "medium"     # 20-100 employees
    LARGE = "large"       # > 100 employees


class LeadSourceEnum(str, enum.Enum):
    """
    How the lead was acquired.
    Scoring: referral=1.0, partner=0.8, indiamart=0.6, justdial=0.5, website=0.4, cold=0.3
    """
    REFERRAL = "referral"
    PARTNER = "partner"
    INDIAMART = "indiamart"
    JUSTDIAL = "justdial"
    WEBSITE = "website"
    COLD = "cold"


class LeadStatusEnum(str, enum.Enum):
    """Lead pipeline status."""
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"
    CONVERTED = "converted"


class LeadConversionSourceEnum(str, enum.Enum):
    """How the lead was converted to a client."""
    MANUAL = "manual"
    API = "api"
    SYNC = "sync"


class TicketTypeEnum(str, enum.Enum):
    """
    Issue category for support tickets.
    Used to detect patterns and recommend relevant automation packs.
    """
    GST = "gst"             # GST filing/compliance issues → recommend GST Health Pack
    INVENTORY = "inventory" # Stock/inventory issues → recommend Inventory Alert Pack
    REPORT = "report"       # Reporting inadequacy → recommend F-1 MIS Pack
    PERFORMANCE = "performance"  # System slowness
    TRAINING = "training"   # User training needs


class TicketSeverityEnum(str, enum.Enum):
    """Ticket urgency level. Affects risk scoring."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketStatusEnum(str, enum.Enum):
    """Ticket resolution status."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


# ============================================================
# ORM MODELS
# ============================================================

class Lead(Base):
    """
    Prospective customer who has shown interest in Tally products.
    
    Scoring uses: sector, size, source, interested_modules, last_contact_date
    """
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    
    # Contact information
    name = Column(String(100), nullable=False)
    company = Column(String(150), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    
    # Classification (used in scoring)
    sector = Column(String(20), default=SectorEnum.SERVICES.value)
    size = Column(String(20), default=CompanySizeEnum.SMALL.value)
    source = Column(String(20), default=LeadSourceEnum.COLD.value)
    
    # Geographic data (V2)
    city = Column(String(50))
    region = Column(String(20))  # e.g., North, South, East, West
    state = Column(String(50))   # e.g., Maharashtra, Karnataka
    
    # Interest tracking
    interested_modules = Column(String(200))  # Comma-separated: "tally,mis,hrms,inventory,gst"
    
    # Timeline
    last_contact_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Status
    status = Column(String(20), default=LeadStatusEnum.NEW.value)
    notes = Column(Text)

    # Conversion Tracking (V2.5)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    converted_at = Column(DateTime, nullable=True)
    conversion_source = Column(String(20), nullable=True) # manual, api, sync

    def __repr__(self):
        return f"<Lead {self.company} - {self.name}>"


class Client(Base):
    """
    Existing customer with installed Tally products.
    
    Upsell scoring uses: existing_products, last_project_date, sector, size
    Risk scoring uses: related tickets
    """
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    
    # Hierarchy (V2)
    parent_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    
    # Business information
    name = Column(String(100), nullable=False)  # Primary contact name
    company = Column(String(150), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    
    # Classification
    sector = Column(String(20), default=SectorEnum.SERVICES.value)
    size = Column(String(20), default=CompanySizeEnum.SMALL.value)
    
    # Geographic data (V2)
    city = Column(String(50))
    region = Column(String(20))
    state = Column(String(50))
    
    # Products and revenue
    existing_products = Column(String(200))  # Comma-separated: "tallyprime,f1_mis,hrms"
    annual_revenue_band = Column(String(20))  # Revenue FROM Tally: "0-50k", "50k-2L", "2L-5L", "5L+"
    
    # Relationship tracking
    start_date = Column(Date)  # When they became a client
    last_project_date = Column(Date)  # Last purchase/implementation
    account_manager = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    
    # Audit Trail
    origin_lead_id = Column(Integer, nullable=True)

    # Relationships
    tickets = relationship("Ticket", back_populates="client")
    installed_packs = relationship("ClientAutomation", back_populates="client")
    
    # Hierarchy relationship (V2)
    # parent_id is the FK. children are the back-relationship.
    sub_branches = relationship("Client", backref=backref("parent_company", remote_side=[id]))

    def __repr__(self):
        return f"<Client {self.company}>"


class AutomationPack(Base):
    """
    Add-on module/solution that can be sold to existing clients.
    """
    __tablename__ = "automation_packs"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)  # Short code: "GST_HEALTH"
    description = Column(Text)
    
    # Targeting criteria (used in recommendation logic)
    target_sectors = Column(String(100))  # Comma-separated sectors this pack suits
    required_existing_products = Column(String(200))  # Products client must have for this pack
    
    # Pricing
    price_band = Column(String(20))  # "10k-25k", "25k-50k", "50k-1L", "1L+"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1)  # 1=active, 0=discontinued

    # Relationships
    installations = relationship("ClientAutomation", back_populates="pack")

    def __repr__(self):
        return f"<AutomationPack {self.code}>"


class Ticket(Base):
    """
    Support issue raised by a client.
    """
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Issue details
    issue_type = Column(String(20), default=TicketTypeEnum.TRAINING.value)
    severity = Column(String(20), default=TicketSeverityEnum.MEDIUM.value)
    subject = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Timeline
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    # Status
    status = Column(String(20), default=TicketStatusEnum.OPEN.value)
    resolution_notes = Column(Text)

    # Relationships
    client = relationship("Client", back_populates="tickets")

    def __repr__(self):
        return f"<Ticket {self.id} - {self.subject[:30]}>"


class ClientAutomation(Base):
    """
    Junction table: Tracks which automation packs a client has installed.
    """
    __tablename__ = "client_automations"

    id = Column(Integer, primary_key=True, index=True)
    
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    pack_id = Column(Integer, ForeignKey("automation_packs.id"), nullable=False)
    
    installed_date = Column(Date)
    notes = Column(Text)

    # Relationships
    client = relationship("Client", back_populates="installed_packs")
    pack = relationship("AutomationPack", back_populates="installations")


# ============================================================
# NEW V2 MODELS
# ============================================================

class ScoringConfig(Base):
    """
    Dynamic weights for scoring logic. 
    Stored in DB to allow real-time tuning via Admin Panel.
    """
    __tablename__ = "scoring_configs"

    key = Column(String(50), primary_key=True)
    value = Column(Float, nullable=False)
    category = Column(String(20))  # 'sector', 'size', 'source', 'recency'
    label = Column(String(100))    # Human readable name

    def __repr__(self):
        return f"<ScoringConfig {self.key}={self.value}>"


class ScoreHistory(Base):
    """
    Historical log of scores for trend analysis.
    """
    __tablename__ = "score_histories"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, nullable=False)
    entity_type = Column(String(10), nullable=False)  # 'lead' or 'client'
    score = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ScoreHistory {self.entity_type} {self.entity_id}: {self.score}>"


class LeadConversion(Base):
    """
    Audit log for Lead-to-Client conversion events.
    """
    __tablename__ = "lead_conversions"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    source = Column(String(20), default=LeadConversionSourceEnum.MANUAL.value)
    performed_by = Column(String(100)) # User who triggered conversion
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text) # Additional context (overrides, etc.)
