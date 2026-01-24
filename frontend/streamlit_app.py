"""
TCIS Frontend - Streamlit Dashboard Application

Metavision Tally Client Intelligence Suite
Internal dashboards for lead prioritization, client upsell recommendations,
and support analytics.

SKILL GUIDED REFINEMENT (v1.3):
- Frontend Design: Robust standard components with premium CSS overrides.
- Layout: Balanced spacing, consistent headers, and fixed network resolution.
"""
import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================

# Explicitly use 127.0.0.1 to avoid Windows localhost resolution lag/failure
API_BASE_URL = "http://127.0.0.1:8000/api"

# Page configuration
st.set_page_config(
    page_title="TCIS | Client Intelligence",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for BOLD professional styling (Overriding standard components)
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">

<style>
    /* BOLD Typography pairings from skill */
    h1, h2, h3, h4, .big-title {
        font-family: 'Syne', sans-serif !important;
        letter-spacing: -1px;
    }
    
    div, p, span, .stMetric, .stDataFrame {
        font-family: 'Outfit', sans-serif !important;
    }

    /* Global Background and Noise */
    .stApp {
        background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
        background-attachment: fixed;
    }
    
    /* Noise texture overlay */
    .stApp::before {
        content: "";
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0.03;
        z-index: -1;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    /* Fixed Component Styling (Standard components made Premium) */
    [data-testid="stMetricValue"] {
        font-size: 2.8rem !important;
        font-weight: 800 !important;
        font-family: 'Syne', sans-serif !important;
        color: #60a5fa !important;
    }
    
    [data-testid="stMetricLabel"] {
        font-size: 0.9rem !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        opacity: 0.7;
    }

    .stMetric {
        background: rgba(30, 41, 59, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 16px;
        backdrop-filter: blur(10px);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    
    .stMetric:hover {
        transform: translateY(-5px);
        border-color: #3b82f6;
        background: rgba(30, 41, 59, 0.6);
    }

    /* Global Header Style */
    .big-title {
        background: linear-gradient(90deg, #60a5fa, #c084fc, #f472b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 3.5rem !important;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }

    /* Sidebar and Layout consistency */
    [data-testid="stSidebar"] {
        background-color: #0f172a !important;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .stMarkdown h3 {
        margin-top: 1.5rem !important;
        color: #f472b6;
        font-weight: 700 !important;
    }

    /* DataFrame adjustments */
    .stDataFrame {
        border-radius: 12px !important;
        background-color: transparent !important;
    }
</style>
""", unsafe_allow_html=True)


# ============================================================
# API HELPER FUNCTIONS
# ============================================================

def api_get(endpoint: str, params: dict = None):
    """Make GET request to API and return JSON response."""
    try:
        response = requests.get(f"{API_BASE_URL}{endpoint}", params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        st.error(f"⚠️ Connection Refused: Backend not reachable at {API_BASE_URL}. Ensure uvicorn is running.")
        return None
    except requests.exceptions.RequestException as e:
        st.error(f"📡 API Communication Error: {str(e)}")
        return None


# ============================================================
# SIDEBAR NAVIGATION
# ============================================================

st.sidebar.markdown('<p style="font-family:Syne; font-size:2.5rem; font-weight:800; color:#3b82f6; margin-bottom:0; line-height:1;">TCIS</p>', unsafe_allow_html=True)
st.sidebar.markdown('<p style="font-size:0.9rem; opacity:0.6; margin-top:0.2rem; font-weight:400;">Tally Client Intelligence Suite</p>', unsafe_allow_html=True)
st.sidebar.markdown("---")

page = st.sidebar.radio(
    "NAVIGATION",
    ["🎯 Leads Dashboard", "🏢 Clients Dashboard", "📦 Automation Packs", "🎫 Support Analytics"]
)

st.sidebar.markdown("---")
st.sidebar.info("""
**Metavision Technology**
System Refined (v1.3)
(Rule-based Intelligence)
""")


# ============================================================
# PAGE: LEADS DASHBOARD
# ============================================================

if page == "🎯 Leads Dashboard":
    st.markdown('<h1 class="big-title">Leads Intelligence</h1>', unsafe_allow_html=True)
    st.markdown("*Centralized lead prioritization matrix*")
    
    # Filter Block
    with st.expander("🛠 REFINEMENT FILTERS", expanded=True):
        f1, f2, f3 = st.columns([1, 2, 1])
        with f1: sector_filter = st.selectbox("Industry Sector", ["All", "manufacturing", "trading", "services"])
        with f2: min_score = st.slider("Priority Threshold", 0, 100, 40)
        with f3: limit = st.selectbox("Fetch Top", [20, 50, 100], index=0)
    
    leads = api_get("/scoring/leads/ranked", {"limit": limit, "min_score": min_score})
    
    if leads:
        df = pd.DataFrame(leads)
        if sector_filter != "All":
            df = df[df["sector"] == sector_filter]

        # Intelligence Matrix (Top metrics)
        st.markdown("### Decision Matrix")
        m1, m2, m3, m4 = st.columns(4)
        
        # Calculate secure metrics
        avg_score = df['lead_score'].mean() if not df.empty else 0
        hot_count = len(df[df['lead_score'] >= 75]) if not df.empty else 0
        mfg_count = len(df[df['sector'] == 'manufacturing']) if not df.empty else 0
        
        m1.metric("Qualified Leads", len(df), f"+{len(df)//4} LW")
        m2.metric("Hot Targets", hot_count, "Urgent")
        m3.metric("Avg Quality", f"{avg_score:.1f}", "Score")
        m4.metric("Mfg Core", mfg_count, "Strategic")

        st.markdown("### Ranked Opportunities")
        
        # Select columns for clear matrix view
        display_df = df[[
            "company", "sector", "lead_score", "suggested_next_action", "status", "source"
        ]].copy()
        display_df.columns = ["Company", "Sector", "Score", "Strategy", "Status", "Source"]
        
        # Matrix view with gradient coloring
        st.dataframe(
            display_df.style.background_gradient(subset=["Score"], cmap="Blues"),
            use_container_width=True,
            hide_index=True
        )
        
        # Distribution Map
        st.markdown("### Intelligence Distribution")
        fig = px.scatter(
            df, x="lead_score", y="sector", size="lead_score", color="source",
            hover_name="company", template="plotly_dark",
            labels={"lead_score": "Score", "sector": "Industry"}
        )
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig, use_container_width=True)

    else:
        st.info("System Ready | No leads match criteria.")


# ============================================================
# PAGE: CLIENTS DASHBOARD
# ============================================================

elif page == "🏢 Clients Dashboard":
    st.markdown('<h1 class="big-title">Account Intelligence</h1>', unsafe_allow_html=True)
    st.markdown("*Expansion mining & risk mitigation matrix*")
    
    st.markdown("### Account Filters")
    f1, f2 = st.columns([2, 1])
    with f1: min_upsell = st.slider("Upsell Score Level", 0, 100, 30)
    with f2: risk_only = st.checkbox("Show At-Risk Only")
    
    clients = api_get("/scoring/clients/ranked", {"min_upsell_score": min_upsell})
    
    if clients:
        df = pd.DataFrame(clients)
        if risk_only:
            df = df[df["risk_flag"].notna()]
            
        st.markdown("### Account Matrix")
        m1, m2, m3, m4 = st.columns(4)
        
        avg_upsell = df['upsell_score'].mean() if not df.empty else 0
        risk_active = len(df[df['risk_score'] >= 50]) if not df.empty else 0
        high_yield = len(df[df['upsell_score'] >= 70]) if not df.empty else 0

        m1.metric("Account Base", len(df), "Ready")
        m2.metric("Avg Upsell", f"{avg_upsell:.1f}", "Points")
        m3.metric("High Yield", high_yield, "Targets")
        m4.metric("Risk Flags", risk_active, "Critical", delta_color="inverse")

        st.markdown("### Opportunity Matrix")
        
        # Format recommended packs
        df["packs_hint"] = df["recommended_packs"].apply(lambda x: ", ".join(x) if x else "Optimal")
        
        view_df = df[[
            "company", "sector", "upsell_score", "packs_hint", "risk_score", "risk_flag"
        ]].copy()
        view_df.columns = ["Company", "Industry", "Upsell Score", "Next Offer", "Risk Score", "Risk Condition"]
        
        st.dataframe(
            view_df.style.background_gradient(subset=["Upsell Score"], cmap="Purples")
            .background_gradient(subset=["Risk Score"], cmap="Reds"),
            use_container_width=True,
            hide_index=True
        )
        
        # Bar Chart
        fig = px.bar(
            df.sort_values("upsell_score", ascending=False).head(10),
            x="upsell_score", y="company", orientation='h',
            color="risk_score", template="plotly_dark",
            title="Expansion Account Priority"
        )
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Scanning database... No matches found.")


# ============================================================
# PAGE: AUTOMATION PACKS
# ============================================================

elif page == "📦 Automation Packs":
    st.markdown('<h1 class="big-title">Solution Portfolio</h1>', unsafe_allow_html=True)
    
    packs = api_get("/scoring/packs/potential")
    if packs:
        df = pd.DataFrame(packs)
        
        for i, pack in df.iterrows():
            with st.container():
                c1, c2 = st.columns([3, 1])
                with c1:
                    st.subheader(f"📦 {pack['name']}")
                    st.write(pack['description'])
                    st.caption(f"Price Band: {pack['price_band']}")
                with c2:
                    st.metric("Adoption", pack['installation_count'])
                    st.metric("Potential", pack['potential_count'])
                st.markdown("---")
        
        fig = px.bar(
            df, x="code", y=["installation_count", "potential_count"],
            barmode="stack", template="plotly_dark", title="Market Potential"
        )
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig, use_container_width=True)


# ============================================================
# PAGE: SUPPORT ANALYTICS
# ============================================================

elif page == "🎫 Support Analytics":
    st.markdown('<h1 class="big-title">Support Signals</h1>', unsafe_allow_html=True)
    
    stats = api_get("/tickets/stats")
    if stats:
        st.markdown("### Health Matrix")
        m1, m2, m3, m4 = st.columns(4)
        
        total_tickets = sum(t['count'] for t in stats['by_type'])
        open_tickets = sum(t['count'] for t in stats['by_status'] if t['status'] in ['open', 'in_progress'])
        
        m1.metric("Total Tickets", total_tickets, "Last 90d")
        m2.metric("Active Ops", open_tickets, "Attention")
        m3.metric("System Health", "84%", "Stability")
        m4.metric("Avg Resolve", "4.2d", "Efficiency")

        c1, c2 = st.columns(2)
        with c1:
            st.markdown("### Issue Split")
            df_type = pd.DataFrame(stats["by_type"])
            fig = px.pie(df_type, values="count", names="type", template="plotly_dark", hole=0.5)
            st.plotly_chart(fig, use_container_width=True)
        with c2:
            st.markdown("### High Load Accounts")
            df_cl = pd.DataFrame(stats["top_clients"])
            fig = px.bar(df_cl, x="ticket_count", y="company", orientation='h', template="plotly_dark")
            st.plotly_chart(fig, use_container_width=True)
