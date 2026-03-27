import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseConfig';

interface ItemPedido {
  id: string;
  quantidade: number;
  preco_unitario: number;
  produtos: {
    nome: string;
  };
}

interface Pedido {
  id: string;
  total: number;
  status: string;
  created_at: string;
  pagou: boolean;
  retirou: boolean;
  usuarios: {
    nome_completo: string;
    turma: string;
  };
  itens_pedido: ItemPedido[];
}

export default function AdminScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  const fetchAllPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          usuarios (nome_completo, turma),
          itens_pedido (
            id,
            quantidade,
            preco_unitario,
            produtos (nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPedidos();
  }, [fetchAllPedidos]);

  const toggleStatus = async (pedidoId: string, field: 'pagou' | 'retirou', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ [field]: !currentValue })
        .eq('id', pedidoId);

      if (error) throw error;
      
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, [field]: !currentValue } : p
      ));
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error.message);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const updatePedidoStatus = async (pedidoId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', pedidoId);

      if (error) throw error;
      
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, status: newStatus } : p
      ));
    } catch (error: any) {
      console.error('Erro ao atualizar status do pedido:', error.message);
      Alert.alert('Erro', 'Não foi possível atualizar o status do pedido.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // O RootLayout cuida do redirecionamento para /login automaticamente
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao sair');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PAINEL ADM 🛠️</Text>
          <Text style={styles.headerSubtitle}>Gerenciamento de Pedidos</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total: {pedidos.length} pedidos</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAllPedidos}>
          <Text style={styles.refreshBtnText}>🔄 Atualizar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4A574" />
          <Text style={styles.loadingText}>Carregando pedidos...</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.pedidoCard}>
              <View style={styles.pedidoHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.usuarios?.nome_completo || 'Usuário'}</Text>
                  <Text style={styles.userTurma}>Turma: {item.usuarios?.turma || 'N/A'}</Text>
                </View>
                <Text style={styles.pedidoTotal}>R$ {item.total.toFixed(2)}</Text>
              </View>

              <View style={styles.itensList}>
                {item.itens_pedido.map(ip => (
                  <Text key={ip.id} style={styles.itemText}>
                    • {ip.quantidade}x {ip.produtos?.nome}
                  </Text>
                ))}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, item.pagou && styles.btnPagou]} 
                  onPress={() => toggleStatus(item.id, 'pagou', item.pagou)}
                >
                  <Text style={[styles.actionBtnText, item.pagou && styles.textWhite]}>
                    {item.pagou ? '✅ PAGO' : '💰 MARCAR PAGO'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, item.retirou && styles.btnRetirou]} 
                  onPress={() => toggleStatus(item.id, 'retirou', item.retirou)}
                >
                  <Text style={[styles.actionBtnText, item.retirou && styles.textWhite]}>
                    {item.retirou ? '✅ RETIRADO' : '📦 MARCAR RETIRADO'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status do Pedido:</Text>
                <View style={styles.statusButtons}>
                  {['pendente', 'pago', 'retirado'].map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.statusBtn, item.status === s && styles.statusBtnActive]}
                      onPress={() => updatePedidoStatus(item.id, s)}
                    >
                      <Text style={[styles.statusBtnText, item.status === s && styles.textWhite]}>
                        {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { backgroundColor: '#333', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#bbb' },
  logoutBtn: { backgroundColor: '#ff6b6b', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold' },
  statsBar: { backgroundColor: '#fff', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  statsText: { fontWeight: 'bold', color: '#555' },
  refreshBtn: { padding: 5 },
  refreshBtnText: { color: '#D4A574', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  listContent: { padding: 15 },
  pedidoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userTurma: { fontSize: 12, color: '#888', marginTop: 2 },
  pedidoTotal: { fontSize: 18, fontWeight: 'bold', color: '#D4A574' },
  itensList: { marginVertical: 12 },
  itemText: { fontSize: 14, color: '#444', marginBottom: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#D4A574', alignItems: 'center', marginHorizontal: 4 },
  btnPagou: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  btnRetirou: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  actionBtnText: { fontSize: 11, fontWeight: 'bold', color: '#D4A574' },
  textWhite: { color: '#fff' },
  statusRow: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  statusLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', marginBottom: 10 },
  statusButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  statusBtn: { flex: 1, padding: 8, borderRadius: 4, backgroundColor: '#eee', alignItems: 'center', marginHorizontal: 2 },
  statusBtnActive: { backgroundColor: '#D4A574' },
  statusBtnText: { fontSize: 10, fontWeight: 'bold', color: '#888' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
});
