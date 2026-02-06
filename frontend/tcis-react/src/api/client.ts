import axios from "axios";
import type {
    Lead, Client, AutomationPack, TicketStats,
    ScoringConfig, ScoreHistory, GeoSummary
} from "./types";

const API_BASE_URL = "/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Call Failed:", error);
        return Promise.reject(error);
    }
);

export const api = {
    // Leads
    getRankedLeads: () => apiClient.get<Lead[]>("/scoring/leads/ranked"),
    getLead: (id: number) => apiClient.get<Lead>(`/leads/${id}`),

    // Clients
    getRankedClients: () => apiClient.get<Client[]>("/scoring/clients/ranked"),
    getClient: (id: number) => apiClient.get<Client>(`/clients/${id}`),
    getClientHierarchy: (id: number) => apiClient.get<any>(`/clients/${id}/hierarchy`),

    // Packs
    getPotentialPacks: () => apiClient.get<AutomationPack[]>("/scoring/packs/potential"),

    // Support
    getTicketStats: () => apiClient.get<TicketStats>("/tickets/stats"),

    // Scoring Config (V2)
    getScoringConfigs: () => apiClient.get<ScoringConfig[]>("/scoring/config"),
    updateScoringConfig: (key: string, value: number) =>
        apiClient.patch<ScoringConfig>(`/scoring/config/${key}`, { value }),

    // History (V2)
    getScoreHistory: (type: string, id: number, limit: number = 20, days?: number) =>
        apiClient.get<ScoreHistory[]>(`/scoring/history/${type}/${id}`, { params: { limit, days } }),

    // Geo (V2)
    getGeoSummary: (sector?: string) => apiClient.get<GeoSummary>("/scoring/geo/summary", { params: { sector } }),
};
