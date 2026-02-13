export interface Lead {
    id: number;
    name: string;
    company: string;
    email?: string;
    phone?: string;
    sector: string;
    size: string;
    source: string;
    city?: string;
    region?: string;
    lead_score: number;
    suggested_next_action: string;
    status: string;
    score_breakdown?: Record<string, number>;
    client_id?: number;
    converted_at?: string;
    conversion_source?: string;
}

export interface Client {
    id: number;
    name: string;
    company: string;
    parent_id?: number;
    sector: string;
    size: string;
    city?: string;
    region?: string;
    upsell_score: number;
    recommended_packs: string[];
    risk_score: number;
    risk_flag: string | null;
    score_breakdown?: Record<string, number>;
    origin_lead_id?: number;
}

export interface AutomationPack {
    id: number;
    code: string;
    name: string;
    description: string;
    price_band: string;
    installation_count: number;
    potential_count: number;
}

export interface ScoringConfig {
    key: string;
    value: number;
    category: string;
    label: string;
}

export interface ScoreHistory {
    id: number;
    entity_id: number;
    entity_type: string;
    score: number;
    recorded_at: string;
}

export interface RegionalMetrics {
    name: string;
    region: string;
    lead_count: number;
    client_count: number;
    avg_lead_score: number;
    opportunity_density: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    recommended_action: string;
    top_cities: Array<{
        name: string;
        count: number;
        avg_quality: number;
    }>;
}

export interface GeoSummary {
    filters: { sector?: string };
    states: Record<string, RegionalMetrics>;
    unmapped: { count: number };
}

export interface HierarchyBranch {
    id: number;
    company: string;
    city: string;
    region: string;
    score?: number;
    is_current: boolean;
    sub_branches: HierarchyBranch[];
}

export interface HierarchyContract {
    focus_client_id: number;
    parent: { id: number, company: string, score?: number } | null;
    siblings: Array<{ id: number, company: string, score?: number, location: string }>;
    tree: HierarchyBranch;
    group_metrics: {
        total_branches: number;
        primary_region: string;
    };
}

export interface TicketStats {
    by_type: { type: string; count: number }[];
    by_status: { status: string; count: number }[];
    top_clients: { company: string; ticket_count: number }[];
}

export interface MarketAnomaly {
    region_name: string;
    region_type: string;
    current_avg: number;
    historical_avg: number;
    velocity_score: number;
    anomaly_flag: boolean;
    lead_count: number;
}
