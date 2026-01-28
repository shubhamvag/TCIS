# Global Orchestration Directive (Anti-Gravity v2.0 Elite)

## Goal
Automate the end-to-end detection-correlation-stabilization pipeline for the entire business portfolio.

## Execution
- Run `execution/global_rollout.py --api <url> --threshold <float> --output <path>`

## Logic
1. **Portfolio Scan**: Fetch all leads with Score > 60.
2. **Gravimetric Audit**: Characterize local field for all identified entities.
3. **MDI Filtering**: Calculate Market Displacement Index (MDI).
4. **Auto-Calibration**: For all MDI > 2.0, automatically run `calibrate_stabilization.py`.
5. **Manifest Generation**: Produce a `deployment_manifest.json` for global field rollout.
