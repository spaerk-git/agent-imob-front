import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SUPABASE_KEY } from '@/lib/api/config';

const fetchUsers = async (token) => {
  return apiGet('usuarios?select=*', {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_KEY,
    },
  });
};

export const useManageUsers = () => {
  const { user } = useAuth();
  const token = user?.access_token;

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['manageUsers', token],
    queryFn: () => fetchUsers(token),
    enabled: !!token,
  });

  return {
    users,
    isLoading,
    isError,
    error,
  };
};
