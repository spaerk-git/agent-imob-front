import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { UpdatePasswordDialog } from '@/components/UpdatePasswordDialog';
import { apiGet, apiPatch } from '@/lib/api/supabase';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email(),
});


const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isErrorProfile, setIsErrorProfile] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (!user?.user?.id) return;                // espera o user existir p/ buscar

    let cancelled = false;
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      setIsErrorProfile(false);
      try {
        const data = await apiGet(`usuarios?select=*&id_auth=eq.${user.user.id}`);
        if (!cancelled && data?.length) {
          setValue('name', data[0].nome || '');
          setValue('email', data[0].email || '');
        }
      } catch (e) {
        if (!cancelled) setIsErrorProfile(true);
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    };
    fetchProfileData();
    return () => { cancelled = true };
  }, [user, setValue, toast]);


  const onProfileSubmit = async (data) => {
    if (!user?.user?.id) return;
    setIsUpdatingProfile(true);
    try {
      await apiPatch(`usuarios?id_auth=eq.${user.user.id}`, { nome: data.name });
      toast({
        title: "Sucesso!",
        description: "Seu nome foi atualizado.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro!",
        description: error.message || "Não foi possível atualizar seu nome.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const ProfileFormSkeleton = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
        </div>
    </div>
  );

  return (
    <>
      <UpdatePasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setPasswordDialogOpen} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configurações de Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e de segurança.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seu nome e e-mail.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProfile ? <ProfileFormSkeleton /> : isErrorProfile ? (
                <div className="flex flex-col items-center justify-center text-destructive p-8 gap-2">
                    <AlertCircle className="h-8 w-8" />
                    <p>Falha ao carregar informações do perfil.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" {...register('name')} />
                    {profileErrors.name && <p className="text-xs text-destructive mt-1">{profileErrors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} disabled />
                    <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <Button type="submit" disabled={isUpdatingProfile}>
                            {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Salvar Alterações
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                            Alterar Senha
                        </Button>
                    </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default ProfilePage;