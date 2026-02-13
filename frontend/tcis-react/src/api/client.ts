import axios from "axios";
import type {
    Lead, Client, AutomationPack, TicketStats,
    ScoringConfig, ScoreHistory, GeoSummary
} from "./types";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const TCIS_API_KEY = "tcis_sim_2026_marketing_hub";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Helper for external/manual creation with API Key
const apiWithAuth = {
    headers: { "X-TCIS-API-Key": TCIS_API_KEY }
};

export const api = {
    // Leads
    getRankedLeads: () => apiClient.get<Lead[]>("/scoring/leads/ranked"),
    getLead: (id: number) => apiClient.get<Lead>(`/leads/${id}`),
    createLead: (data: Partial<Lead>) => apiClient.post<Lead>("/leads/", data, apiWithAuth),
    updateLead: (id: number, data: Partial<Lead>) => apiClient.patch<Lead>(`/leads/${id}`, data),
    convertLead: (id: number, data: any) => apiClient.post<Client>(`/leads/${id}/convert`, data),

    // Clients
    getRankedClients: () => apiClient.get<Client[]>("/scoring/clients/ranked"),
    getClient: (id: number) => apiClient.get<Client>(`/clients/${id}`),
    createClient: (data: any) => apiClient.post<Client>("/clients/", data, apiWithAuth),
    getClientHierarchy: (id: number) => apiClient.get<any>(`/clients/${id}/hierarchy`),

    // Packs
    getPotentialPacks: () => apiClient.get<AutomationPack[]>("/scoring/packs/potential"),

    // Support
    getTicketStats: () => apiClient.get<TicketStats>("/tickets/stats"),

    // Scoring Config (V2)
    getScoringConfigs: () => apiClient.get<ScoringConfig[]>("/scoring/config"),
    updateScoringConfig: (key: string, value: number) =>
        apiClient.patch<ScoringConfig>(`/scoring/config/${key}`, { value }),

    getFunnelMetrics: () => apiClient.get<any>("/scoring/funnel"),

    // History (V2)
    getScoreHistory: (type: string, id: number, limit: number = 20, days?: number) =>
        apiClient.get<ScoreHistory[]>(`/scoring/history/${type}/${id}`, { params: { limit, days } }),

    // Geo (V2)
    getGeoSummary: (sector?: string) => apiClient.get<GeoSummary>("/scoring/geo/summary", { params: { sector } }),
};
