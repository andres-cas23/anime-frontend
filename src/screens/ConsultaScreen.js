import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, SafeAreaView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPersonajeByNombre, getImagenesByPersonaje, getAnimes } from '../services/api';
import { useAppContext } from '../context/AppContext';
import ImagenesModal from '../components/ImagenesModal';

const COLORS = ['#c026d3', '#7c3aed', '#4f46e5', '#e94560', '#4fc3f7', '#ffd700', '#22c55e', '#f59e0b'];

const ConsultaScreen = () => {
  const [nombreInput, setNombreInput] = useState('');
  const [animeSeleccionado, setAnimeSeleccionado] = useState(null);
  const [personaje, setPersonaje] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [animes, setAnimes] = useState([]);
  const [loadingAnimes, setLoadingAnimes] = useState(true);

  const { actualizarUltimoConsultado, sumarImagenes } = useAppContext();

  useEffect(() => {
    cargarAnimes();
  }, []);

  const cargarAnimes = async () => {
    try {
      const res = await getAnimes();
      setAnimes(res.data);
      if (res.data.length > 0) setAnimeSeleccionado(res.data[0].nombre);
    } catch (e) {
      setError('Error cargando animes');
    } finally {
      setLoadingAnimes(false);
    }
  };

  const animeColor = (index) => COLORS[index % COLORS.length];

  const animeActualIndex = animes.findIndex(a => a.nombre === animeSeleccionado);
  const colorActual = animeActualIndex >= 0 ? animeColor(animeActualIndex) : '#c026d3';

  const handleConsultar = async () => {
    if (!nombreInput.trim()) {
      setError('Por favor ingresa el nombre de un personaje');
      setPersonaje(null);
      return;
    }
    setLoading(true);
    setError('');
    setPersonaje(null);
    setImagenes([]);

    try {
      const { data } = await getPersonajeByNombre(nombreInput.trim(), animeSeleccionado);
      const p = data.data;
      setPersonaje(p);

      const imgRes = await getImagenesByPersonaje(p.id);
      const imgs = imgRes.data.data;
      setImagenes(imgs);

      actualizarUltimoConsultado(animeSeleccionado, { ...p, imagenes: imgs });
      sumarImagenes(imgs.length);

    } catch (e) {
      const msg = e.response?.data?.error || 'Error de conexión con el servidor';
      setError(msg);
      setPersonaje(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0015', '#1a0030', '#0d0025']} style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTag}>⛩️ ANIME WORLD</Text>
            <Text style={styles.headerTitle}>Consulta de{'\n'}Personajes</Text>
            <View style={[styles.headerAccent, { backgroundColor: colorActual }]} />
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>NOMBRE DEL PERSONAJE</Text>
            <View style={[styles.inputRow, { borderColor: colorActual + '50' }]}>
              <Text style={styles.inputIcon}>🔍</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Seiya, Luffy, Gon..."
                placeholderTextColor="#444"
                value={nombreInput}
                onChangeText={setNombreInput}
              />
            </View>
          </View>

          {/* Botón consultar */}
          <TouchableOpacity onPress={handleConsultar} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={['#c026d3', '#7c3aed', '#4f46e5']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.consultarBtn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.consultarText}>✨ BUSCAR PERSONAJE</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Error */}
          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Resultado */}
          {personaje && (
            <View style={styles.resultBox}>
              <LinearGradient
                colors={[colorActual, colorActual + '88']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.resultHeader}
              >
                <Text style={styles.resultAnime}>{personaje.animes?.nombre || animeSeleccionado}</Text>
              </LinearGradient>
              <View style={styles.resultBody}>
                <Text style={styles.resultName}>{personaje.nombre}</Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Edad</Text>
                  <Text style={styles.resultValue}>{personaje.edad} años</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Poder</Text>
                  <Text style={styles.resultValue}>{personaje.poder}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Imágenes */}
          {imagenes.length > 0 && (
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.85}>
                <LinearGradient
                  colors={[colorActual, colorActual + '88']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.verBtn}
                >
                  <Text style={styles.verBtnText}>🖼 VER {imagenes.length} IMÁGENES</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Selector de anime */}
        <View style={styles.animeSelector}>
          {loadingAnimes ? (
            <ActivityIndicator color="#c026d3" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {animes.map((anime, index) => (
                <TouchableOpacity
                  key={anime.id}
                  style={[
                    styles.animeBtn,
                    animeSeleccionado === anime.nombre && {
                      backgroundColor: animeColor(index) + '22',
                      borderColor: animeColor(index),
                    }
                  ]}
                  onPress={() => {
                    setAnimeSeleccionado(anime.nombre);
                    setPersonaje(null);
                    setError('');
                    setImagenes([]);
                  }}
                >
                  <Text style={[
                    styles.animeBtnText,
                    animeSeleccionado === anime.nombre && { color: animeColor(index), fontWeight: 'bold' }
                  ]}>
                    {anime.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <ImagenesModal
          visible={modalVisible}
          personaje={personaje}
          imagenes={imagenes}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 28, paddingTop: 10 },
  headerTag: { color: '#c026d3', fontSize: 11, fontWeight: 'bold', letterSpacing: 3, marginBottom: 6 },
  headerTitle: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', lineHeight: 34 },
  headerAccent: { width: 40, height: 3, borderRadius: 2, marginTop: 10 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff08', borderRadius: 14,
    borderWidth: 1, paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: '#ffffff', paddingVertical: 14, fontSize: 15 },
  consultarBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 },
  consultarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },
  errorBox: {
    backgroundColor: '#1a0a0a', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#e94560', marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  errorIcon: { fontSize: 18 },
  errorText: { color: '#ff6b6b', fontSize: 13, flex: 1 },
  resultBox: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#ffffff15' },
  resultHeader: { paddingHorizontal: 16, paddingVertical: 10 },
  resultAnime: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  resultBody: { backgroundColor: '#ffffff08', padding: 16 },
  resultName: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  resultLabel: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  resultValue: { color: '#ffffff', fontSize: 13, flex: 1, textAlign: 'right' },
  resultDivider: { height: 1, backgroundColor: '#ffffff10' },
  imageSection: { marginBottom: 16 },
  verBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  verBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  animeSelector: {
    backgroundColor: '#0a0015', paddingVertical: 12, paddingHorizontal: 8,
    borderTopWidth: 1, borderTopColor: '#ffffff10',
  },
  animeBtn: {
    paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center',
    borderRadius: 10, borderWidth: 1, borderColor: '#ffffff10', marginRight: 8,
  },
  animeBtnText: { color: '#555', fontSize: 11, textAlign: 'center' },
});

export default ConsultaScreen;