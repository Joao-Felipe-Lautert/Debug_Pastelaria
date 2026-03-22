import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabaseConfig';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  is_combo: boolean;
}

export default function CartScreen() {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const loadCart = useCallback(async () => {
    if (!user?.id) return;
    try {
      const cartKey = `carrinho_${user.id}`;
      const savedCart = await AsyncStorage.getItem(cartKey);
      if (savedCart) {
        setCarrinho(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const saveCart = async (newCart: ItemCarrinho[]) => {
    if (!user?.id) return;
    try {
      const cartKey = `carrinho_${user.id}`;
      await AsyncStorage.setItem(cartKey, JSON.stringify(newCart));
      setCarrinho(newCart);
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  };

  const removerDoCarrinho = (id: string) => {
    const newCart = carrinho.filter(item => item.id !== id);
    saveCart(newCart);
  };

  const alterarQuantidade = (id: string, delta: number) => {
    const newCart = carrinho.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: novaQtd };
      }
      return item;
    });
    saveCart(newCart);
  };

  const calcularTotal = () => {
    return carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0).toFixed(2);
  };

  const handleFinalizarPedido = async () => {
    if (carrinho.length === 0) {
      Alert.alert('Erro', 'Seu carrinho está vazio');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para finalizar o pedido');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Criar o pedido (usando o ID do usuário logado)
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          usuario_id: user.id,
          total: parseFloat(calcularTotal()),
          status: 'pendente',
          pagou: false,
          retirou: false
        })
        .select()
        .single();

      if (pedidoError) {
        console.error('Erro ao criar pedido:', pedidoError);
        throw new Error(`Erro ao criar pedido: ${pedidoError.message}`);
      }

      // 2. Criar os itens do pedido
      const itens = carrinho.map(item => ({
        pedido_id: pedido.id,
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
      }));

      const { error: itensError } = await supabase.from('itens_pedido').insert(itens);
      if (itensError) {
        console.error('Erro ao criar itens do pedido:', itensError);
        throw new Error(`Erro ao criar itens do pedido: ${itensError.message}`);
      }

      // 3. Gerar tickets para combos
      const combosNoPedido = carrinho.filter(item => item.is_combo);
      if (combosNoPedido.length > 0) {
        const ticketsParaGerar = [];
        for (const combo of combosNoPedido) {
          for (let i = 0; i < combo.quantidade; i++) {
            ticketsParaGerar.push({
              usuario_id: user.id,
              pedido_id: pedido.id,
            });
          }
        }
        
        const { error: ticketError } = await supabase.from('tickets').insert(ticketsParaGerar);
        if (ticketError) console.error('Erro ao gerar tickets:', ticketError);
      }

      // 4. Limpar carrinho do usuário
      const cartKey = `carrinho_${user.id}`;
      await AsyncStorage.removeItem(cartKey);
      setCarrinho([]);
      
      Alert.alert('Sucesso', 'Pedido realizado com sucesso! Verifique seus tickets no perfil.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/profile') }
      ]);

    } catch (error: any) {
      console.error('Erro completo no checkout:', error);
      Alert.alert('Erro no Checkout', error.message || 'Erro ao finalizar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        <View style={{ width: 50 }} />
      </View>

      {carrinho.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Seu carrinho está vazio 🥐</Text>
          <TouchableOpacity style={styles.voltarCardapio} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.voltarCardapioText}>Ver Cardápio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={carrinho}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nome}</Text>
                  <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
                  {item.is_combo && <Text style={styles.comboBadge}>🎟️ Ganha Ticket</Text>}
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => alterarQuantidade(item.id, -1)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantidade}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => alterarQuantidade(item.id, 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removerDoCarrinho(item.id)}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>R$ {calcularTotal()}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, loading && styles.disabledBtn]} 
              onPress={handleFinalizarPedido}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutBtnText}>Finalizar Pedido</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#D4A574', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backBtn: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999', marginBottom: 20 },
  voltarCardapio: { backgroundColor: '#D4A574', padding: 15, borderRadius: 8 },
  voltarCardapioText: { color: '#fff', fontWeight: 'bold' },
  listContent: { padding: 15 },
  cartItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemPrice: { fontSize: 14, color: '#D4A574', marginTop: 4 },
  comboBadge: { fontSize: 10, color: '#4CAF50', fontWeight: 'bold', marginTop: 4 },
  itemActions: { alignItems: 'flex-end' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  qtyBtn: { backgroundColor: '#f0f0f0', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#D4A574' },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: 'bold' },
  removeText: { color: '#ff6b6b', fontSize: 12, fontWeight: 'bold' },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#D4A574' },
  checkoutBtn: { backgroundColor: '#D4A574', padding: 18, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { opacity: 0.7 },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
