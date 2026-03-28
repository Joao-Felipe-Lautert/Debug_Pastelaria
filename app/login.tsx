import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';

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
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.toLowerCase().trim(), password, nomeCompleto.trim(), turma.trim());
        Alert.alert('Sucesso!', 'Conta criada com sucesso!', [{ text: 'OK', onPress: () => setIsSignUp(false) }]);
      } else {
        await signIn(email.toLowerCase().trim(), password);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/images/icon.jpeg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Debug Pastelaria</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Criar Conta' : 'Fazer Login'}</Text>
      </View>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        {isSignUp && (
          <>
            <TextInput style={styles.input} placeholder="Nome Completo" value={nomeCompleto} onChangeText={setNomeCompleto} />
            <TextInput style={styles.input} placeholder="Série/Turma" value={turma} onChangeText={setTurma} />
          </>
        )}
        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleAuth} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '⏳ Processando...' : isSignUp ? '✓ Criar Conta' : '✓ Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>{isSignUp ? '← Já tem conta? Faça login' : 'Não tem conta? Crie uma →'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#D4A574' },
  subtitle: { fontSize: 18, color: '#666' },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 14, marginBottom: 15, borderRadius: 8, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#D4A574', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toggleText: { color: '#D4A574', textAlign: 'center', marginTop: 15, fontWeight: '600' },
});
