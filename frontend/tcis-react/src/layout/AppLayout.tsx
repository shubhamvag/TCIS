import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Activity } from "lucide-react";

export function AppLayout() {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span>System Operational</span>
                    </div>
                    <div className="text-xs text-slate-400">
                        v1.4 Enterprise
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
