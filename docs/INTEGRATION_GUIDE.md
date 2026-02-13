# TCIS External Integration Hub

This guide explains how to connect your public website, CRM, or checkout portal to the **TCIS Intelligence Suite** for live lead and client updates.

## 1. Capturing New Leads (Public Website)
When a prospect fills out a "Contact Us" or "Request Demo" form on your website, your frontend should send a POST request to the TCIS Lead API.

**Endpoint**: `POST http://127.0.0.1:8000/api/leads/`

**Example Paylod**:
```json
{
  "name": "Jane Smith",
  "company": "Smith Manufacturing Ltd",
  "email": "jane@smithmfg.com",
  "sector": "manufacturing",
  "source": "website",
  "city": "Pune",
  "region": "Maharashtra",
  "interested_modules": "tally,mis"
}
```
**Result**: The lead appears instantly in the **Leads Dashboard** with an AI-computed score.

---

## 2. Instant Purchase Conversion (Checkout Portal)
If a lead (who already exists in TCIS) purchases an **Automation Pack** on your external website, you can trigger an automatic "Promotion" to Client status.

**Endpoint**: `POST http://127.0.0.1:8000/api/clients/`

**Example Payload**:
```json
{
  "lead_id": 123, 
  "payment_reference": "TXN_998877",
  "existing_products": "tallyprime,gst_health",
  "notes": "Purchased via Website Checkout"
}
```

**What TCIS does automatically**:
1. Locates Lead #123.
2. Marks it as `converted`.
3. Creates a new **Client** record with all original lead data (Name, City, Sector).
4. Links the **Payment Reference** for your finance team.
5. The lead disappears from the Lead list and appears in the **Ranked Clients** list.

---

## 3. Live Updates (Webhooks)
TCIS is built on a RESTful architecture. To get "Live Updates" in your external systems when a score changes, you can subscribe to the `GET /api/scoring/ranked/leads` endpoint for periodic syncing, or we can implement a Webhook Emitter in Phase 10.
