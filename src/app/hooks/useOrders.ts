import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../services/ordersService';

/**
 * useOrders Hook
 * Returns orders for a specific filter (Today, This Week, etc.)
 */
export const useOrders = (filter: string) => {
  return useQuery({
    queryKey: ['orders', filter],
    queryFn: () => getOrders(filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
