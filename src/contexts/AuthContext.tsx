import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'motoboy' | 'balcao' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: 'admin' | 'motoboy' | 'balcao') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async (userId: string) => {
      try {
        console.log('🔍 Fetching role for user:', userId);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!mounted) {
          console.log('⚠️ Component unmounted, skipping role update');
          return;
        }
        
        if (error) {
          console.error('❌ Error fetching role:', error);
          setRole(null);
        } else {
          const userRole = (data?.role as UserRole) ?? null;
          console.log('✅ Role fetched:', userRole);
          setRole(userRole);
        }
      } catch (err) {
        console.error('❌ Exception in role fetch:', err);
        if (mounted) setRole(null);
      } finally {
        if (mounted) {
          setRoleLoading(false);
          setLoading(false);
          console.log('✅ Auth loading complete');
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setRoleLoading(true);
        // Defer async call to prevent deadlock
        setTimeout(() => {
          if (mounted) {
            fetchUserRole(session.user.id);
          }
        }, 0);
      } else {
        setRole(null);
        setRoleLoading(false);
        setLoading(false);
      }
    });

    // Initial session check
    const initAuth = async () => {
      console.log('🚀 Initializing auth...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setRoleLoading(true);
        setTimeout(() => {
          if (mounted) {
            fetchUserRole(session.user.id);
          }
        }, 0);
      } else {
        setRole(null);
        setRoleLoading(false);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${data.user?.email}`,
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setRole(null);
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const hasRole = (checkRole: 'admin' | 'motoboy' | 'balcao'): boolean => {
    return role === checkRole;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      role, 
      loading, 
      roleLoading,
      signIn, 
      signOut, 
      hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
