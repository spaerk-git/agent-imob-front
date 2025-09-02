import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
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
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string().min(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export const UpdatePasswordDialog = ({ isOpen, onOpenChange }) => {
  const { updateUserPassword } = useAuth();
  const { toast } = useToast();
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  React.useEffect(() => {
    if (isSubmitSuccessful && !isUpdatingPassword) {
      reset();
      onOpenChange(false);
    }
  }, [isSubmitSuccessful, isUpdatingPassword, reset, onOpenChange]);

  const onPasswordSubmit = async (data) => {
    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(data.password);
      toast({
        title: "Sucesso!",
        description: "Sua senha foi atualizada.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro!",
        description: error.message || "Não foi possível atualizar sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
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
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>Escolha uma nova senha para sua conta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password-dialog">Nova Senha</Label>
            <Input id="password-dialog" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword-dialog">Confirmar Nova Senha</Label>
            <Input id="confirmPassword-dialog" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isUpdatingPassword}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit(onPasswordSubmit)} disabled={isUpdatingPassword}>
            {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Atualizar Senha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};