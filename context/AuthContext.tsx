import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseConfig';

interface User {
  id: string;
  email: string;
  nome_completo?: string;
  turma?: string;
  adm?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, nomeCompleto: string, turma: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session?.user) {
        const userId = sessionData.session.user.id;
        
        // Tentativa de buscar dados extras da tabela 'usuarios'
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('nome_completo, turma, adm')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.warn('Aviso ao buscar dados extras (pode ser RLS):', error.message);
        }

        const newUser: User = {
          id: userId,
          email: sessionData.session.user.email || '',
          nome_completo: userData?.nome_completo || 'Usuário',
          turma: userData?.turma || '',
          adm: userData?.adm === true,
        };
        
        console.log('Usuário carregado no Context:', newUser);
        setUser(newUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro fatal no checkUser:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Registrar o listener ANTES de chamar checkUser para evitar race condition
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento Supabase Auth:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // Evento disparado na inicialização - usar a sessão já disponível
        await checkUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser]);

  const signUp = async (email: string, password: string, nomeCompleto: string, turma: string) => {
    try {
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Inserir dados na tabela pública
        const { error: insertError } = await supabase.from('usuarios').insert({
          id: data.user.id,
          email: email.toLowerCase().trim(),
          nome_completo: nomeCompleto.trim(),
          turma: turma.trim(),
          adm: false,
        });

        if (insertError) {
          console.error('Erro ao salvar perfil:', insertError);
        }
        
        await checkUser();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // O onAuthStateChange (SIGNED_IN) vai chamar checkUser automaticamente
      // mas chamamos aqui também para garantir que o estado seja atualizado imediatamente
      await checkUser();
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
