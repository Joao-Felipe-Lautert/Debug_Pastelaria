import { supabase } from '@/lib/supabase';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('tickets').select('*').eq('usuario_id', user?.id);
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/images/icon.png')} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>
        <TouchableOpacity onPress={() => signOut()}><Text style={styles.logoutBtn}>Sair</Text></TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.userCard}>
          <Text style={styles.userName}>{user?.nome_completo || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        {tickets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎟️ Meus Tickets</Text>
            {tickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <Image source={require('../../assets/images/icon.png')} style={styles.ticketImage} />
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketLabel}>DEBUG PASTELARIA</Text>
                  <Text style={styles.ticketTitle}>SORTEIO DE FONE!</Text>
                  <Text style={styles.ticketNumber}>Nº {String(ticket.numero_ticket).padStart(4, '0')}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#D4A574', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoutBtn: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1 },
  userCard: { backgroundColor: '#fff', padding: 20, margin: 15, borderRadius: 12, elevation: 3 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666' },
  section: { paddingHorizontal: 15, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  ticketCard: { backgroundColor: '#FFF8E1', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#FFE082', marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  ticketImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth: 2, borderColor: '#D4A574' },
  ticketInfo: { flex: 1 },
  ticketLabel: { fontSize: 10, color: '#D4A574', fontWeight: 'bold' },
  ticketTitle: { fontSize: 14, fontWeight: 'bold' },
  ticketNumber: { fontSize: 18, fontWeight: 'bold', color: '#D4A574' },
});
