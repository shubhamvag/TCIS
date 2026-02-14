import api from "./api";
import type { Client, ScoreHistory, HierarchyContract } from "../api/types";

export const clientsService = {
    getRankedClients: () => api.get<Client[]>("/scoring/clients/ranked"),
    getClient: (id: number | string) => api.get<Client>(`/clients/${id}`),
    createClient: (data: any) => api.post<Client>("/clients/", data),
    getClientHierarchy: (id: number | string) => api.get<HierarchyContract>(`/clients/${id}/hierarchy`),
    getClientHistory: (id: number | string, limit: number = 20, days?: number) =>
        api.get<ScoreHistory[]>(`/scoring/history/client/${id}`, { params: { limit, days } }),
};
