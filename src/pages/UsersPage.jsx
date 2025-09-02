import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { Input } from '@/components/ui/input';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Badge } from '@/components/ui/badge';
    import { PlusCircle, MoreHorizontal, UserX, Edit, Ban, Search, AlertCircle, ChevronsUpDown, ArrowDown, ArrowUp } from 'lucide-react';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';
    import { useUsers } from '@/hooks/useUsers';
    import { UserDialog } from '@/components/UserDialog.jsx';
    import { ConfirmationDialog } from '@/components/ConfirmationDialog.jsx';
    import { formatPhoneNumber } from '@/lib/utils';
    import { cn } from '@/lib/utils';

    const SortableHeader = ({ children, columnKey, sortConfig, requestSort }) => {
        const isSorted = sortConfig.key === columnKey;
        const Icon = isSorted ? (sortConfig.direction === 'ascending' ? ArrowUp : ArrowDown) : ChevronsUpDown;

        return (
            <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => requestSort(columnKey)}
            >
                <div className="flex items-center gap-2">
                    {children}
                    <Icon className={cn("h-4 w-4", isSorted ? "text-foreground" : "text-muted-foreground/50")} />
                </div>
            </TableHead>
        );
    };

    const UsersPage = () => {
        const {
            users,
            isLoading,
            isError,
            searchTerm,
            setSearchTerm,
            totalCount,
            requestSort,
            sortConfig,
            deleteUser,
            isDeletingUser,
            toggleUserStatus,
            isTogglingStatus,
        } = useUsers();
        
        const [isUserDialogOpen, setUserDialogOpen] = useState(false);
        const [editingUser, setEditingUser] = useState(null);
        const [isConfirmOpen, setConfirmOpen] = useState(false);
        const [userToAction, setUserToAction] = useState(null);
        const [actionType, setActionType] = useState(null);

        const handleCreateUser = () => {
            setEditingUser(null);
            setUserDialogOpen(true);
        };

        const handleEditUser = (user) => {
            setEditingUser(user);
            setUserDialogOpen(true);
        };

        const openConfirmation = (user, type) => {
            setUserToAction(user);
            setActionType(type);
            setConfirmOpen(true);
        };
        
        const closeConfirmation = () => {
            setConfirmOpen(false);
            setTimeout(() => {
                setUserToAction(null);
                setActionType(null);
            }, 300);
        }

        const handleConfirmAction = () => {
            if (!userToAction || !actionType) return;

            if (actionType === 'delete') {
                deleteUser(userToAction.id, {
                    onSuccess: () => closeConfirmation(),
                });
            } else if (actionType === 'toggleStatus') {
                toggleUserStatus({ userId: userToAction.id, currentStatus: userToAction.ativo }, {
                    onSuccess: () => closeConfirmation(),
                });
            }
        };

        const getConfirmationDetails = () => {
            if (!userToAction) return {};
            if (actionType === 'delete') {
                return {
                    title: 'Confirmar Exclusão',
                    description: `Tem certeza que deseja excluir o usuário "${userToAction.nome}"? Esta ação não pode ser desfeita.`,
                    confirmText: 'Sim, excluir',
                    isLoading: isDeletingUser,
                };
            }
            if (actionType === 'toggleStatus') {
                const isBlocking = userToAction.ativo;
                return {
                    title: `Confirmar ${isBlocking ? 'Bloqueio' : 'Desbloqueio'}`,
                    description: `Tem certeza que deseja ${isBlocking ? 'bloquear' : 'desbloquear'} o usuário "${userToAction.nome}"?`,
                    confirmText: `Sim, ${isBlocking ? 'bloquear' : 'desbloquear'}`,
                    isLoading: isTogglingStatus,
                };
            }
            return {};
        };

        const confirmationDetails = getConfirmationDetails();

        return (
            <>
                <UserDialog 
                    isOpen={isUserDialogOpen} 
                    onOpenChange={setUserDialogOpen}
                    user={editingUser}
                />
                <ConfirmationDialog
                    isOpen={isConfirmOpen}
                    onOpenChange={setConfirmOpen}
                    title={confirmationDetails.title}
                    description={confirmationDetails.description}
                    onConfirm={handleConfirmAction}
                    confirmText={confirmationDetails.confirmText}
                    isLoading={confirmationDetails.isLoading}
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
                            <h1 className="text-3xl font-bold">Usuários Whatsapp</h1>
                            <p className="text-muted-foreground">Gerencie os operadores que interagem via Whatsapp.</p>
                        </div>
                        <Button onClick={handleCreateUser}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar Usuário
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Operadores</CardTitle>
                            <CardDescription>
                                Lista de todos os operadores com acesso ao painel. Encontrados {totalCount} usuários.
                            </CardDescription>
                            <div className="relative pt-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome ou telefone..."
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
                                            <SortableHeader columnKey="nome" sortConfig={sortConfig} requestSort={requestSort}>Nome</SortableHeader>
                                            <TableHead>Telefone</TableHead>
                                            <SortableHeader columnKey="tipo" sortConfig={sortConfig} requestSort={requestSort}>Tipo</SortableHeader>
                                            <SortableHeader columnKey="ativo" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            [...Array(5)].map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : isError ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-destructive h-24">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <AlertCircle className="h-5 w-5" />
                                                        <span>Erro ao carregar usuários. Tente novamente.</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : users.length > 0 ? (
                                            users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.nome}</TableCell>
                                                    <TableCell>{formatPhoneNumber(user.telefone) || 'Não informado'}</TableCell>
                                                    <TableCell>{user.tipo || 'Não informado'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.ativo ? 'success' : 'destructive'}>
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
                                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                                    <Edit className="mr-2 h-4 w-4"/> Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openConfirmation(user, 'toggleStatus')}>
                                                                    <Ban className="mr-2 h-4 w-4"/> {user.ativo ? 'Bloquear' : 'Desbloquear'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive" onClick={() => openConfirmation(user, 'delete')}>
                                                                   <UserX className="mr-2 h-4 w-4"/> Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">
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

    export default UsersPage;