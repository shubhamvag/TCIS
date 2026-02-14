import api from "./api";
import type { Lead } from "../api/types";

export const leadsService = {
    getRankedLeads: () => api.get<Lead[]>("/scoring/leads/ranked"),
    getLead: (id: number) => api.get<Lead>(`/leads/${id}`),
    createLead: (data: Partial<Lead>) => api.post<Lead>("/leads/", data),
    updateLead: (id: number, data: Partial<Lead>) => api.patch<Lead>(`/leads/${id}`, data),
    convertLead: (id: number, data: any) => api.post<any>(`/leads/${id}/convert`, data),
};
