import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Building2, Package, Ticket, Activity } from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
    { path: "/", label: "Leads Dashboard", icon: LayoutDashboard },
    { path: "/clients", label: "Clients Dashboard", icon: Building2 },
    { path: "/packs", label: "Automation Packs", icon: Package },
    { path: "/support", label: "Support Analytics", icon: Ticket },
];

export function Layout() {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f172a] border-r border-white/5 flex flex-col fixed h-full z-10 transition-all font-outfit">
                <div className="p-6 border-b border-white/5">
                    <h1 className="font-syne text-4xl font-extrabold text-blue-500 leading-none tracking-tight">
                        TCIS
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Tally Client Intelligence</p>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-500/10 text-blue-400 font-medium shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-slate-500">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">System Online</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">TCIS v1.3</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 fade-in">
                <Outlet />
            </main>
        </div>
    );
}
