import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../services/dashboardService';

/**
 * useDashboard Hook
 * Returns statistics, earnings, and profile data for the dashboard.
 */
export const useDashboard = () => {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboardData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
