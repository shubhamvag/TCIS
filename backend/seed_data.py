"""
TCIS Sample Data Seeder

Generates realistic sample data for the TCIS application:
- 25 leads (prospective customers)
- 25 clients (existing customers)
- 8 automation packs
- 40 support tickets

Run with: python seed_data.py
Requires: Backend database.py to be in app/ folder
"""
import sys
import os
from datetime import date, datetime, timedelta
import random

# Add app directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import (
    Lead, Client, AutomationPack, Ticket, ClientAutomation, 
    ScoringConfig, ScoreHistory
)


# ============================================================
# SAMPLE DATA POOLS - Realistic Indian SME names
# ============================================================

INDIAN_COMPANY_NAMES = [
    "Shree Ganesh Traders", "Patel Engineering Co.", "Sharma Industries",
    "Rajesh Textiles Pvt Ltd", "Gupta Iron & Steel", "Mehta Plastics",
    "Jain Brothers Trading", "Agarwal Exports", "Singh Manufacturing",
    "Kumar Pharmaceuticals", "Desai Electronics", "Bhandari Chemicals",
    "Chopra Auto Parts", "Malhotra Foods", "Verma Cement Works",
    "Reddy Agro Industries", "Kapoor Garments", "Saxena IT Solutions",
    "Bansal Hardware", "Arora Electricals", "Mittal Steel Corp",
    "Goyal Paper Mills", "Thakur Construction", "Nair Exports",
    "Iyer Software Services", "Pillai Traders", "Choudhary Motors",
    "Bhalla Machinery", "Sethi Marble Works", "Dhawan Logistics"
]

INDIAN_CITIES = [
    ("Mumbai", "Maharashtra", "West"), 
    ("Pune", "Maharashtra", "West"), 
    ("Ahmedabad", "Gujarat", "West"),
    ("Surat", "Gujarat", "West"),
    ("Delhi", "Delhi", "North"), 
    ("Gurgaon", "Haryana", "North"), 
    ("Chandigarh", "Punjab", "North"),
    ("Jaipur", "Rajasthan", "North"),
    ("Bangalore", "Karnataka", "South"), 
    ("Chennai", "Tamil Nadu", "South"), 
    ("Hyderabad", "Telangana", "South"),
    ("Kochi", "Kerala", "South"),
    ("Kolkata", "West Bengal", "East"), 
    ("Bhubaneswar", "Odisha", "East"), 
    ("Jamshedpur", "Jharkhand", "East"),
    ("Indore", "Madhya Pradesh", "Central"), 
    ("Bhopal", "Madhya Pradesh", "Central"), 
    ("Raipur", "Chhattisgarh", "Central"),
    ("Nagpur", "Maharashtra", "Central")
]

INDIAN_FIRST_NAMES = [
    "Rajesh", "Suresh", "Mahesh", "Priya", "Anjali", "Vikram",
    "Amit", "Neha", "Sanjay", "Kavita", "Ravi", "Sunita",
    "Arun", "Meena", "Deepak", "Pooja", "Manish", "Rekha"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Jain",
    "Agarwal", "Mehta", "Verma", "Reddy", "Nair", "Iyer"
]

ACCOUNT_MANAGERS = ["Rahul Desai", "Priya Mehta", "Amit Shah", "Kavita Joshi"]

SECTORS = ["manufacturing", "trading", "services"]
SIZES = ["small", "medium", "large"]
SOURCES = ["referral", "partner", "indiamart", "justdial", "website", "cold"]
LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation"]
MODULES = ["tally", "mis", "hrms", "inventory", "gst"]
PRODUCTS = ["tallyprime", "f1_mis", "hrms", "inventory", "gst"]
REVENUE_BANDS = ["0-50k", "50k-2L", "2L-5L", "5L+"]
ISSUE_TYPES = ["gst", "inventory", "report", "performance", "training"]
SEVERITIES = ["low", "medium", "high", "critical"]
TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"]


def random_phone():
    """Generate random Indian mobile number."""
    return f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}"


def random_email(name: str, company: str) -> str:
    """Generate email from name and company."""
    first = name.split()[0].lower()
    domain = company.split()[0].lower().replace("'", "")
    return f"{first}@{domain}.com"


def random_date_in_range(start_days_ago: int, end_days_ago: int) -> date:
    """Generate random date in given range (days ago from today)."""
    days = random.randint(end_days_ago, start_days_ago)
    return date.today() - timedelta(days=days)


def seed_scoring_configs(db):
    """Seed initial scoring weights."""
    print("Seeding scoring configs...")
    
    configs = [
        # Sectors
        {"key": "sector_manufacturing", "value": 1.0, "category": "sector", "label": "Manufacturing Weight"},
        {"key": "sector_trading", "value": 0.7, "category": "sector", "label": "Trading Weight"},
        {"key": "sector_services", "value": 0.5, "category": "sector", "label": "Services Weight"},
        # Sizes
        {"key": "size_large", "value": 1.0, "category": "size", "label": "Large Company Weight"},
        {"key": "size_medium", "value": 0.7, "category": "size", "label": "Medium Company Weight"},
        {"key": "size_small", "value": 0.4, "category": "size", "label": "Small Company Weight"},
        # Sources
        {"key": "source_referral", "value": 1.0, "category": "source", "label": "Referral Source Weight"},
        {"key": "source_partner", "value": 0.8, "category": "source", "label": "Partner Source Weight"},
        {"key": "source_indiamart", "value": 0.6, "category": "source", "label": "IndiaMart Source Weight"},
        {"key": "source_justdial", "value": 0.5, "category": "source", "label": "JustDial Source Weight"},
        {"key": "source_website", "value": 0.4, "category": "source", "label": "Website Source Weight"},
        {"key": "source_cold", "value": 0.3, "category": "source", "label": "Cold Outreach Weight"},
    ]
    
    for cfg_data in configs:
        cfg = ScoringConfig(**cfg_data)
        db.merge(cfg)  # merge handles existing keys
    
    db.commit()
    print(f"  ✓ Created {len(configs)} scoring configurations")


def seed_automation_packs(db):
    """Seed 8 automation packs."""
    print("Seeding automation packs...")
    
    packs_data = [
        {
            "name": "GST Health Pack",
            "code": "GST_HEALTH",
            "description": "Automated GST reconciliation, health checks, and filing reminders. Reduces GST-related errors by 80%.",
            "target_sectors": "manufacturing,trading",
            "required_existing_products": "tallyprime",
            "price_band": "25k-50k"
        },
        {
            "name": "Inventory Alert Pack",
            "code": "INV_ALERT",
            "description": "Real-time stock alerts, reorder notifications, and aging inventory reports.",
            "target_sectors": "manufacturing,trading",
            "required_existing_products": "tallyprime",
            "price_band": "25k-50k"
        },
        {
            "name": "F-1 MIS Executive Pack",
            "code": "F1_MIS",
            "description": "Custom executive dashboards, automated MIS reports, and WhatsApp alerts for business owners.",
            "target_sectors": "manufacturing,trading,services",
            "required_existing_products": "tallyprime",
            "price_band": "50k-1L"
        },
        {
            "name": "Owner Insight Pack",
            "code": "OWNER_INSIGHT",
            "description": "Mobile alerts for key business metrics - sales, receivables, bank balance. Daily digest on WhatsApp.",
            "target_sectors": "manufacturing,trading,services",
            "required_existing_products": "tallyprime,f1_mis",
            "price_band": "25k-50k"
        },
        {
            "name": "Receivable Control Pack",
            "code": "AR_CONTROL",
            "description": "Automated AR aging alerts, payment reminders, and collection follow-up workflows.",
            "target_sectors": "trading,services",
            "required_existing_products": "tallyprime",
            "price_band": "25k-50k"
        },
        {
            "name": "HRMS Essential Pack",
            "code": "HRMS_BASIC",
            "description": "Employee master, attendance integration, and payroll processing with Tally sync.",
            "target_sectors": "manufacturing,services",
            "required_existing_products": "tallyprime",
            "price_band": "50k-1L"
        },
        {
            "name": "Multi-Branch Consolidation Pack",
            "code": "MULTI_BRANCH",
            "description": "Consolidate data from multiple Tally instances. Real-time branch comparison reports.",
            "target_sectors": "trading",
            "required_existing_products": "tallyprime,f1_mis",
            "price_band": "1L+"
        },
        {
            "name": "Audit Ready Pack",
            "code": "AUDIT_READY",
            "description": "Pre-audit checks, document organization, and auditor-friendly report generation.",
            "target_sectors": "manufacturing,trading,services",
            "required_existing_products": "tallyprime",
            "price_band": "25k-50k"
        }
    ]
    
    for pack_data in packs_data:
        pack = AutomationPack(**pack_data)
        db.add(pack)
    
    db.commit()
    print(f"  ✓ Created {len(packs_data)} automation packs")


def seed_leads(db):
    """Seed 25 leads with Geo data."""
    print("Seeding leads...")
    
    leads_created = 0
    companies_used = random.sample(INDIAN_COMPANY_NAMES, 25)
    
    for company in companies_used:
        name = f"{random.choice(INDIAN_FIRST_NAMES)} {random.choice(INDIAN_LAST_NAMES)}"
        city, state, region = random.choice(INDIAN_CITIES)
        
        # Weight towards cold/indiamart sources (realistic for B2B)
        source = random.choices(
            SOURCES,
            weights=[0.15, 0.1, 0.25, 0.2, 0.1, 0.2]
        )[0]
        
        # Interested in 1-4 modules
        num_modules = random.randint(1, 4)
        interested = ",".join(random.sample(MODULES, num_modules))
        
        lead = Lead(
            name=name,
            company=company,
            email=random_email(name, company),
            phone=random_phone(),
            sector=random.choice(SECTORS),
            size=random.choices(SIZES, weights=[0.5, 0.35, 0.15])[0],
            source=source,
            city=city,
            state=state,
            region=region,
            interested_modules=interested,
            last_contact_date=random_date_in_range(90, 1) if random.random() > 0.2 else None,
            status=random.choice(LEAD_STATUSES),
            notes=f"Interested in Tally automation. Located in {city}, {state} ({region})."
        )
        db.add(lead)
        leads_created += 1
    
    db.commit()
    print(f"  ✓ Created {leads_created} leads")


def seed_clients(db):
    """Seed 25 clients with Geo data and Hierarchy."""
    print("Seeding clients...")
    
    clients_created = 0
    # Use different companies than leads
    companies_used = random.sample(INDIAN_COMPANY_NAMES, 25)
    
    created_clients = []
    for company in companies_used:
        name = f"{random.choice(INDIAN_FIRST_NAMES)} {random.choice(INDIAN_LAST_NAMES)}"
        city, state, region = random.choice(INDIAN_CITIES)
        
        # All clients have TallyPrime, some have more
        base_products = ["tallyprime"]
        if random.random() > 0.6:
            base_products.append("f1_mis")
        if random.random() > 0.8:
            base_products.append(random.choice(["hrms", "inventory", "gst"]))
        
        client = Client(
            name=name,
            company=company,
            email=random_email(name, company),
            phone=random_phone(),
            sector=random.choice(SECTORS),
            size=random.choices(SIZES, weights=[0.4, 0.4, 0.2])[0],
            city=city,
            state=state,
            region=region,
            existing_products=",".join(base_products),
            annual_revenue_band=random.choice(REVENUE_BANDS),
            start_date=random_date_in_range(730, 90),  # 2 years to 3 months ago
            last_project_date=random_date_in_range(365, 30),  # 1 year to 1 month ago
            account_manager=random.choice(ACCOUNT_MANAGERS),
            notes=f"Long-term client in {city}, {state}. Primary contact: {name}."
        )
        db.add(client)
        created_clients.append(client)
        clients_created += 1
    
    db.commit()
    
    # Establish some Hierarchies (Branches)
    print("  Creating hierarchies...")
    potential_parents = [c for c in created_clients if c.size == "large"]
    for i in range(len(created_clients)):
        if random.random() > 0.8 and potential_parents:
            parent = random.choice(potential_parents)
            if parent.id != created_clients[i].id:
                created_clients[i].parent_id = parent.id
                created_clients[i].company = f"{parent.company} - {created_clients[i].city} Branch"
    
    db.commit()
    print(f"  ✓ Created {clients_created} clients with hierarchies")


def seed_tickets(db):
    """Seed 40 tickets across clients."""
    print("Seeding tickets...")
    
    clients = db.query(Client).all()
    if not clients:
        print("  ⚠ No clients found. Skipping tickets.")
        return
    
    tickets_created = 0
    ticket_subjects = {
        "gst": [
            "GST return mismatch", "GSTR-2A reconciliation issue",
            "E-way bill generation error", "GST filing deadline alert"
        ],
        "inventory": [
            "Stock discrepancy", "Negative stock showing",
            "Batch number tracking issue", "Godown transfer not reflecting"
        ],
        "report": [
            "MIS report not generating", "Cash flow report incorrect",
            "Need custom sales report", "Balance sheet not tallying"
        ],
        "performance": [
            "Tally running slow", "Data sync taking too long",
            "Report generation timeout", "Network backup failing"
        ],
        "training": [
            "New staff needs training", "GST module usage training",
            "MIS dashboard training needed", "Inventory module training"
        ]
    }
    
    for _ in range(40):
        client = random.choice(clients)
        issue_type = random.choices(
            ISSUE_TYPES,
            weights=[0.25, 0.2, 0.25, 0.1, 0.2]  # More GST and report issues
        )[0]
        
        severity = random.choices(
            SEVERITIES,
            weights=[0.2, 0.4, 0.3, 0.1]
        )[0]
        
        created = random_date_in_range(90, 1)
        created_dt = datetime.combine(created, datetime.min.time())
        
        # 70% of tickets are resolved
        resolved = None
        status = random.choices(
            TICKET_STATUSES,
            weights=[0.1, 0.2, 0.4, 0.3]
        )[0]
        
        if status in ["resolved", "closed"]:
            days_to_resolve = random.randint(1, 14)
            resolved = created_dt + timedelta(days=days_to_resolve)
        
        ticket = Ticket(
            client_id=client.id,
            issue_type=issue_type,
            severity=severity,
            subject=random.choice(ticket_subjects[issue_type]),
            description=f"Client reported {issue_type} related issue. Priority: {severity}.",
            created_at=created_dt,
            resolved_at=resolved,
            status=status,
            resolution_notes="Resolved via remote session." if resolved else None
        )
        db.add(ticket)
        tickets_created += 1
    
    db.commit()
    print(f"  ✓ Created {tickets_created} tickets")


def seed_client_automations(db):
    """Seed some pack installations for clients."""
    print("Seeding client automation installations...")
    
    clients = db.query(Client).all()
    packs = db.query(AutomationPack).all()
    
    if not clients or not packs:
        print("  ⚠ No clients or packs found. Skipping installations.")
        return
    
    installations = 0
    
    # About 30% of clients have at least one pack
    for client in random.sample(clients, len(clients) // 3):
        # Install 1-2 packs per client
        num_packs = random.randint(1, 2)
        client_packs = random.sample(packs, min(num_packs, len(packs)))
        
        for pack in client_packs:
            installation = ClientAutomation(
                client_id=client.id,
                pack_id=pack.id,
                installed_date=random_date_in_range(180, 30),
                notes=f"Installed {pack.code} pack."
            )
            db.add(installation)
            installations += 1
    
    db.commit()
    print(f"  ✓ Created {installations} pack installations")


def main():
    """Run all seeders."""
    print("=" * 50)
    print("TCIS Database Seeder")
    print("=" * 50)
    
    # Create tables
    print("\nCreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("  ✓ Tables created")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Seed in order
        print("\nSeeding data...")
        seed_scoring_configs(db)
        seed_automation_packs(db)
        seed_leads(db)
        seed_clients(db)
        seed_tickets(db)
        seed_client_automations(db)
        
        print("\n" + "=" * 50)
        print("✅ Database seeding complete!")
        print("=" * 50)
        
        # Summary
        print(f"\nSummary:")
        print(f"  - Leads: {db.query(Lead).count()}")
        print(f"  - Clients: {db.query(Client).count()}")
        print(f"  - Automation Packs: {db.query(AutomationPack).count()}")
        print(f"  - Tickets: {db.query(Ticket).count()}")
        print(f"  - Pack Installations: {db.query(ClientAutomation).count()}")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
