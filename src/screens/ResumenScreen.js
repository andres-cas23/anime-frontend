import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import ImagenesModal from '../components/ImagenesModal';
import { getAnimes } from '../services/api';

const COLORS = ['#c026d3', '#7c3aed', '#4f46e5', '#e94560', '#4fc3f7', '#ffd700', '#22c55e', '#f59e0b'];
const EMOJIS = ['⚔️', '🎯', '🏴‍☠️', '🌀', '🔥', '⚡', '🌊', '💫'];

const ResumenScreen = () => {
  const { ultimosConsultados, totalImagenes } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAnimes();
  }, []);

  const cargarAnimes = async () => {
    try {
      const res = await getAnimes();
      setAnimes(res.data);
    } catch (e) {
      console.log('Error cargando animes');
    } finally {
      setLoading(false);
    }
  };

  const todasLasImagenes = animes
    .filter(a => ultimosConsultados[a.nombre])
    .flatMap(a => ultimosConsultados[a.nombre]?.imagenes || []);

  const consultados = animes.filter(a => ultimosConsultados[a.nombre]);
  const noConsultados = animes.filter(a => !ultimosConsultados[a.nombre]);

  return (
    <LinearGradient colors={['#0a0015', '#1a0030', '#0d0025']} style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
        <ScrollView style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTag}>📋 RESUMEN</Text>
            <Text style={styles.headerTitle}>Últimos{'\n'}Consultados</Text>
            <View style={styles.headerAccent} />
          </View>

          {/* Total imágenes */}
          <View style={styles.totalBox}>
            <View style={styles.totalLeft}>
              <Text style={styles.totalLabel}>TOTAL IMÁGENES</Text>
              <Text style={styles.totalSub}>Acumuladas en sesión</Text>
            </View>
            <Text style={styles.totalNum}>{totalImagenes}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#c026d3" size="large" style={{ marginTop: 40 }} />
          ) : (
            <>
              {consultados.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>Sin consultas aún</Text>
                  <Text style={styles.emptyText}>
                    Ve a la pantalla de consulta y busca personajes de cada anime
                  </Text>
                </View>
              ) : (
                <>
                  {consultados.map((anime, index) => {
                    const p = ultimosConsultados[anime.nombre];
                    const color = COLORS[index % COLORS.length];
                    const emoji = EMOJIS[index % EMOJIS.length];
                    return (
                      <View key={anime.id} style={styles.card}>
                        <View style={[styles.cardAccent, { backgroundColor: color }]} />
                        <View style={styles.cardContent}>
                          <View style={styles.cardHeader}>
                            <Text style={styles.cardEmoji}>{emoji}</Text>
                            <Text style={[styles.cardAnime, { color }]}>
                              {anime.nombre.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.cardName}>{p.nombre}</Text>
                          <View style={styles.cardDivider} />
                          <View style={styles.cardRow}>
                            <Text style={styles.cardLabel}>Edad</Text>
                            <Text style={styles.cardValue}>{p.edad} años</Text>
                          </View>
                          <View style={styles.cardRow}>
                            <Text style={styles.cardLabel}>Poder</Text>
                            <Text style={styles.cardValue} numberOfLines={2}>{p.poder}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.verTodasBtn}
                    onPress={() => setModalVisible(true)}
                  >
                    <LinearGradient
                      colors={['#c026d3', '#7c3aed', '#4f46e5']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.verTodasGradient}
                    >
                      <Text style={styles.verTodasText}>🖼 VER TODAS LAS IMÁGENES</Text>
                      <Text style={styles.verTodasSub}>{todasLasImagenes.length} imágenes en total</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {noConsultados.length > 0 && (
                <View style={styles.pendingSection}>
                  <Text style={styles.pendingTitle}>PENDIENTES</Text>
                  {noConsultados.map((anime, index) => {
                    const color = COLORS[index % COLORS.length];
                    const emoji = EMOJIS[index % EMOJIS.length];
                    return (
                      <View key={anime.id} style={styles.pendingCard}>
                        <Text style={styles.pendingEmoji}>{emoji}</Text>
                        <Text style={styles.pendingText}>
                          Aún no se consultó ningún personaje de{' '}
                          <Text style={{ color }}>{anime.nombre}</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>

        <ImagenesModal
          visible={modalVisible}
          personaje={{ nombre: 'Todos los personajes' }}
          imagenes={todasLasImagenes}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, paddingTop: 10 },
  headerTag: { color: '#c026d3', fontSize: 11, fontWeight: 'bold', letterSpacing: 3, marginBottom: 6 },
  headerTitle: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', lineHeight: 34 },
  headerAccent: { width: 40, height: 3, borderRadius: 2, marginTop: 10, backgroundColor: '#c026d3' },
  totalBox: {
    backgroundColor: '#ffffff08', borderRadius: 16, padding: 20,
    marginBottom: 24, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#ffffff15',
  },
  totalLeft: { flex: 1 },
  totalLabel: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  totalSub: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  totalNum: { color: '#c026d3', fontSize: 48, fontWeight: 'bold' },
  emptyBox: {
    alignItems: 'center', padding: 40,
    backgroundColor: '#ffffff08', borderRadius: 16,
    borderWidth: 1, borderColor: '#ffffff15', marginBottom: 16,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  card: {
    borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    backgroundColor: '#ffffff08', borderWidth: 1, borderColor: '#ffffff15',
    flexDirection: 'row',
  },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardEmoji: { fontSize: 16 },
  cardAnime: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  cardName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  cardDivider: { height: 1, backgroundColor: '#ffffff15', marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'flex-start' },
  cardLabel: { color: '#9ca3af', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  cardValue: { color: '#e2e8f0', fontSize: 12, flex: 1, textAlign: 'right' },
  verTodasBtn: { borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  verTodasGradient: { padding: 20, alignItems: 'center' },
  verTodasText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, letterSpacing: 1, marginBottom: 4 },
  verTodasSub: { color: '#ffffff90', fontSize: 12 },
  pendingSection: { marginTop: 8 },
  pendingTitle: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 },
  pendingCard: {
    backgroundColor: '#ffffff08', borderRadius: 12, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#ffffff10',
  },
  pendingEmoji: { fontSize: 20 },
  pendingText: { color: '#9ca3af', fontSize: 12, flex: 1 },
});

export default ResumenScreen;