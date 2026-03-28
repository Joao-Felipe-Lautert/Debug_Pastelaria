import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [turma, setTurma] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
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
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      let mensagemErro = error.message || 'Erro ao autenticar. Tente novamente.';
      if (mensagemErro.includes('Network request failed')) {
        mensagemErro = 'Erro de conexão. Verifique sua internet.';
      } else if (mensagemErro.includes('already registered')) {
        mensagemErro = 'Este email já está registrado.';
      } else if (mensagemErro.includes('Invalid login credentials')) {
        mensagemErro = 'Email ou senha incorretos.';
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
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Debug Pastelaria</Text>
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
          onChangeText={(text) => setPassword(text)}
          maxLength={24}
          secureTextEntry
          editable={!loading}
        />

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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 5,
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
    borderColor: '#eee',
    padding: 14,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
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
});
