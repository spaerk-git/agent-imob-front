import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building, MessageSquare, LayoutDashboard, Users, Moon, Sun, ShieldCheck, LogOut, Settings, Users2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const navItems = [
  { href: '/', icon: MessageSquare, label: 'Conversas' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/manage-users', icon: Users2, label: 'Gerenciar Usuários' }
];

const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Você se desconectou.',
      description: 'Sessão encerrada com sucesso.',
      variant: 'success'
    });
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Building className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold">Agente Imobiliário</h1>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-border space-y-2">
        <div className="px-3 py-2 text-center">
            <p className="text-xs font-semibold text-muted-foreground truncate" title={user?.user?.email}>
                {user?.user?.email}
            </p>
        </div>
        <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
        </NavLink>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{theme === 'light' ? 'Tema Claro' : 'Tema Escuro'}</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;