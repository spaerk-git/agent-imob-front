import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAuthPost, apiPost, apiPatch } from '@/lib/api/supabase';
import { useToast } from '@/components/ui/use-toast';
import { formatPhoneNumberForInput, unmaskPhoneNumber } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const createBaseSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  telefone: z.string().min(18, { message: 'O telefone é obrigatório e deve ser completo.' }),
  tipo: z.enum(['Administrador', 'Interno', 'Usuário'], { required_error: 'O tipo é obrigatório.' }),
});

const createPlatformUserSchema = createBaseSchema.extend({
  email: z.string().email({ message: 'E-mail inválido.' }),
  senha: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
});

const createWhatsappUserSchema = createBaseSchema;

const updateSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  telefone: z.string().min(18, { message: 'O telefone é obrigatório e deve ser completo.' }),
});


const CreateManageUserDialog = ({ isOpen, onOpenChange, userToEdit }) => {
  const [userType, setUserType] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  const isEditMode = !!userToEdit;

  const currentSchema = isEditMode 
    ? updateSchema
    : userType === 'Administrador' || userType === 'Interno' 
      ? createPlatformUserSchema 
      : createWhatsappUserSchema;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      tipo: undefined,
      email: '',
      senha: '',
    },
  });

  const selectedType = watch('tipo');
  const telefoneValue = watch('telefone');

  useEffect(() => {
    setUserType(selectedType);
  }, [selectedType]);

  useEffect(() => {
    setValue('telefone', formatPhoneNumberForInput(telefoneValue));
  }, [telefoneValue, setValue]);

  useEffect(() => {
    if (isEditMode && userToEdit) {
      reset({
        nome: userToEdit.nome,
        telefone: formatPhoneNumberForInput(userToEdit.telefone),
        tipo: userToEdit.tipo === 'humano' ? (userToEdit.role === 'adm' ? 'Administrador' : 'Interno') : 'Usuário',
        email: userToEdit.email,
      });
      setUserType(userToEdit.tipo === 'humano' ? (userToEdit.role === 'adm' ? 'Administrador' : 'Interno') : 'Usuário');
    } else if (!isOpen) {
      reset({
        nome: '',
        telefone: '',
        tipo: undefined,
        email: '',
        senha: '',
      });
      setUserType('');
    }
  }, [isOpen, isEditMode, userToEdit, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async (data) => {
        const telefoneSemMascara = unmaskPhoneNumber(data.telefone);
        const token = authUser?.access_token;
        //const headers = { Authorization: `Bearer ${token}` };

        if (isEditMode) {
          return apiPatch(`usuarios?id=eq.${userToEdit.id}`, {
            nome: data.nome,
            telefone: telefoneSemMascara,
          });
        }
        
        if (data.tipo === 'Administrador' || data.tipo === 'Interno') {
            const signUpResponse = await apiAuthPost('signup', {
                email: data.email,
                password: data.senha,
            });

            if (!signUpResponse?.user?.id) {
                throw new Error("Falha ao criar autenticação do usuário.");
            }
            const userIdAuth = signUpResponse.user.id;
            
            const userPayload = {
                nome: data.nome,
                telefone: telefoneSemMascara,
                tipo: 'humano',
                ativo: true,
                role: data.tipo === 'Administrador' ? 'adm' : 'interno',
                email: data.email,
                id_auth: userIdAuth,
            };
            return apiPost('usuarios', userPayload);
        } else {
            const userPayload = {
                nome: data.nome,
                telefone: telefoneSemMascara,
                tipo: 'usuario',
                ativo: true,
                role: 'user',
            };
            return apiPost('usuarios', userPayload);
        }
    },
    onSuccess: () => {
        toast({
            title: "Sucesso!",
            description: `Usuário ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso.`,
            variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: ['manageUsers'] });
        onOpenChange(false);
    },
    onError: (error) => {
        toast({
            title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} usuário`,
            description: error.data?.msg || error.message || 'Ocorreu um erro inesperado.',
            variant: 'destructive',
        });
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Usuário' : 'Cadastrar Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Altere os dados do usuário abaixo.' : 'Preencha os campos abaixo para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isEditMode && (
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                      <SelectTrigger id="tipo" className={errors.tipo ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione o tipo de usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Interno">Interno</SelectItem>
                        <SelectItem value="Usuário">Usuário (Whatsapp)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tipo && <p className="text-xs text-destructive mt-1">{errors.tipo.message}</p>}
              </div>
            )}
            
            {(selectedType || isEditMode) && (
                <>
                    <div>
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" {...register('nome')} placeholder="Nome completo" className={errors.nome ? 'border-destructive' : ''} />
                        {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" {...register('telefone')} placeholder="+55 (00) 00000-0000" className={errors.telefone ? 'border-destructive' : ''} />
                        {errors.telefone && <p className="text-xs text-destructive mt-1">{errors.telefone.message}</p>}
                    </div>

                    {(selectedType === 'Administrador' || selectedType === 'Interno') && !isEditMode &&(
                        <>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register('email')} placeholder="exemplo@sounet.com.br" className={errors.email ? 'border-destructive' : ''} />
                                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="senha">Senha</Label>
                                <Input id="senha" type="password" {...register('senha')} className={errors.senha ? 'border-destructive' : ''} />
                                {errors.senha && <p className="text-xs text-destructive mt-1">{errors.senha.message}</p>}
                            </div>
                        </>
                    )}
                </>
            )}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={mutation.isPending || (!selectedType && !isEditMode)}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditMode ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateManageUserDialog;