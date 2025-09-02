import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { Loader2, Building } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string().min(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

const UpdatePasswordPage = () => {
    const { updateUserPassword } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isUpdating, setIsUpdating] = useState(false);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const type = params.get('type');

        if (type === 'recovery' && token) {
            setAccessToken(token);
        } else if (!token) {
            toast({
                title: "Token inválido",
                description: "O link de recuperação de senha é inválido ou expirou.",
                variant: "destructive",
            });
            navigate('/login');
        }
    }, [location, navigate, toast]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit = async (data) => {
        if (!accessToken) {
            toast({ title: "Erro", description: "Token de acesso não encontrado.", variant: "destructive" });
            return;
        }

        setIsUpdating(true);
        try {
            await updateUserPassword(data.password, accessToken);
            toast({
                title: "Sucesso!",
                description: "Sua senha foi atualizada. Você pode fazer login agora.",
                variant: "success",
            });
            navigate('/login');
        } catch (error) {
            toast({
                title: "Erro!",
                description: error.message || "Não foi possível atualizar sua senha.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 mb-8">
                <Building className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Agente Imobiliário</h1>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Atualizar Senha</CardTitle>
                        <CardDescription>Digite sua nova senha abaixo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <Input id="password" type="password" {...register('password')} />
                                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Salvar Nova Senha
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default UpdatePasswordPage;