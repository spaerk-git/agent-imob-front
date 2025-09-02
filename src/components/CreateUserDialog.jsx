import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUsers } from '@/hooks/useUsers';
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
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { formatPhoneNumberForInput, unmaskPhoneNumber } from '@/lib/utils';

const userSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  telefone: z.string().min(11, { message: 'O telefone é obrigatório.' }),
  tipo: z.enum(['usuario', 'humano'], { required_error: 'O tipo é obrigatório.' }),
});

export const CreateUserDialog = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const { addUser, isAddingUser } = useUsers();
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
        nome: "",
        telefone: "",
        tipo: undefined,
    }
  });

  const telefoneValue = watch('telefone');

  useEffect(() => {
    setValue('telefone', formatPhoneNumberForInput(telefoneValue));
  }, [telefoneValue, setValue]);

  useEffect(() => {
    if (isSubmitSuccessful && !isAddingUser) {
      reset();
      onOpenChange(false);
    }
  }, [isSubmitSuccessful, isAddingUser, reset, onOpenChange]);

  const onSubmit = (data) => {
    const telefoneSemMascara = unmaskPhoneNumber(data.telefone);

    if (telefoneSemMascara.length < 10) {
        toast({
            title: "Erro de Validação",
            description: "Número de telefone inválido.",
            variant: "destructive",
        });
        return;
    }

    const userData = {
        nome: data.nome,
        telefone: telefoneSemMascara,
        tipo: data.tipo,
        ativo: true,
        role: data.tipo === 'humano' ? 'interno' : 'user',
    };

    addUser(userData);
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
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar um novo operador ao painel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <div className="col-span-3">
              <Input id="nome" {...register('nome')} className={errors.nome ? 'border-destructive' : ''} />
              {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefone" className="text-right">
              Telefone
            </Label>
             <div className="col-span-3">
              <Input id="telefone" {...register('telefone')} className={errors.telefone ? 'border-destructive' : ''} placeholder="+55 (00) 00000-0000" />
              {errors.telefone && <p className="text-xs text-destructive mt-1">{errors.telefone.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo" className="text-right">
              Tipo
            </Label>
            <div className="col-span-3">
                <Select
                    onValueChange={(value) => setValue('tipo', value)}
                    {...control.register('tipo')}
                >
                    <SelectTrigger className={errors.tipo ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="usuario">Usuário</SelectItem>
                        <SelectItem value="humano">Humano</SelectItem>
                    </SelectContent>
                </Select>
                {errors.tipo && <p className="text-xs text-destructive mt-1">{errors.tipo.message}</p>}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isAddingUser}>
            {isAddingUser ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
