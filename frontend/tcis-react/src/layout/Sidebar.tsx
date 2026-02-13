import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, Package, Ticket, Settings, Map, BarChart3 } from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
    { path: "/", label: "Leads Dashboard", icon: LayoutDashboard },
    { path: "/funnel", label: "Funnel Intelligence", icon: BarChart3 },
    { path: "/clients", label: "Clients Dashboard", icon: Building2 },
    { path: "/growth", label: "Growth Zones", icon: Map },
    { path: "/packs", label: "Automation Packs", icon: Package },
    { path: "/support", label: "Support Analytics", icon: Ticket },
    { path: "/admin", label: "Intelligence Admin", icon: Settings },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-white">TCIS</h1>
                <p className="text-xs text-slate-400 mt-1">Enterprise Operations</p>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            )
                        }
                    >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        AD
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Admin User</p>
                        <p className="text-xs text-slate-500">System Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
