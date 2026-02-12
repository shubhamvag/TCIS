# TCIS V2 Operator Manual: Advanced Intelligence Layer

Welcome to the Metavision Tally Client Intelligence Suite (TCIS) V2. This manual provides operational guidance on managing the advanced scoring systems, interpreting analytics, and using the geocentric intelligence maps.

## 1. Intelligence Scoring Model

TCIS uses a deterministic, multi-vector scoring model to rank Leads and Clients.

### Lead Quality Index (0-100)
- **Sector Fit**: Weighted intensity based on the prospect's industry.
- **Size Fit**: Scoring based on employee count/company scale.
- **Source Quality**: Reliability factor of the lead origin (Referral > Cold).
- **Module Interest**: Bonus points for interest in Tally Prime, MIS, or GST modules.
- **Engagement Recency**: Temporal decay factor—leads contacted recently rank higher.

### Client Upsell Potential (0-100)
- **Product Gap**: Measures the distance between current installations and the full Metavision suite.
- **Recency Score**: Identifies "stagnant" accounts that haven't implemented new projects in 12+ months.
- **Size/Sector Fit**: Strategic alignment for expansion.

## 2. Dynamic Weight Tuning (Admin Panel)

Operators can tune scoring weights in real-time via the **Admin Panel**.

### Tuning Guidelines:
- **Range**: All weights must be between **0.0** and **1.0**.
- **Impact**: Changes take effect immediately across all dashboards.
- **Safety**: The system prevents invalid inputs (e.g., negative numbers or values > 1.0) to maintain scoring integrity.

## 3. Market Velocity & Anomaly Detection

Located in the **Market Explorer (Growth Zones)**, Market Velocity identifies sudden shifts in regional interest.

- **Velocity Calculation**: Compares the 30-day moving average of lead scores in a state against a 60-day historical baseline.
- **High Velocity Alert**: Flagged when a region shows **>20% growth pulse** compared to history. These are "emerging markets" where aggressive expansion is recommended.

## 4. Geographic Intelligence (India Geocentric)

The Interactive India Map provides a tactical view of opportunity distribution.

### Opportunity Density Scale:
- <span style="color: #10b981">●</span> **High Intensity (75%+)**: Dominated by high-quality leads and tier-1 clients.
- <span style="color: #6366f1">●</span> **Growth (45%+)**: Balanced mix of established and new prospects.
- <span style="color: #f59e0b">●</span> **Emerging**: Low saturation, high scout-to-win potential.

## 5. Data Portability & Export

Use the **Intelligence Filter Drawer** on the Leads or Clients dashboards to silo high-potential data, then click **Export CSV** to download a portable dataset for CRM synchronization or offline analysis.
