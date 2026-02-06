import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import LeadsDashboard from "./pages/LeadsDashboard";
import ClientsDashboard from "./pages/ClientsDashboard";
import AutomationPacks from "./pages/AutomationPacks";
import SupportAnalytics from "./pages/SupportAnalytics";
import AdminPanel from "./pages/AdminPanel";
import GrowthZones from "./pages/GrowthZones";
import LeadDetail from "./pages/LeadDetail";
import ClientDetail from "./pages/ClientDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LeadsDashboard />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/clients" element={<ClientsDashboard />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/packs" element={<AutomationPacks />} />
          <Route path="/support" element={<SupportAnalytics />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/growth" element={<GrowthZones />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
