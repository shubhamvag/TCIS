# Anomaly Detection Directive (Anti-Gravity v2.0)

## Goal
Detect deviations between measured gravitational fields and standard General Relativity (GR) models.

## Inputs
- `field_data` (JSON/Object): Output from Phase 1 (Field Characterization).
- `sigma_threshold` (float, default=3.0): Confidence interval for flagging anomalies.

## Execution
- Run `execution/detect_anomalies.py --file <path_to_json> --sigma <sigma>`

## Output
- Delta (Δg) calculation.
- Confidence score (σ).
- Anomaly Classification (Type I, II, or III).
- Physical consistency warning if thermodynamics are violated.
