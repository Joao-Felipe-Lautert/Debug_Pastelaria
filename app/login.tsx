import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [turma, setTurma] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    // Validações
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }

    if (!password) {
      Alert.alert('Erro', 'Digite sua senha');
      return;
    }

    if (isSignUp) {
      if (!nomeCompleto.trim()) {
        Alert.alert('Erro', 'Digite seu nome completo');
        return;
      }
      if (!turma.trim()) {
        Alert.alert('Erro', 'Digite sua turma/série');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (password.length > 12) {
        Alert.alert('Erro', 'A senha não pode ter mais de 12 caracteres');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.toLowerCase().trim(), password, nomeCompleto.trim(), turma.trim());
        Alert.alert(
          'Sucesso!',
          'Conta criada com sucesso! Agora faça login com seus dados.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsSignUp(false);
                setEmail('');
                setPassword('');
                setNomeCompleto('');
                setTurma('');
              },
            },
          ]
        );
      } else {
        await signIn(email.toLowerCase().trim(), password);
        // O RootLayout cuida do redirecionamento automaticamente via useEffect
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      
      // Mensagens de erro mais específicas
      let mensagemErro = error.message || 'Erro ao autenticar. Tente novamente.';
      
      if (mensagemErro.includes('Network request failed')) {
        mensagemErro = 'Erro de conexão. Verifique:\n1. Sua internet está conectada?\n2. As chaves do Supabase estão corretas em supabaseConfig.ts?';
      } else if (mensagemErro.includes('already registered')) {
        mensagemErro = 'Este email já está registrado. Tente fazer login ou use outro email.';
      } else if (mensagemErro.includes('Invalid login credentials')) {
        mensagemErro = 'Email ou senha incorretos.';
      } else if (mensagemErro.includes('Email not confirmed')) {
        mensagemErro = 'Email não confirmado. Verifique seu email e clique no link.';
      }
      
      Alert.alert('Erro', mensagemErro, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setNomeCompleto('');
    setTurma('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🥐 Debug Pastelaria</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Criar Conta' : 'Fazer Login'}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        {isSignUp && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              placeholderTextColor="#999"
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Série/Turma (ex: 3º D.S)"
              placeholderTextColor="#999"
              value={turma}
              onChangeText={setTurma}
              editable={!loading}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Senha (6-12 caracteres)"
          placeholderTextColor="#999"
          value={password}
          onChangeText={(text) => {
            if (text.length <= 24) {
              setPassword(text);
            }
          }}
          maxLength={24}
          secureTextEntry
          editable={!loading}
        />

        {isSignUp && (
          <Text style={styles.hint}>
            💡 Use uma senha com números e letras para maior segurança
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '⏳ Processando...' : isSignUp ? '✓ Criar Conta' : '✓ Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMode} disabled={loading}>
          <Text style={styles.toggleText}>
            {isSignUp
              ? '← Já tem conta? Faça login'
              : 'Não tem conta? Crie uma →'}
          </Text>
        </TouchableOpacity>

        {!isSignUp && (
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>🧪 Dados de Teste</Text>
            <Text style={styles.demoText}>Email: teste@example.com</Text>
            <Text style={styles.demoText}>Senha: Teste123</Text>
            <Text style={styles.demoNote}>
              (Crie sua própria conta para usar o app)
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#D4A574',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#D4A574',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#D4A574',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  demoBox: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A574',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  demoNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
