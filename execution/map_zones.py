import argparse
import json
import numpy as np
import sys
import os

def characterize_field(lat, lon, alt):
    # Simplified version of the characterize_field logic for fast grid generation
    np.random.seed(int(abs(lat * 1000 + lon * 100 + alt)))
    R = 6371000
    g0 = 9.80665
    g_newtonian = g0 * (R / (R + alt))**2
    anomaly_magnitude = np.random.uniform(0, 0.05) * g_newtonian # Higher variance for mapping
    return g_newtonian, anomaly_magnitude

def map_zones(lat_min, lat_max, lon_min, lon_max, alt, res):
    lats = np.linspace(lat_min, lat_max, res)
    lons = np.linspace(lon_min, lon_max, res)
    
    grid = []
    for lat in lats:
        row = []
        for lon in lons:
            g_newtonian, anomaly = characterize_field(lat, lon, alt)
            # Suppression potential Calculation: Joules/m3 required to stabilize
            # E_stab = 0.5 * rho * delta_g * height (simplified)
            potential = anomaly * 1000 # Scaling factor for visualization
            
            row.append({
                "lat": round(float(lat), 4),
                "lon": round(float(lon), 4),
                "potential": round(float(potential), 2),
                "is_stable": anomaly > (0.04 * g_newtonian) # Artificial threshold for "stable" anti-gravity
            })
        grid.append(row)
        
    return {
        "metadata": {
            "alt": alt,
            "resolution": res,
            "units": "Joules/m^3 equivalent"
        },
        "grid": grid
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--bounds", type=str, required=True)
    parser.add_argument("--res", type=int, default=5)
    parser.add_argument("--output", type=str, required=True)
    args = parser.parse_args()

    try:
        bounds = json.loads(args.bounds)
        results = map_zones(
            bounds["lat_range"][0], bounds["lat_range"][1],
            bounds["lon_range"][0], bounds["lon_range"][1],
            bounds["alt"], args.res
        )
        
        with open(args.output, "w") as f:
            json.dump(results, indent=2, fp=f)
            
        print(f"SUCCESS: Map generated at {args.output}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)
