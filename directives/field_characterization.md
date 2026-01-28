# Field Characterization Directive (Anti-Gravity v2.0)

## Goal
Perform baseline characterization of a gravitational signature at specified coordinates.

## Inputs
- `latitude` (float)
- `longitude` (float)
- `altitude` (float)

## Execution
- Run `execution/characterize_field.py --lat <lat> --lon <lon> --alt <alt>`

## Output
- Ricci curvature tensor estimate
- Newtonian vs Anomalous component breakdown
- Resonance frequency analysis (via Fourier Transform)
- Physical plausibility verification (Energy/Causality)
