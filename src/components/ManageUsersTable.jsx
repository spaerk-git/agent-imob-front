import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiAuthPost } from '@/lib/api/supabase';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Ban, UserX, MoreHorizontal, KeySquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useManageUsers } from '@/hooks/useManageUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPhoneNumber } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import CreateManageUserDialog from '@/components/CreateManageUserDialog';
import { useAuth } from '@/contexts/AuthContext';


const ManageUsersTable = () => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const { users, isLoading, isError } = useManageUsers();
  
  const [dialogState, setDialogState] = useState({
    type: null, // 'block', 'delete', 'edit'
    user: null,
    isOpen: false,
  });

  const mutation = useMutation({
    mutationFn: async ({ action, user, payload }) => {
      
      switch (action) {
        case 'toggle_status':
          return apiPatch(`usuarios?id=eq.${user.id}`, payload);
        case 'delete':
          return apiPatch(`usuarios?id=eq.${user.id}`, payload);
        case 'reset_password':
          return apiAuthPost('recover', payload); // No auth header needed as per supabase docs
        default:
          throw new Error('Ação desconhecida');
      }
    },
    onSuccess: (_, variables) => {
      let successMessage = '';
      switch (variables.action) {
        case 'toggle_status':
          successMessage = `Status do usuário ${variables.user.nome} alterado com sucesso.`;
          break;
        case 'delete':
          successMessage = `Usuário ${variables.user.nome} excluído com sucesso.`;
          break;
        case 'reset_password':
          successMessage = `E-mail de recuperação de senha enviado para ${variables.user.email}.`;
          break;
        default:
          successMessage = 'Ação concluída com sucesso.';
      }
      toast({ title: "Sucesso!", description: successMessage, variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['manageUsers'] });
    },
    onError: (error, variables) => {
      let errorMessage = `Erro ao executar ação para ${variables.user.nome}.`;
      if(error.data?.msg) errorMessage = error.data.msg;
      else if (error.message) errorMessage = error.message;

      toast({ title: 'Erro!', description: errorMessage, variant: 'destructive' });
    },
    onSettled: () => {
      handleDialogClose();
    },
  });

  const handleActionClick = (type, user) => {
    setDialogState({ type, user, isOpen: true });
  };

  const handleDialogClose = () => {
    setDialogState({ type: null, user: null, isOpen: false });
  };

  const handleConfirmAction = () => {
    const { type, user } = dialogState;
    if (!type || !user) return;

    let action, payload;
    switch (type) {
      case 'block':
        action = 'toggle_status';
        payload = { ativo: !user.ativo };
        break;
      case 'delete':
        action = 'delete';
        payload = { data_exclusao: new Date().toISOString() };
        break;
      case 'reset_password':
        action = 'reset_password';
        payload = { email: user.email };
        break;
      default:
        return;
    }
    mutation.mutate({ action, user, payload });
  };


  const getStatusVariant = (status) => {
    return status ? 'success' : 'destructive';
  };

  const getTypeLabel = (type) => {
    if (type === 'humano') return 'Plataforma';
    if (type === 'usuario') return 'Whatsapp';
    return type || 'N/A';
  };
  
  const getDialogDetails = () => {
    const { type, user } = dialogState;
    if (!user) return {};

    switch (type) {
      case 'block':
        return {
          title: `${user.ativo ? 'Bloquear' : 'Desbloquear'} Usuário`,
          description: `Deseja realmente ${user.ativo ? 'bloquear' : 'desbloquear'} o usuário ${user.nome}?`,
          confirmText: user.ativo ? 'Bloquear' : 'Desbloquear',
        };
      case 'delete':
        return {
          title: 'Excluir Usuário',
          description: `Deseja realmente excluir o usuário ${user.nome}? Esta ação não pode ser desfeita.`,
          confirmText: 'Excluir',
        };
       case 'reset_password':
        return {
          title: 'Resetar Senha',
          description: `Deseja enviar um e-mail de recuperação de senha para ${user.email}?`,
          confirmText: 'Enviar E-mail',
        };
      default:
        return {};
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-destructive">Erro ao carregar usuários.</div>;
  }

  const dialogDetails = getDialogDetails();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.filter(u => !u.data_exclusao).map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nome}</TableCell>
              <TableCell>{formatPhoneNumber(user.telefone) || 'N/A'}</TableCell>
              <TableCell>{user.email || 'N/A'}</TableCell>
              <TableCell>{getTypeLabel(user.tipo)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(user.ativo)}>
                  {user.ativo ? 'Ativo' : 'Bloqueado'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleActionClick('edit', user)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionClick('block', user)}>
                      <Ban className="mr-2 h-4 w-4" /> {user.ativo ? 'Bloquear' : 'Desbloquear'}
                    </DropdownMenuItem>
                    {user.tipo === 'humano' && (
                      <DropdownMenuItem onClick={() => handleActionClick('reset_password', user)}>
                        <KeySquare className="mr-2 h-4 w-4" />
                        Reset de Senha
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleActionClick('delete', user)}>
                      <UserX className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <CreateManageUserDialog 
        isOpen={dialogState.type === 'edit' && dialogState.isOpen}
        onOpenChange={handleDialogClose}
        userToEdit={dialogState.user}
      />
      
      <ConfirmationDialog
        isOpen={dialogState.isOpen && (dialogState.type === 'block' || dialogState.type === 'delete' || dialogState.type === 'reset_password')}
        onOpenChange={handleDialogClose}
        title={dialogDetails.title}
        description={dialogDetails.description}
        onConfirm={handleConfirmAction}
        confirmText={dialogDetails.confirmText}
        isLoading={mutation.isPending}
      />
    </>
  );
};

export default ManageUsersTable;