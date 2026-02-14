import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsService } from "../services/leadsService";
import type { Lead } from "../api/types";

export const useLeads = () => {
    return useQuery({
        queryKey: ["leads", "ranked"],
        queryFn: async () => {
            const { data } = await leadsService.getRankedLeads();
            return data;
        },
    });
};

export const useLead = (id: number | string | undefined) => {
    return useQuery({
        queryKey: ["lead", id],
        queryFn: async () => {
            if (!id) throw new Error("Lead ID is required");
            const { data } = await leadsService.getLead(Number(id));
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newLead: Partial<Lead>) => leadsService.createLead(newLead),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });
};

export const useUpdateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Lead> }) =>
            leadsService.updateLead(id, data),
        onSuccess: (_: any, variables: { id: number; data: Partial<Lead> }) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["lead", variables.id] });
        },
    });
};

export const useLeadHistory = (id: number | string | undefined) => {
    return useQuery({
        queryKey: ["lead", id, "history"],
        queryFn: async () => {
            if (!id) throw new Error("Lead ID is required");
            const { tcisService } = await import("../services/tcisService");
            const { data } = await tcisService.getScoreHistory('lead', Number(id));
            return data;
        },
        enabled: !!id,
    });
};

export const useConvertLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            leadsService.convertLead(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            return response;
        },
    });
};
