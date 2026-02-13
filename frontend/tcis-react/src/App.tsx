import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import LeadsDashboard from "./pages/LeadsDashboard";
import ClientsDashboard from "./pages/ClientsDashboard";
import AutomationPacks from "./pages/AutomationPacks";
import SupportAnalytics from "./pages/SupportAnalytics";
import AdminPanel from "./pages/AdminPanel";
import GrowthZones from "./pages/GrowthZones";
import FunnelAnalytics from "./pages/FunnelAnalytics";
import LeadDetail from "./pages/LeadDetail";
import ClientDetail from "./pages/ClientDetail";
import { api } from "./api/client";
import type { Lead } from "./api/types";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Bell, CheckCircle, X } from "lucide-react";

function App() {
  const [notification, setNotification] = useState<Lead | null>(null);
  const lastLeadIdRef = useRef<number | null>(null);

  // Live Intelligence Polling (Real-time updates from external channels)
  useEffect(() => {
    const pollLeads = async () => {
      try {
        const response = await api.getRankedLeads();
        const leads = response.data;
        if (leads.length > 0) {
          // On first load, just set the reference to the current max ID
          if (lastLeadIdRef.current === null) {
            lastLeadIdRef.current = Math.max(...leads.map(l => l.id));
            return;
          }

          // Check if there's a new ID higher than what we've seen
          const maxId = Math.max(...leads.map(l => l.id));
          if (maxId > lastLeadIdRef.current) {
            const newLead = leads.find(l => l.id === maxId);
            if (newLead) {
              setNotification(newLead);
              lastLeadIdRef.current = maxId;
              // Clear notification after 10 seconds
              setTimeout(() => setNotification(null), 10000);
            }
          }
        }
      } catch (error) {
        console.error("Live Intelligence sync failed:", error);
      }
    };

    const interval = setInterval(pollLeads, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LeadsDashboard />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/clients" element={<ClientsDashboard />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/funnel" element={<FunnelAnalytics />} />
            <Route path="/packs" element={<AutomationPacks />} />
            <Route path="/support" element={<SupportAnalytics />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/growth" element={<GrowthZones />} />
          </Route>
        </Routes>

        {/* Live Notification Toast (Captures real-world API submissions) */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="fixed top-6 right-6 z-[100] w-80 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="bg-emerald-600 px-4 py-1 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> Hot Lead Detected
                </span>
                <button onClick={() => setNotification(null)} className="hover:bg-white/10 p-1 rounded">
                  <X size={14} />
                </button>
              </div>
              <div className="p-4 flex gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl flex-shrink-0">
                  <Bell className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">{notification.company}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">Inquiry from {notification.city}, {notification.region}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      Score: {notification.lead_score}
                    </span>
                    <a
                      href={`/leads/${notification.id}`}
                      className="text-emerald-400 text-[10px] font-bold hover:underline underline-offset-4 flex items-center gap-1"
                    >
                      View Details <CheckCircle size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

export default App;
