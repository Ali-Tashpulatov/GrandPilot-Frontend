import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import type { TriageRequest, TriageResponse } from '@/types/api';

export function useTriage() {
  return useMutation<TriageResponse, Error, TriageRequest>({
    mutationFn: (data) => api.triage(data),
  });
}
