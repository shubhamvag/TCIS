-- ============================================================
-- TCIS Database Schema (SQLite)
-- Metavision Tally Client Intelligence Suite
-- ============================================================
-- This schema is designed for SQLite but can be migrated to PostgreSQL
-- by changing INTEGER PRIMARY KEY to SERIAL and datetime to TIMESTAMP.
-- ============================================================

-- Leads: Prospective customers
-- Scoring uses: sector, size, source, interested_modules, last_contact_date
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Contact information
    name VARCHAR(100) NOT NULL,
    company VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    
    -- Classification (affects scoring)
    sector VARCHAR(20) DEFAULT 'services',         -- manufacturing/trading/services
    size VARCHAR(20) DEFAULT 'small',               -- small/medium/large
    source VARCHAR(20) DEFAULT 'cold',              -- referral/partner/indiamart/justdial/website/cold
    
    -- Interest tracking
    interested_modules VARCHAR(200),                -- Comma-separated: tally,mis,hrms,inventory,gst
    
    -- Timeline
    last_contact_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'new',               -- new/contacted/qualified/proposal/negotiation/won/lost
    notes TEXT
);

-- Clients: Existing customers
-- Upsell scoring uses: existing_products, last_project_date, sector, size
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Business information
    name VARCHAR(100) NOT NULL,                     -- Primary contact name
    company VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    
    -- Classification
    sector VARCHAR(20) DEFAULT 'services',
    size VARCHAR(20) DEFAULT 'small',
    
    -- Products and revenue
    existing_products VARCHAR(200),                 -- Comma-separated: tallyprime,f1_mis,hrms
    annual_revenue_band VARCHAR(20),                -- 0-50k/50k-2L/2L-5L/5L+
    
    -- Relationship tracking
    start_date DATE,
    last_project_date DATE,
    account_manager VARCHAR(100),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- AutomationPacks: Add-on modules for sale
CREATE TABLE IF NOT EXISTS automation_packs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,               -- Short code: GST_HEALTH, INV_ALERT
    description TEXT,
    
    -- Targeting criteria
    target_sectors VARCHAR(100),                    -- Comma-separated sectors this pack suits
    required_existing_products VARCHAR(200),        -- Products client must have
    
    -- Pricing
    price_band VARCHAR(20),                         -- 10k-25k/25k-50k/50k-1L/1L+
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1                     -- 1=active, 0=discontinued
);

-- Tickets: Support issues
-- Used in risk scoring and pack recommendations
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    client_id INTEGER NOT NULL,
    
    -- Issue details
    issue_type VARCHAR(20) DEFAULT 'training',      -- gst/inventory/report/performance/training
    severity VARCHAR(20) DEFAULT 'medium',          -- low/medium/high/critical
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Timeline
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    
    -- Status
    status VARCHAR(20) DEFAULT 'open',              -- open/in_progress/resolved/closed
    resolution_notes TEXT,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ClientAutomations: Junction table for installed packs
CREATE TABLE IF NOT EXISTS client_automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    client_id INTEGER NOT NULL,
    pack_id INTEGER NOT NULL,
    
    installed_date DATE,
    notes TEXT,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (pack_id) REFERENCES automation_packs(id) ON DELETE CASCADE,
    
    UNIQUE(client_id, pack_id)                      -- Prevent duplicate installations
);

-- ============================================================
-- INDEXES for common queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_sector ON leads(sector);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

CREATE INDEX IF NOT EXISTS idx_clients_sector ON clients(sector);
CREATE INDEX IF NOT EXISTS idx_clients_size ON clients(size);

CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(issue_type);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_client_automations_client ON client_automations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_automations_pack ON client_automations(pack_id);
