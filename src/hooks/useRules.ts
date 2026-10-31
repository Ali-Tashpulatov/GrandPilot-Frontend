import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function useRules() {
  return useQuery({
    queryKey: ['rules'],
    queryFn: () => api.getRules(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRuleRefs() {
  return useQuery({
    queryKey: ['ruleRefs'],
    queryFn: () => api.getRuleRefs(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}
