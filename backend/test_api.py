"""
Quick Test Script for TCIS API

Run this after starting the backend to verify endpoints work:
  python test_api.py

Expected: Prints top 5 ranked leads and top 5 ranked clients
"""
import requests

API_BASE = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("Testing health endpoint...")
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=5)
        resp.raise_for_status()
        print(f"  ✓ Health: {resp.json()}")
        return True
    except requests.exceptions.ConnectionError:
        print("  ✗ Cannot connect to API. Is the backend running?")
        print("    Run: cd backend && uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def test_ranked_leads():
    """Test ranked leads endpoint."""
    print("\nTesting ranked leads...")
    try:
        resp = requests.get(f"{API_BASE}/api/scoring/leads/ranked", params={"limit": 5})
        resp.raise_for_status()
        leads = resp.json()
        
        print(f"  Top 5 Leads by Score:")
        print(f"  {'Company':<30} {'Score':>8} {'Action':<30}")
        print(f"  {'-'*70}")
        
        for lead in leads[:5]:
            company = lead["company"][:28]
            score = lead["lead_score"]
            action = lead["suggested_next_action"][:28]
            print(f"  {company:<30} {score:>8.1f} {action:<30}")
        
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def test_ranked_clients():
    """Test ranked clients endpoint."""
    print("\nTesting ranked clients...")
    try:
        resp = requests.get(f"{API_BASE}/api/scoring/clients/ranked", params={"limit": 5})
        resp.raise_for_status()
        clients = resp.json()
        
        print(f"  Top 5 Clients by Upsell Score:")
        print(f"  {'Company':<30} {'Upsell':>8} {'Risk':>8} {'Recommended Packs':<25}")
        print(f"  {'-'*75}")
        
        for client in clients[:5]:
            company = client["company"][:28]
            upsell = client["upsell_score"]
            risk = client["risk_score"]
            packs = ", ".join(client["recommended_packs"][:2]) if client["recommended_packs"] else "-"
            print(f"  {company:<30} {upsell:>8.1f} {risk:>8.1f} {packs:<25}")
        
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def test_ticket_stats():
    """Test ticket statistics endpoint."""
    print("\nTesting ticket statistics...")
    try:
        resp = requests.get(f"{API_BASE}/api/tickets/stats")
        resp.raise_for_status()
        stats = resp.json()
        
        print(f"  Tickets by Type:")
        for item in stats.get("by_type", []):
            print(f"    - {item['type']}: {item['count']}")
        
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def main():
    print("=" * 50)
    print("TCIS API Quick Test")
    print("=" * 50)
    
    if not test_health():
        print("\n❌ Backend is not running. Start it first!")
        return
    
    test_ranked_leads()
    test_ranked_clients()
    test_ticket_stats()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("=" * 50)


if __name__ == "__main__":
    main()
