import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseConfig';
import { useRouter } from 'expo-router';

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
  itens_pedido: ItemPedido[];
}

interface Ticket {
  id: string;
  numero_ticket: number;
  pedido_id: string;
  created_at: string;
}

export default function ProfileScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Buscar pedidos com itens e nomes dos produtos
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens_pedido (
            id,
            quantidade,
            preco_unitario,
            produtos (nome)
          )
        `)
        .eq('usuario_id', user?.id)
        .order('created_at', { ascending: false });

      if (pedidosError) throw pedidosError;
      setPedidos(pedidosData || []);

      // Buscar tickets do usuário
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await signOut();
      // O RootLayout cuidará do redirecionamento
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error.message);
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return '#FFA500';
      case 'pago': return '#4CAF50';
      case 'retirado': return '#2196F3';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userCard}>
          <Text style={styles.userName}>{user?.nome_completo || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.turma && <Text style={styles.userTurma}>Turma: {user.turma}</Text>}
          {user?.adm && <Text style={styles.admBadge}>ADMINISTRADOR</Text>}
        </View>

        {/* Seção de Tickets */}
        {tickets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎟️ Meus Tickets de Sorteio</Text>
            <View style={styles.ticketsContainer}>
              {tickets.map((ticket) => (
                <View key={ticket.id} style={styles.ticketCard}>
                  <Text style={styles.ticketLabel}>DEBUG PASTELARIA</Text>
                  <Text style={styles.ticketTitle}>SORTEIO DE FONE DE OUVIDO!</Text>
                  <Text style={styles.ticketLuck}>BOA SORTE!</Text>
                  <Text style={styles.ticketNumber}>Nº {String(ticket.numero_ticket).padStart(4, '0')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Meus Pedidos</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#D4A574" style={{ marginVertical: 20 }} />
          ) : pedidos.length === 0 ? (
            <Text style={styles.infoText}>Nenhum pedido realizado ainda</Text>
          ) : (
            pedidos.map((pedido) => (
              <View key={pedido.id} style={styles.pedidoCard}>
                <View style={styles.pedidoHeader}>
                  <Text style={styles.pedidoId}>Pedido #{pedido.id.slice(0, 8)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.status) }]}>
                    <Text style={styles.statusText}>{pedido.status.toUpperCase()}</Text>
                  </View>
                </View>
                
                {/* Listagem de itens do pedido */}
                <View style={styles.itensContainer}>
                  {pedido.itens_pedido.map((item) => (
                    <Text key={item.id} style={styles.itemText}>
                      • {item.quantidade}x {item.produtos?.nome || 'Produto'} (R$ {(item.preco_unitario * item.quantidade).toFixed(2)})
                    </Text>
                  ))}
                </View>

                <View style={styles.pedidoFooter}>
                  <Text style={styles.pedidoTotal}>Total: R$ {pedido.total.toFixed(2)}</Text>
                  <Text style={styles.pedidoData}>
                    {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                
                <View style={styles.checkContainer}>
                  <Text style={[styles.checkText, pedido.pagou && styles.checkActive]}>
                    {pedido.pagou ? '✅ Pago' : '❌ Não Pago'}
                  </Text>
                  <Text style={[styles.checkText, pedido.retirou && styles.checkActive]}>
                    {pedido.retirou ? '✅ Retirado' : '❌ Não Retirado'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#D4A574', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  logoutBtn: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  content: { flex: 1 },
  userCard: { backgroundColor: '#fff', padding: 20, margin: 15, borderRadius: 8, elevation: 3 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666' },
  userTurma: { fontSize: 14, color: '#D4A574', fontWeight: '600', marginTop: 5 },
  admBadge: { backgroundColor: '#ff6b6b', color: '#fff', padding: 4, borderRadius: 4, fontSize: 10, fontWeight: 'bold', alignSelf: 'flex-start', marginTop: 8 },
  section: { paddingHorizontal: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  infoText: { textAlign: 'center', color: '#999', marginVertical: 20 },
  pedidoCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#D4A574' },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pedidoId: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  itensContainer: { marginVertical: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  itemText: { fontSize: 13, color: '#555', marginBottom: 2 },
  pedidoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  pedidoTotal: { fontSize: 16, fontWeight: 'bold', color: '#D4A574' },
  pedidoData: { fontSize: 12, color: '#999' },
  checkContainer: { flexDirection: 'row', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  checkText: { fontSize: 12, color: '#999', marginRight: 15 },
  checkActive: { color: '#4CAF50', fontWeight: 'bold' },
  ticketsContainer: { flexDirection: 'column' },
  ticketCard: { backgroundColor: '#FFF8E1', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#FFE082', marginBottom: 10, alignItems: 'center' },
  ticketLabel: { fontSize: 10, color: '#D4A574', fontWeight: 'bold' },
  ticketTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginVertical: 5 },
  ticketLuck: { fontSize: 12, color: '#D4A574', fontWeight: 'bold' },
  ticketNumber: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 5 },
});
