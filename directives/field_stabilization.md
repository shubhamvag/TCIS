# Field Stabilization Directive (Anti-Gravity v2.0)

## Goal
Calculate and simulate the application of a counter-resonance stabilization field for high-MDI zones.

## Inputs
- `target_name` (string)
- `anomalous_vector` (float)
- `primary_hz` (float): From Phase 1 Characterization.

## Execution
- Run `execution/calibrate_stabilization.py --target <name> --anom <val> --hz <val>`

## Output
- Counter-phase Frequency (Hz).
- Amplitude (Peak-to-Peak).
- Projected Stability Post-Intervention (%).
- Energy consumption estimate.
