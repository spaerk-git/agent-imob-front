import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/supabase';
import { useAuth } from '@/contexts/AuthContext';

const fetchDashboardMetrics = async () => {
  const data = await apiGet('indicadores_dashboard?select=*');
  return data[0] || {}; 
};

export const useDashboardMetrics = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    enabled: !!user,
  });

  return {
    metrics: data,
    isLoading,
    isError,
    error,
  };
};