import { useState, useMemo, useCallback } from 'react';
    import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
    import { apiGet, apiPost, apiPatch } from '@/lib/api/supabase';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';

    const fetchUsers = async () => {
      return apiGet('usuarios?select=*&data_exclusao=is.null');
    };

    const createUser = async ({ userData }) => {
      return apiPost('usuarios', userData);
    };

    const updateUser = async ({ userId, userData }) => {
      return apiPatch(`usuarios?id=eq.${userId}`, userData);
    };

    export const useUsers = () => {
      const { user } = useAuth();
      const queryClient = useQueryClient();
      const { toast } = useToast();

      const { data: users = [], isLoading, isError, error } = useQuery({
        queryKey: ['users'],
        queryFn: () => fetchUsers(),
        enabled: !!user,
      });

      const { mutate: addUser, isPending: isAddingUser } = useMutation({
        mutationFn: (userData) => createUser({ userData }),
        onSuccess: () => {
          toast({
            title: "Sucesso!",
            description: "Usuário criado com sucesso.",
            variant: "success",
          });
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
          toast({
            title: "Erro ao criar usuário",
            description: err.message || "Não foi possível criar o usuário. Tente novamente.",
            variant: "destructive",
          });
        },
      });

      const { mutate: editUser, isPending: isEditingUser } = useMutation({
        mutationFn: ({ userId, userData }) => updateUser({ userId, userData }),
        onSuccess: () => {
          toast({
            title: "Sucesso!",
            description: "Usuário atualizado com sucesso.",
            variant: "success",
          });
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
          toast({
            title: "Erro ao atualizar usuário",
            description: err.message || "Não foi possível atualizar o usuário. Tente novamente.",
            variant: "destructive",
          });
        },
      });

      const { mutate: deleteUser, isPending: isDeletingUser } = useMutation({
        mutationFn: (userId) => updateUser({ userId, userData: { data_exclusao: new Date().toISOString() } }),
        onSuccess: () => {
          toast({
            title: "Sucesso!",
            description: "Usuário excluído com sucesso.",
            variant: "success",
          });
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
          toast({
            title: "Erro ao excluir usuário",
            description: err.message || "Não foi possível excluir o usuário. Tente novamente.",
            variant: "destructive",
          });
        },
      });

      const { mutate: toggleUserStatus, isPending: isTogglingStatus } = useMutation({
        mutationFn: ({ userId, currentStatus }) => updateUser({ userId, userData: { ativo: !currentStatus } }),
        onSuccess: (_, variables) => {
          toast({
            title: "Sucesso!",
            description: `Usuário ${!variables.currentStatus ? 'desbloqueado' : 'bloqueado'} com sucesso.`,
            variant: "success",
          });
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
          toast({
            title: "Erro ao alterar status",
            description: err.message || "Não foi possível alterar o status do usuário. Tente novamente.",
            variant: "destructive",
          });
        },
      });

      const [searchTerm, setSearchTerm] = useState('');
      const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'ascending' });

      const sortedAndFilteredUsers = useMemo(() => {
        let sortableItems = [...users];

        if (searchTerm) {
            sortableItems = sortableItems.filter(user =>
                user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.telefone.includes(searchTerm)
            );
        }
        
        if (sortConfig.key !== null) {
          sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                if (aValue === bValue) return 0;
                const order = (aValue ? -1 : 1);
                return sortConfig.direction === 'ascending' ? order : -order;
            }

            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          });
        }
        return sortableItems;
      }, [users, searchTerm, sortConfig]);

      const requestSort = useCallback((key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      }, [sortConfig]);

      return {
        users: sortedAndFilteredUsers,
        totalCount: sortedAndFilteredUsers.length,
        isLoading,
        isError,
        error,
        searchTerm,
        setSearchTerm,
        requestSort,
        sortConfig,
        addUser,
        isAddingUser,
        editUser,
        isEditingUser,
        deleteUser,
        isDeletingUser,
        toggleUserStatus,
        isTogglingStatus,
      };
    };
