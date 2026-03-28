import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  is_combo: boolean;
  imagem_url?: string;
}

export default function HomeScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinhoCount, setCarrinhoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const fetchProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      setProdutos(data || []);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

  const categorias = Array.from(new Set(produtos.map(p => p.categoria)));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/images/icon.jpeg')} style={styles.headerLogo} />
          <View>
            <Text style={styles.headerTitle}>Debug Pastelaria</Text>
            <Text style={styles.headerSubtitle}>O sabor não encontrado (404)</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
          <Text style={styles.cartBtnText}>🛒</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.welcomeText}>Olá, {user?.nome_completo || 'visitante'}!</Text>
        {loading ? <ActivityIndicator size="large" color="#D4A574" /> : (
          categorias.map(categoria => (
            <View key={categoria} style={styles.section}>
              <Text style={styles.sectionTitle}>{categoria}</Text>
              {produtos.filter(p => p.categoria === categoria).map(produto => (
                <View key={produto.id} style={styles.produtoCard}>
                  <Image source={produto.imagem_url ? { uri: produto.imagem_url } : require('../../assets/images/icon.jpeg')} style={styles.produtoImagem} />
                  <View style={styles.produtoInfo}>
                    <Text style={styles.produtoNome}>{produto.nome}</Text>
                    <Text style={styles.produtoPreco}>R$ {produto.preco.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#D4A574', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 10, color: '#fff', opacity: 0.8 },
  cartBtn: { backgroundColor: '#fff', padding: 10, borderRadius: 20 },
  cartBtnText: { color: '#D4A574', fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  welcomeText: { fontSize: 16, color: '#666', marginBottom: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#D4A574' },
  produtoCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  produtoImagem: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#f9f9f9' },
  produtoInfo: { flex: 1 },
  produtoNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  produtoPreco: { fontSize: 14, color: '#D4A574', fontWeight: 'bold' },
  addBtn: { backgroundColor: '#D4A574', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
