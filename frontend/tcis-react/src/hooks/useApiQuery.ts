import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";
import type { AxiosRequestConfig } from "axios";

interface BasicState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useApiQuery<T>(url: string | null, config?: AxiosRequestConfig) {
    const [state, setState] = useState<BasicState<T>>({
        data: null,
        loading: !!url,
        error: null,
    });

    const fetchData = useCallback(async () => {
        if (!url) return;
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await apiClient.get<T>(url, config);
            setState({ data: response.data, loading: false, error: null });
        } catch (err) {
            setState({ data: null, loading: false, error: (err as Error) });
        }
    }, [url, JSON.stringify(config)]); // Naive config dependency check

    useEffect(() => {
        if (url) {
            fetchData();
        } else {
            setState({ data: null, loading: false, error: null });
        }
    }, [url, fetchData]);

    return { ...state, refetch: fetchData };
}
