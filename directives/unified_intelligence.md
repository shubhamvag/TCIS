# Unified Intelligence Directive (Anti-Gravity v2.0 + TCIS)

## Goal
Correlate Tally Client/Lead data with Gravimetric Field Anomalies to identify "Market Displacement Zones" where business growth is potentially boosted by local field singularities.

## Inputs
- `api_base_url` (string): The TCIS Backend API URL.
- `search_radius_km` (float): Spatial correlation range.

## Execution
- Run `execution/correlate_business_fields.py --api <url> --output <path>`

## Logic (The "Out-of-the-box" Principle)
1. Fetch all leads and clients from TCIS.
2. Characterize the gravitational field for each client segment location.
3. Compute the **Market Displacement Index (MDI)**:
   `MDI = (Lead_Score / 100) * (Anomalous_Vector / Newtonian_Baseline) * 1000`
4. Flag high MDI zones as "Quantum Growth Zones."
