import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  is_combo: boolean;
  imagem_url?: string; // Rota da imagem no banco
}

interface ItemCarrinho extends Produto {
  quantidade: number;
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
      console.error('Erro ao buscar produtos:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCartCount = useCallback(async () => {
    if (!user?.id) {
      setCarrinhoCount(0);
      return;
    }
    try {
      const cartKey = `carrinho_${user.id}`;
      const savedCart = await AsyncStorage.getItem(cartKey);
      if (savedCart) {
        const cart: ItemCarrinho[] = JSON.parse(savedCart);
        const count = cart.reduce((sum, item) => sum + item.quantidade, 0);
        setCarrinhoCount(count);
      } else {
        setCarrinhoCount(0);
      }
    } catch (error) {
      console.error('Erro ao carregar contagem do carrinho:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  const adicionarAoCarrinho = async (produto: Produto) => {
    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar itens ao carrinho.');
      return;
    }

    try {
      const cartKey = `carrinho_${user.id}`;
      const savedCart = await AsyncStorage.getItem(cartKey);
      let newCart: ItemCarrinho[] = savedCart ? JSON.parse(savedCart) : [];
      
      const itemIndex = newCart.findIndex((p) => p.id === produto.id);
      if (itemIndex > -1) {
        newCart[itemIndex].quantidade += 1;
      } else {
        newCart.push({ ...produto, quantidade: 1 });
      }
      
      await AsyncStorage.setItem(cartKey, JSON.stringify(newCart));
      const count = newCart.reduce((sum, item) => sum + item.quantidade, 0);
      setCarrinhoCount(count);
      Alert.alert('Sucesso', `${produto.nome} adicionado ao carrinho!`);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      Alert.alert('Erro', 'Não foi possível adicionar ao carrinho.');
    }
  };

  const categorias = Array.from(new Set(produtos.map(p => p.categoria)));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.headerLogo}
          />
          <View>
            <Text style={styles.headerTitle}>Debug Pastelaria</Text>
            <Text style={styles.headerSubtitle}>O sabor não encontrado (404)</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
          <Text style={styles.cartBtnText}>🛒 {carrinhoCount}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.welcomeText}>Olá, {user?.nome_completo || 'visitante'}!</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#D4A574" style={{ marginTop: 50 }} />
        ) : (
          categorias.map(categoria => (
            <View key={categoria} style={styles.section}>
              <Text style={styles.sectionTitle}>{categoria}</Text>
              {produtos
                .filter(p => p.categoria === categoria)
                .map(produto => (
                  <View key={produto.id} style={styles.produtoCard}>
                    <Image 
                      source={produto.imagem_url ? { uri: produto.imagem_url } : require('../../assets/images/icon.png')} 
                      style={styles.produtoImagem}
                    />
                    <View style={styles.produtoInfo}>
                      <Text style={styles.produtoNome}>{produto.nome}</Text>
                      <Text style={styles.produtoPreco}>R$ {produto.preco.toFixed(2)}</Text>
                      {produto.is_combo && <Text style={styles.comboBadge}>🎟️ Ganha Ticket</Text>}
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => adicionarAoCarrinho(produto)}>
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
  cartBtn: { backgroundColor: '#fff', padding: 10, borderRadius: 20, minWidth: 50, alignItems: 'center' },
  cartBtnText: { color: '#D4A574', fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  welcomeText: { fontSize: 16, color: '#666', marginBottom: 20, fontWeight: '500' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#D4A574', paddingBottom: 5, alignSelf: 'flex-start' },
  produtoCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  produtoImagem: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#f9f9f9' },
  produtoInfo: { flex: 1 },
  produtoNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  produtoPreco: { fontSize: 14, color: '#D4A574', fontWeight: 'bold', marginTop: 4 },
  comboBadge: { fontSize: 10, color: '#4CAF50', fontWeight: 'bold', marginTop: 4 },
  addBtn: { backgroundColor: '#D4A574', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
