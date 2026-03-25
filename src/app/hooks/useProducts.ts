import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getProducts, getProductById, getCategories } from '../services/productsService';

export interface Product {
  _id: string;
  id: string;
  name: string;
  brand?: string;
  price: number;
  mrp?: number;
  discount: number;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  reviews?: number | string;
  youEarn: number;
  description?: string;
  features?: string[];
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasMore: boolean;
    };
  };
}

/**
 * useProducts Hook
 * Suitable for simple list fetching.
 */
export const useProducts = (params: any) => {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * useInfiniteProducts Hook
 * Suitable for FlashList/FlatList with infinite scrolling.
 */
export const useInfiniteProducts = (params: any) => {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getProducts({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.hasMore ? pagination.currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * useProduct (Single) Hook
 */
export const useProduct = (id: string, initialData?: any) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    initialData: initialData,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * useCategories Hook
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * useToggleFavorite Mutation Example
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // Logic for adding/removing from favorites (mock call)
      return { success: true }; 
    },
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      console.log('Successfully toggled favorite for:', productId);
    },
    onError: (error) => {
      console.error('Failed to toggle favorite:', error);
    }
  });
};
