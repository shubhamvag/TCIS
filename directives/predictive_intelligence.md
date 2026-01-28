# Predictive Intelligence Directive (Anti-Gravity v2.0)

## Goal
Predict contra-gravity force vector evolution over a specified timeline (6-24 months).

## Inputs
- `current_state` (JSON): Output from Phase 2 (Anomaly Detection) or Phase 3 (Zone Mapping).
- `horizon_months` (int, 6-24): Forecast range.
- `external_factors` (Object): `{ "temp_gradient": float, "vacuum_energy": float }`

## Execution
- Run `execution/predict_vectors.py --file <path_to_json> --months <int> --factors '<json_string>' --output <path>`

## Output
- Predicted force vector shift (magnitude/direction).
- Bayesian credible intervals (95% confidence).
- Stabilization risk assessment for the forecast period.
