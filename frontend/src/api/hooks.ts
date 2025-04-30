import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.HEALTH_CHECK);
        return { status: 'online', data: response.data };
      } catch (error) {
        return { status: 'offline', error };
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};

// Example query hook
export const useGetData = (endpoint: string) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await apiClient.get(endpoint);
      return response.data;
    },
  });
};

// Example mutation hook
export const usePostData = (endpoint: string) => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    },
  });
};

// Interpretations query hook
export const useInterpretations = (page = 1, limit = 20, sort = 'date', sortDirection = 'desc', query?: string) => {
  return useQuery({
    queryKey: ['interpretations', page, limit, sort, sortDirection, query],
    queryFn: async () => {
      const response = await apiClient.get(ENDPOINTS.INTERPRETATIONS, {
        params: { page, limit, sort, sortDirection, query }
      });
      return response.data;
    },
    enabled: !!localStorage.getItem('bearerToken'),
  });
};

// Create QueryClient instance
export const queryClient = new QueryClient();
