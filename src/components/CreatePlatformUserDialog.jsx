import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePlatformUsers } from '@/hooks/usePlatformUsers';
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

const platformUserSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
  role: z.enum(['adm', 'user', 'interno'], { required_error: 'O perfil é obrigatório.' }),
});

export const CreatePlatformUserDialog = ({ isOpen, onOpenChange }) => {
  const { addUser, isAddingUser } = usePlatformUsers();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(platformUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: undefined,
    }
  });
  
  useEffect(() => {
    if (isSubmitSuccessful && !isAddingUser) {
      reset();
      onOpenChange(false);
    }
  }, [isSubmitSuccessful, isAddingUser, reset, onOpenChange]);

  const onSubmit = (data) => {
    addUser(data);
  };
  
  const handleCancel = () => {
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
      else onOpenChange(true);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Usuário da Plataforma</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo acesso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <div className="col-span-3">
              <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} placeholder="Nome completo" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input id="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} placeholder="exemplo@email.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Senha
            </Label>
             <div className="col-span-3">
              <Input id="password" type="password" {...register('password')} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Perfil
            </Label>
            <div className="col-span-3">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adm">Administrador</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="interno">Interno</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-xs text-destructive mt-1">{errors.role.message}</p>}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isAddingUser}>
            {isAddingUser ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};