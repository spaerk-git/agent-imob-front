import { useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiGet, apiAuthPost, apiPatch, apiAuthDelete } from '@/lib/api/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const fetchPlatformUsers = async () => {
  return apiGet('usuarios_plataforma?select=*');
};

const createPlatformUser = async ({ name, email, password, role }) => {
  const signUpResponse = await apiAuthPost('signup', { 
    email, 
    password,
    options: {
      data: {
        name: name,
        role: role,
      }
    }
  });
  
  if (!signUpResponse?.user?.id) {
    throw new Error("A resposta do cadastro não retornou um ID de usuário.");
  }

  const userId = signUpResponse.user.id;
  await apiPatch(`usuarios_plataforma?id=eq.${userId}`, { nome: name, role: role });

  return signUpResponse;
};

const deletePlatformUser = async (userId) => {
    // This requires admin privileges on Supabase
    return apiAuthDelete(`admin/users/${userId}`);
};

export const usePlatformUsers = () => {
  const { user, sendPasswordRecovery } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['platformUsers'],
    queryFn: fetchPlatformUsers,
    enabled: !!user,
  });

  const { mutate: addUser, isPending: isAddingUser } = useMutation({
    mutationFn: (userData) => createPlatformUser(userData),
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Usuário da plataforma criado com sucesso. Um e-mail de confirmação foi enviado.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['platformUsers'] });
    },
    onError: (err) => {
      let description = "Não foi possível criar o usuário. Tente novamente.";
      if (err.data?.msg === 'User already registered') {
        description = "Este e-mail já está cadastrado.";
      } else if (err.message) {
        description = err.message;
      }

      toast({
        title: "Erro ao criar usuário",
        description,
        variant: "destructive",
      });
    },
  });

  const { mutate: removeUser, isPending: isDeletingUser } = useMutation({
    mutationFn: (userId) => deletePlatformUser(userId),
    onSuccess: () => {
        toast({
            title: "Sucesso!",
            description: "Usuário da plataforma excluído com sucesso.",
            variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: ['platformUsers'] });
    },
    onError: (err) => {
        toast({
            title: "Erro ao excluir usuário",
            description: err.message || "Não foi possível excluir o usuário. Verifique as permissões.",
            variant: "destructive",
        });
    },
  });

  const { mutate: recoverPassword, isPending: isRecoveringPassword } = useMutation({
    mutationFn: (email) => sendPasswordRecovery(email),
    onSuccess: (_, email) => {
        toast({
            title: "Sucesso!",
            description: `Um e-mail de recuperação de senha foi enviado para ${email}.`,
            variant: "success",
        });
    },
    onError: (err) => {
        toast({
            title: "Erro ao enviar e-mail",
            description: err.message || "Não foi possível enviar o e-mail de recuperação.",
            variant: "destructive",
        });
    }
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;
    return users.filter(u => 
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.nome && u.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);


  return {
    users: filteredUsers,
    totalCount: filteredUsers.length,
    isLoading,
    isError,
    error,
    addUser,
    isAddingUser,
    removeUser,
    isDeletingUser,
    recoverPassword,
    isRecoveringPassword,
    searchTerm, 
    setSearchTerm,
  };
};
