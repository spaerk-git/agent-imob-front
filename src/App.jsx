import React from 'react';
import { Helmet } from 'react-helmet';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ConversationsPage from '@/pages/ConversationsPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import PlatformUsersPage from '@/pages/PlatformUsersPage';
import ProfilePage from '@/pages/ProfilePage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import ManageUsersPage from '@/pages/ManageUsersPage';

function App() {
    return (
        <>
            <Helmet>
                <title>Painel de Atendimento | Agente Imobiliário</title>
                <meta name="description" content="Painel de gerenciamento de conversas e suporte ao cliente da Agente Imobiliário." />
            </Helmet>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route 
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<ConversationsPage />} />
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/whatsapp-users" element={<UsersPage />} />
                                    <Route path="/platform-users" element={<PlatformUsersPage />} />
                                    <Route path="/manage-users" element={<ManageUsersPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="*" element={<Navigate to="/" />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </>
    );
}

export default App;
