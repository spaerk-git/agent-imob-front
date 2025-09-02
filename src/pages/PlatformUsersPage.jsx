import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Search, AlertCircle, MoreHorizontal, KeyRound, Trash2 } from 'lucide-react';
import { usePlatformUsers } from '@/hooks/usePlatformUsers';
import { CreatePlatformUserDialog } from '@/components/CreatePlatformUserDialog';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PlatformUsersPage = () => {
    const {
        users,
        isLoading,
        isError,
        totalCount,
        searchTerm,
        setSearchTerm,
        removeUser,
        isDeletingUser,
        recoverPassword,
        isRecoveringPassword,
    } = usePlatformUsers();

    const [isUserDialogOpen, setUserDialogOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isRecoverConfirmOpen, setRecoverConfirmOpen] = useState(false);
    const [userToAction, setUserToAction] = useState(null);

    const openDeleteConfirmation = (user) => {
        setUserToAction(user);
        setDeleteConfirmOpen(true);
    };

    const openRecoverConfirmation = (user) => {
        setUserToAction(user);
        setRecoverConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!userToAction) return;
        removeUser(userToAction.id, {
            onSuccess: () => setDeleteConfirmOpen(false),
        });
    };

    const handleConfirmRecover = () => {
        if (!userToAction) return;
        recoverPassword(userToAction.email, {
            onSuccess: () => setRecoverConfirmOpen(false)
        });
    };

    return (
        <>
            <CreatePlatformUserDialog
                isOpen={isUserDialogOpen}
                onOpenChange={setUserDialogOpen}
            />
            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Confirmar Exclusão"
                description={`Tem certeza que deseja excluir o usuário "${userToAction?.nome}"? Esta ação é irreversível.`}
                onConfirm={handleConfirmDelete}
                confirmText="Sim, excluir"
                isLoading={isDeletingUser}
            />
            <ConfirmationDialog
                isOpen={isRecoverConfirmOpen}
                onOpenChange={setRecoverConfirmOpen}
                title="Recuperar Senha"
                description={`Um e-mail de recuperação será enviado para ${userToAction?.email}. Deseja continuar?`}
                onConfirm={handleConfirmRecover}
                confirmText="Sim, enviar e-mail"
                isLoading={isRecoveringPassword}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 p-6 overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Usuários da Plataforma</h1>
                        <p className="text-muted-foreground">Gerencie os usuários com acesso ao sistema.</p>
                    </div>
                    <Button onClick={() => setUserDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Cadastrar Usuário
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Usuários</CardTitle>
                        <CardDescription>
                            Lista de todos os usuários com acesso à plataforma. Encontrados {totalCount} usuários.
                        </CardDescription>
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Criado Em</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : isError ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-destructive h-24">
                                                <div className="flex items-center justify-center gap-2">
                                                    <AlertCircle className="h-5 w-5" />
                                                    <span>Erro ao carregar usuários. Tente novamente.</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length > 0 ? (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.nome || 'Não informado'}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openRecoverConfirmation(user)}>
                                                                <KeyRound className="mr-2 h-4 w-4" />
                                                                Alterar Senha
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteConfirmation(user)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">
                                                Nenhum usuário encontrado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
};

export default PlatformUsersPage;