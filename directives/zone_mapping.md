# Zone Mapping Directive (Anti-Gravity v2.0)

## Goal
Map the contra-gravity potential across a spatial grid to identify stabilization zones.

## Inputs
- `grid_bounds` (JSON): `{"lat_range": [min, max], "lon_range": [min, max], "alt": fixed_value}`
- `resolution` (int): Number of points per axis.

## Execution
- Run `execution/map_zones.py --bounds '<json_string>' --res <res> --output <path>`

## Output
- 3D-ready grid of gravity suppression potential (Joules/m³ required).
- Identification of "Stable Zones" where effective mass < 10% of baseline.
- Gradient discontinuity map for field singularities.
