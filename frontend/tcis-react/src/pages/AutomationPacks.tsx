import { useApiQuery } from "../hooks/useApiQuery";
import type { AutomationPack } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ChartWrapper } from "../components/ChartWrapper";
import { LoadingState } from "../components/LoadingState";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package } from "lucide-react";

export default function AutomationPacks() {
    const { data: packs, loading } = useApiQuery<AutomationPack[]>("/scoring/packs/potential");

    if (loading) return <LoadingState />;
    if (!packs) return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">Error loading data. Please check backend connection.</div>;

    const columns = [
        { header: "Code", accessor: (p: AutomationPack) => <span className="font-mono text-xs text-slate-500">{p.code}</span> },
        { header: "Solution Name", accessor: (p: AutomationPack) => <span className="font-semibold text-slate-900">{p.name}</span> },
        { header: "Description", accessor: (p: AutomationPack) => p.description },
        { header: "Price Band", accessor: (p: AutomationPack) => <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">{p.price_band}</span> },
        { header: "Install Base", accessor: (p: AutomationPack) => p.installation_count },
        { header: "Potential", accessor: (p: AutomationPack) => <span className="text-blue-600 font-bold">{p.potential_count}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Package className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-none">Solution Portfolio</h1>
                    <p className="text-sm text-slate-500 mt-1">Automation suite performance tracking</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DataTable data={packs || []} columns={columns} />
                </div>
                <div>
                    <ChartWrapper title="Market Adoption Analysis" height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={packs || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} width={30} />
                                <Tooltip contentStyle={{ borderColor: '#e2e8f0', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar dataKey="installation_count" name="Installed" stackId="a" fill="#0f172a" />
                                <Bar dataKey="potential_count" name="Potential" stackId="a" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>
            </div>
        </div>
    );
}
