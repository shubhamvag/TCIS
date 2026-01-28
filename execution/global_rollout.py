import argparse
import json
import requests
import sys
import os
import subprocess

def run_tool(script_name, args_dict):
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    cmd = [sys.executable, script_path]
    for k, v in args_dict.items():
        cmd.extend([f"--{k}", str(v)])
    
    result = subprocess.check_output(cmd).decode()
    return json.loads(result)

def global_rollout(api_url, threshold):
    print(f"[*] Initializing Global Rollout via {api_url}")
    
    # 1. Fetch leads
    leads_resp = requests.get(f"{api_url}/api/scoring/leads/ranked").json()
    leads = leads_resp.get('value', leads_resp) if isinstance(leads_resp, dict) else leads_resp
    
    # 2. Filter high-value leads
    strategic_leads = [l for l in leads if l.get('lead_score', 0) > 60]
    print(f"[*] Found {len(strategic_leads)} strategic leads.")
    
    deployment_manifest = []
    
    for lead in strategic_leads:
        company = lead.get('company', 'Unknown')
        # Simulate location
        lat = 18.5204 + (lead.get('id', 0) * 0.002)
        lon = 73.8567 + (lead.get('id', 0) * -0.002)
        
        # 3. Characterize & Detect
        field = run_tool("characterize_field.py", {"lat": lat, "lon": lon, "alt": 500})
        anom = field['metrics']['anomalous_vector']
        base = field['metrics']['newtonian_component']
        hz = field['resonance']['primary_hz']
        
        # 4. Correlate (MDI)
        mdi = (lead.get('lead_score', 0) / 100) * (anom / base) * 1000
        
        if mdi >= threshold:
            print(f"[+] HIGH MDI DETECTED: {company} (MDI: {mdi:.2f})")
            # 5. Auto-Calibrate
            calibration = run_tool("calibrate_stabilization.py", {
                "target": company,
                "anom": anom,
                "hz": hz
            })
            
            deployment_manifest.append({
                "company": company,
                "mdi": round(mdi, 4),
                "field_signature": field,
                "stabilization_config": calibration
            })
            
    return deployment_manifest

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", type=str, default="http://127.0.0.1:8000")
    parser.add_argument("--threshold", type=float, default=2.0)
    parser.add_argument("--output", type=str, required=True)
    args = parser.parse_args()

    try:
        manifest = global_rollout(args.api, args.threshold)
        with open(args.output, "w") as f:
            json.dump(manifest, indent=2, fp=f)
            
        print(f"\n[SUCCESS] Global Rollout Manifest generated with {len(manifest)} active zones.")
        print(f"[LOCATION] {args.output}")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        sys.exit(1)
