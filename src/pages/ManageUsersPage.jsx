import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ManageUsersTable from '@/components/ManageUsersTable';
import CreateManageUserDialog from '@/components/CreateManageUserDialog';

const ManageUsersPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Gerenciar Usuários | Agente Imobiliário</title>
        <meta name="description" content="Gerencie todos os usuários da plataforma." />
      </Helmet>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>Cadastrar Usuário</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ManageUsersTable />
          </CardContent>
        </Card>
      </div>
      <CreateManageUserDialog isOpen={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  );
};

export default ManageUsersPage;