import { useState, useEffect, useRef } from "react";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { useFilterSync } from "./hooks/useFilterSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Sync Wrapper to initialize URL filters
const RootWrapper = () => {
  useFilterSync();
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    element: <RootWrapper />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <LeadsDashboard /> },
          { path: "/leads/:id", element: <LeadDetail /> },
          { path: "/clients", element: <ClientsDashboard /> },
          { path: "/clients/:id", element: <ClientDetail /> },
          { path: "/funnel", element: <FunnelAnalytics /> },
          { path: "/packs", element: <AutomationPacks /> },
          { path: "/support", element: <SupportAnalytics /> },
          { path: "/admin", element: <AdminPanel /> },
          { path: "/growth", element: <GrowthZones /> },
          { path: "*", element: <Navigate to="/" replace /> }
        ]
      }
    ]
  }
]);

function App() {
  const [notification, setNotification] = useState<Lead | null>(null);
  const lastLeadIdRef = useRef<number | null>(null);

  // Live Intelligence Polling
  useEffect(() => {
    const pollLeads = async () => {
      try {
        const response = await api.getRankedLeads();
        const leads = response.data || [];
        if (Array.isArray(leads) && leads.length > 0) {
          if (lastLeadIdRef.current === null) {
            lastLeadIdRef.current = Math.max(...leads.map(l => l.id));
            return;
          }
          const maxId = Math.max(...leads.map(l => l.id));
          if (maxId > lastLeadIdRef.current) {
            const newLead = leads.find(l => l.id === maxId);
            if (newLead) {
              setNotification(newLead);
              lastLeadIdRef.current = maxId;
              setTimeout(() => setNotification(null), 10000);
            }
          }
        }
      } catch (error) {
        console.error("Live Intelligence sync failed:", error);
      }
    };
    const interval = setInterval(pollLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />

        {/* Live Notification Toast */}
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

        {(import.meta.env.MODE === "development") && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
