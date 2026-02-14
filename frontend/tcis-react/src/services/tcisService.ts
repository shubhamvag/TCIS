import api from "./api";
import type { AutomationPack, TicketStats, ScoringConfig, GeoSummary } from "../api/types";

export const tcisService = {
    // Packs
    getPotentialPacks: () => api.get<AutomationPack[]>("/scoring/packs/potential"),

    // Support
    getTicketStats: () => api.get<TicketStats>("/tickets/stats"),

    // Scoring Config
    getScoringConfigs: () => api.get<ScoringConfig[]>("/scoring/config"),
    updateScoringConfig: (key: string, value: number) =>
        api.patch<ScoringConfig>(`/scoring/config/${key}`, { value }),

    // Metrics
    getFunnelMetrics: () => api.get<any>("/scoring/funnel"),

    // Geo
    getGeoSummary: (sector?: string) => api.get<GeoSummary>("/scoring/geo/summary", { params: { sector } }),

    // History
    getScoreHistory: (type: string, id: number, limit: number = 20) =>
        api.get<any[]>(`/scoring/history/${type}/${id}`, { params: { limit } }),
};
