import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsService } from "../services/clientsService";

export const useClients = () => {
    return useQuery({
        queryKey: ["clients", "ranked"],
        queryFn: async () => {
            const { data } = await clientsService.getRankedClients();
            return data;
        },
    });
};

export const useClient = (id: number | string | undefined) => {
    return useQuery({
        queryKey: ["client", id],
        queryFn: async () => {
            if (!id) throw new Error("Client ID is required");
            const { data } = await clientsService.getClient(id);
            return data;
        },
        enabled: !!id,
    });
};

export const useClientHierarchy = (id: number | string | undefined) => {
    return useQuery({
        queryKey: ["client", id, "hierarchy"],
        queryFn: async () => {
            if (!id) throw new Error("Client ID is required");
            const { data } = await clientsService.getClientHierarchy(id);
            return data;
        },
        enabled: !!id,
    });
};

export const useClientHistory = (id: number | string | undefined, limit: number = 20) => {
    return useQuery({
        queryKey: ["client", id, "history", { limit }],
        queryFn: async () => {
            if (!id) throw new Error("Client ID is required");
            const { data } = await clientsService.getClientHistory(id, limit);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newClient: any) => clientsService.createClient(newClient),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });
};
