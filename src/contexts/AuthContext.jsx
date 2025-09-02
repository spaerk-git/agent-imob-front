import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiAuthPost } from '@/lib/api/supabase';
import { SUPABASE_KEY } from '@/lib/api/config';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  updateUserMetadata: async () => {},
  updateUserPassword: async () => {},
  sendPasswordRecovery: async () => {},
  isAuthenticated: false,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const syncUserFromLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('auth_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncUserFromLocalStorage();
    window.addEventListener('storage', syncUserFromLocalStorage);
    return () => {
      window.removeEventListener('storage', syncUserFromLocalStorage);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    navigate('/');
  };

  const logout = async (isSessionExpired = false) => {
    if (user && user.access_token && !isSessionExpired) {
        try {
            await apiAuthPost('logout', null, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    apikey: SUPABASE_KEY
                }
            });
        } catch (error) {
            console.error('Logout API call failed, logging out client-side anyway.', error);
        }
    }
    localStorage.removeItem('auth_user');
    setUser(null);
    
    if (isSessionExpired) {
        toast({
            title: "Sessão Expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            variant: "destructive",
        });
    }
    
    navigate('/login');
  };

  const updateUserMetadata = async (metadata) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const updatedUser = await apiAuthPost('user', { data: metadata }, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user.access_token}`
      }
    });

    const newUserState = { ...user, ...updatedUser };
    localStorage.setItem('auth_user', JSON.stringify(newUserState));
    setUser(newUserState);
    return updatedUser;
  };

  const updateUserPassword = async (password) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const updatedUser = await apiAuthPost('user', { password }, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        apikey: SUPABASE_KEY
      }
    });

    const newUserState = { ...user, ...updatedUser };
    localStorage.setItem('auth_user', JSON.stringify(newUserState));
    setUser(newUserState);
    return updatedUser;
  }
  
  const sendPasswordRecovery = async (email) => {
      return apiAuthPost('recover', { email });
  };

  const value = { user, login, logout, updateUserMetadata, updateUserPassword, sendPasswordRecovery, isAuthenticated: !!user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};