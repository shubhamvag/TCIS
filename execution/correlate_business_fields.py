import argparse
import json
import requests
import sys
import os
import subprocess

def get_tcis_data(api_url):
    try:
        leads = requests.get(f"{api_url}/api/scoring/leads/ranked").json()
        clients = requests.get(f"{api_url}/api/scoring/clients/ranked").json()
        return leads, clients
    except Exception as e:
        print(f"ERROR: API unreachable - {e}")
        return [], []

def characterize_location(lat, lon, alt=500):
    # Call the existing execution script to maintain the 3-layer architecture
    script_path = os.path.join(os.path.dirname(__file__), "characterize_field.py")
    cmd = [sys.executable, script_path, "--lat", str(lat), "--lon", str(lon), "--alt", str(alt)]
    result = subprocess.check_output(cmd).decode()
    return json.loads(result)

def correlate(leads_data, clients_data):
    correlations = []
    
    # Handle both direct list and wrapped "value" list
    leads = leads_data.get('value', leads_data) if isinstance(leads_data, dict) else leads_data
    
    for lead in leads[:10]: # Top 10 leads
        # Simulate coordinates centered around Pune
        lat = 18.5204 + (lead.get('id', 0) * 0.001)
        lon = 73.8567 + (lead.get('id', 0) * -0.001)
        
        field = characterize_location(lat, lon)
        anom = field['metrics']['anomalous_vector']
        base = field['metrics']['newtonian_component']
        score = lead.get('lead_score', 0)
        
        # MDI calculation
        mdi = (score / 100) * (anom / base) * 1000
        
        correlations.append({
            "entity_type": "LEAD",
            "name": lead.get('company', 'Unknown'),
            "score": score,
            "anom_vector": anom,
            "mdi_index": round(mdi, 4),
            "status": "QUANTUM_ZONE" if mdi > 1.5 else "STANDARD"
        })
        
    return correlations

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", type=str, default="http://127.0.0.1:8000")
    parser.add_argument("--output", type=str, required=True)
    args = parser.parse_args()

    leads, clients = get_tcis_data(args.api)
    if not leads:
        sys.exit(1)
        
    results = correlate(leads, clients)
    
    with open(args.output, "w") as f:
        json.dump(results, indent=2, fp=f)
        
    print(f"SUCCESS: Correlation matrix generated at {args.output}")
    print(f"Top MDI Found: {results[0]['mdi_index']}")
