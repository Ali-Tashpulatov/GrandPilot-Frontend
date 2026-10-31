import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { ConnectionStatus } from '@/types/api';

export function useConnectionStatus() {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: () => api.healthCheck(),
    refetchInterval: 15000,
    retry: 1,
    retryDelay: 2000,
  });

  const status: ConnectionStatus = query.isLoading
    ? 'checking'
    : query.isSuccess
      ? 'connected'
      : 'disconnected';

  return {
    status,
    isConnected: status === 'connected',
    error: query.error,
    refetch: query.refetch,
  };
}
