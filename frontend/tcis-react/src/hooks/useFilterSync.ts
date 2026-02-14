import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const useFilterSync = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = useAppStore((state) => state.filters);
    const setSectors = useAppStore((state) => state.setSectors);
    const setRegions = useAppStore((state) => state.setRegions);
    const setSearchQuery = useAppStore((state) => state.setSearchQuery);
    const setScoreRange = useAppStore((state) => state.setScoreRange);

    // Sync from URL to Store on Mount
    useEffect(() => {
        const sectors = searchParams.get('sectors')?.split(',').filter(Boolean) || [];
        const regions = searchParams.get('regions')?.split(',').filter(Boolean) || [];
        const search = searchParams.get('q') || '';
        const scoreMin = Number(searchParams.get('minScore')) || 0;
        const scoreMax = Number(searchParams.get('maxScore')) || 100;

        if (sectors.length > 0) setSectors(sectors);
        if (regions.length > 0) setRegions(regions);
        if (search) setSearchQuery(search);
        if (scoreMin !== 0 || scoreMax !== 100) setScoreRange(scoreMin, scoreMax);
    }, []); // Run only on mount

    // Sync from Store to URL on Filter Change
    useEffect(() => {
        const params = new URLSearchParams();

        if (filters.sectors.length > 0) params.set('sectors', filters.sectors.join(','));
        if (filters.regions.length > 0) params.set('regions', filters.regions.join(','));
        if (filters.searchQuery) params.set('q', filters.searchQuery);
        if (filters.minScore > 0) params.set('minScore', filters.minScore.toString());
        if (filters.maxScore < 100) params.set('maxScore', filters.maxScore.toString());

        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    return null;
};
