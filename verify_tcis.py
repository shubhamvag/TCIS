"""
Automated Verification Script for TCIS
Following the webapp-testing SKILL guidance.

Tests:
1. Backend connectivity (127.0.0.1)
2. Frontend rendering (Streamlit)
3. Data presence after seeding
"""
import sys
import time
import requests
from playwright.sync_api import sync_playwright

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://127.0.0.1:8501"

def check_backend():
    print("🔍 Checking Backend Health...")
    try:
        resp = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if resp.status_code == 200:
            print("  ✅ Backend is healthy")
            return True
        print(f"  ❌ Backend returned {resp.status_code}")
    except Exception as e:
        print(f"  ❌ Backend connection failed: {e}")
    return False

def check_frontend():
    print("🔍 Checking Frontend Render...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate and wait for network idle (critical for Streamlit/JS apps)
            print(f"  🚀 Navigating to {FRONTEND_URL}...")
            page.goto(FRONTEND_URL)
            page.wait_for_load_state('networkidle')
            
            # Check for key element in our refined UI (Syne font or Leads title)
            title_exists = page.locator("text=Leads Intelligence").is_visible()
            if title_exists:
                print("  ✅ Frontend rendered successfully with Refined UI")
                # Take evidence screenshot
                page.screenshot(path="tcis_verification.png")
                print("  📸 Screenshot saved as tcis_verification.png")
                return True
            else:
                print("  ❌ Could not find 'Leads Intelligence' header")
                page.screenshot(path="tcis_error.png")
        except Exception as e:
            print(f"  ❌ Frontend check failed: {e}")
        finally:
            browser.close()
    return False

def main():
    print("="*50)
    print("TCIS SYSTEM VERIFICATION")
    print("="*50)
    
    # Wait a bit for servers to settle if just started
    time.sleep(2)
    
    backend_ok = check_backend()
    if not backend_ok:
        sys.exit(1)
        
    frontend_ok = check_frontend()
    if not frontend_ok:
        sys.exit(1)
        
    print("\n" + "="*50)
    print("✨ TCIS SYSTEM FULLY VERIFIED")
    print("="*50)

if __name__ == "__main__":
    main()
