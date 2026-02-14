import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface FilterState {
    sectors: string[];
    regions: string[];
    minScore: number;
    maxScore: number;
    searchQuery: string;
}

interface UIState {
    sidebarExpanded: boolean;
    theme: 'light' | 'dark';
}

interface AuthState {
    user: { name: string; role: string } | null;
    isAuthenticated: boolean;
}

interface AppStore {
    filters: FilterState;
    ui: UIState;
    auth: AuthState;

    // Filter Actions
    setSectors: (sectors: string[]) => void;
    setRegions: (regions: string[]) => void;
    setScoreRange: (min: number, max: number) => void;
    setSearchQuery: (query: string) => void;
    resetFilters: () => void;

    // UI Actions
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;

    // Auth Actions
    login: (user: { name: string; role: string }) => void;
    logout: () => void;
}

const initialFilters: FilterState = {
    sectors: [],
    regions: [],
    minScore: 0,
    maxScore: 100,
    searchQuery: '',
};

export const useAppStore = create<AppStore>()(
    persist(
        immer((set) => ({
            filters: initialFilters,
            ui: {
                sidebarExpanded: true,
                theme: 'light',
            },
            auth: {
                user: { name: 'Admin Intern', role: 'admin' }, // Default for simulation
                isAuthenticated: true,
            },

            // Filter Implementations
            setSectors: (sectors) =>
                set((state) => {
                    state.filters.sectors = sectors;
                }),
            setRegions: (regions) =>
                set((state) => {
                    state.filters.regions = regions;
                }),
            setScoreRange: (min, max) =>
                set((state) => {
                    state.filters.minScore = min;
                    state.filters.maxScore = max;
                }),
            setSearchQuery: (query) =>
                set((state) => {
                    state.filters.searchQuery = query;
                }),
            resetFilters: () =>
                set((state) => {
                    state.filters = initialFilters;
                }),

            // UI Implementations
            toggleSidebar: () =>
                set((state) => {
                    state.ui.sidebarExpanded = !state.ui.sidebarExpanded;
                }),
            setTheme: (theme) =>
                set((state) => {
                    state.ui.theme = theme;
                }),

            // Auth Implementations
            login: (user) =>
                set((state) => {
                    state.auth.user = user;
                    state.auth.isAuthenticated = true;
                }),
            logout: () =>
                set((state) => {
                    state.auth.user = null;
                    state.auth.isAuthenticated = false;
                }),
        })),
        {
            name: 'tcis-app-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                ui: state.ui,
                filters: state.filters
            }), // Only persist UI and Filters, not Auth for security simulation
        }
    )
);
