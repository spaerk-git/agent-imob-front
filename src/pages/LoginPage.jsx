import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Fingerprint } from 'lucide-react';
import { apiAuthPost } from '@/lib/api/supabase';
import { Helmet } from 'react-helmet';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha não pode estar em branco.' }),
});

const LoginPage = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await apiAuthPost('token?grant_type=password', {
        email: data.email,
        password: data.password,
      });
      
      login(response);

      toast({
        title: 'Login bem-sucedido! 🎉',
        description: 'Bem-vindo de volta!',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Erro de Autenticação',
        description: error.message || 'E-mail ou senha incorretos. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
          <title>Login | Painel de Atendimento</title>
          <meta name="description" content="Acesse o painel de atendimento do Agente Imobiliário." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-gradient-to-br from-background via-card to-background">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Fingerprint className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Acesse sua Conta</CardTitle>
              <CardDescription>Insira suas credenciais para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Digite seu email...."
                    className={errors.email ? 'border-destructive' : ''}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="Sua senha"
                    className={errors.password ? 'border-destructive' : ''}
                    autoComplete="current-password"
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;