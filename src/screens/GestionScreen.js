import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, TextInput, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { getAnimes, getPersonajesByAnime, eliminarAnime, eliminarPersonaje, crearPersonaje } from '../services/api';
import { subirImagen } from '../services/supabase';

const COLORS = ['#c026d3', '#7c3aed', '#4f46e5', '#e94560', '#4fc3f7', '#ffd700', '#22c55e', '#f59e0b'];

export default function GestionScreen() {
  const [animes, setAnimes] = useState([]);
  const [loadingAnimes, setLoadingAnimes] = useState(true);
  const [animeExpandido, setAnimeExpandido] = useState(null);
  const [personajes, setPersonajes] = useState({});
  const [loadingPersonajes, setLoadingPersonajes] = useState(false);

  // Formulario nuevo personaje
  const [agregarPjAnimeId, setAgregarPjAnimeId] = useState(null);
  const [nombrePj, setNombrePj] = useState('');
  const [edadPj, setEdadPj] = useState('');
  const [poderPj, setPoderPj] = useState('');
  const [imagenesPj, setImagenesPj] = useState([null, null, null, null]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [loadingCrearPj, setLoadingCrearPj] = useState(false);

  useEffect(() => {
    cargarAnimes();
  }, []);

  const cargarAnimes = async () => {
    setLoadingAnimes(true);
    try {
      const res = await getAnimes();
      setAnimes(res.data);
    } catch (e) {
      window.alert('No se pudieron cargar los animes');
    } finally {
      setLoadingAnimes(false);
    }
  };

  const toggleAnime = async (anime) => {
    if (animeExpandido?.id === anime.id) {
      setAnimeExpandido(null);
      setAgregarPjAnimeId(null);
      return;
    }
    setAnimeExpandido(anime);
    setAgregarPjAnimeId(null);
    if (!personajes[anime.id]) {
      setLoadingPersonajes(true);
      try {
        const res = await getPersonajesByAnime(anime.nombre);
        setPersonajes(prev => ({ ...prev, [anime.id]: res.data.data }));
      } catch (e) {
        setPersonajes(prev => ({ ...prev, [anime.id]: [] }));
      } finally {
        setLoadingPersonajes(false);
      }
    }
  };

  const handleEliminarAnime = async (anime) => {
    const confirmado = window.confirm(`¿Eliminar "${anime.nombre}" y todos sus personajes?`);
    if (!confirmado) return;
    try {
      await eliminarAnime(anime.id);
      setAnimes(prev => prev.filter(a => a.id !== anime.id));
      if (animeExpandido?.id === anime.id) setAnimeExpandido(null);
    } catch (e) {
      window.alert('Error al eliminar: ' + (e.response?.data?.error || 'Error desconocido'));
    }
  };

  const handleEliminarPersonaje = async (personaje, animeId) => {
    const confirmado = window.confirm(`¿Eliminar a "${personaje.nombre}"?`);
    if (!confirmado) return;
    try {
      await eliminarPersonaje(personaje.id);
      setPersonajes(prev => ({
        ...prev,
        [animeId]: prev[animeId].filter(p => p.id !== personaje.id)
      }));
    } catch (e) {
      window.alert('Error al eliminar: ' + (e.response?.data?.error || 'Error desconocido'));
    }
  };

  const seleccionarImagen = async (index) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      window.alert('Necesitamos permiso para acceder a tus fotos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setUploadingIndex(index);
      try {
        const uri = result.assets[0].uri;
        const nombreArchivo = `${Date.now()}_${index}.jpg`;
        const url = await subirImagen(uri, nombreArchivo);
        const nuevas = [...imagenesPj];
        nuevas[index] = { uri, url };
        setImagenesPj(nuevas);
      } catch (e) {
        window.alert('No se pudo subir la imagen');
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  const resetFormPj = () => {
    setNombrePj('');
    setEdadPj('');
    setPoderPj('');
    setImagenesPj([null, null, null, null]);
    setAgregarPjAnimeId(null);
  };

  const handleCrearPersonaje = async (animeId) => {
    if (!nombrePj) {
      window.alert('El nombre es requerido');
      return;
    }
    const imagenesUrls = imagenesPj.map(img => img?.url).filter(Boolean);
    if (imagenesUrls.length < 4) {
      window.alert('Sube las 4 imágenes del personaje');
      return;
    }
    setLoadingCrearPj(true);
    try {
      const res = await crearPersonaje(nombrePj, parseInt(edadPj), poderPj, animeId, imagenesUrls);
      setPersonajes(prev => ({
        ...prev,
        [animeId]: [...(prev[animeId] || []), res.data.data]
      }));
      resetFormPj();
      window.alert(`✅ Personaje "${nombrePj}" creado`);
    } catch (e) {
      window.alert('Error al crear: ' + (e.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoadingCrearPj(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0015', '#1a0030', '#0d0025']} style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚙️</Text>
          <Text style={styles.headerTitle}>Gestión</Text>
          <Text style={styles.headerSub}>Administra tus animes y personajes</Text>
        </View>

        {loadingAnimes ? (
          <ActivityIndicator color="#c026d3" size="large" style={{ marginTop: 40 }} />
        ) : (
          animes.map((anime, index) => (
            <View key={anime.id} style={styles.animeCard}>
              <TouchableOpacity
                style={styles.animeHeader}
                onPress={() => toggleAnime(anime)}
                activeOpacity={0.8}
              >
                <View style={[styles.colorDot, { backgroundColor: COLORS[index % COLORS.length] }]} />
                <Text style={styles.animeNombre}>{anime.nombre}</Text>
                <View style={styles.animeActions}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={(e) => { e.stopPropagation(); handleEliminarAnime(anime); }}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                  <Text style={styles.expandIcon}>{animeExpandido?.id === anime.id ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {animeExpandido?.id === anime.id && (
                <View style={styles.personajesContainer}>
                  {loadingPersonajes ? (
                    <ActivityIndicator color="#7c3aed" style={{ padding: 16 }} />
                  ) : (
                    <>
                      {personajes[anime.id]?.length === 0 && (
                        <Text style={styles.emptyText}>Sin personajes aún</Text>
                      )}
                      {personajes[anime.id]?.map(pj => (
                        <View key={pj.id} style={styles.personajeRow}>
                          <View style={styles.personajeInfo}>
                            <Text style={styles.personajeNombre}>{pj.nombre}</Text>
                            <Text style={styles.personajeEdad}>{pj.edad} años</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deletePersonajeBtn}
                            onPress={() => handleEliminarPersonaje(pj, anime.id)}
                          >
                            <Text style={styles.deleteBtnText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      ))}

                      {/* Botón agregar personaje */}
                      {agregarPjAnimeId !== anime.id ? (
                        <TouchableOpacity
                          style={styles.agregarPjBtn}
                          onPress={() => setAgregarPjAnimeId(anime.id)}
                        >
                          <Text style={styles.agregarPjBtnText}>➕ Agregar personaje</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.formPj}>
                          <Text style={styles.formTitle}>👤 Nuevo Personaje</Text>

                          <TextInput
                            style={styles.formInput}
                            placeholder="Nombre *"
                            placeholderTextColor="#555"
                            value={nombrePj}
                            onChangeText={setNombrePj}
                          />
                          <TextInput
                            style={styles.formInput}
                            placeholder="Edad"
                            placeholderTextColor="#555"
                            value={edadPj}
                            onChangeText={setEdadPj}
                            keyboardType="numeric"
                          />
                          <TextInput
                            style={styles.formInput}
                            placeholder="Poder especial"
                            placeholderTextColor="#555"
                            value={poderPj}
                            onChangeText={setPoderPj}
                          />

                          <Text style={styles.formLabel}>🖼️ Imágenes (4 requeridas)</Text>
                          <View style={styles.imageGrid}>
                            {imagenesPj.map((img, idx) => (
                              <TouchableOpacity
                                key={idx}
                                style={styles.imageSlot}
                                onPress={() => seleccionarImagen(idx)}
                                disabled={uploadingIndex === idx}
                              >
                                {uploadingIndex === idx ? (
                                  <ActivityIndicator color="#7c3aed" />
                                ) : img ? (
                                  <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                                ) : (
                                  <View style={styles.imagePlaceholder}>
                                    <Text style={styles.imagePlaceholderIcon}>📷</Text>
                                    <Text style={styles.imagePlaceholderText}>{idx + 1}</Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>

                          <TouchableOpacity
                            onPress={() => handleCrearPersonaje(anime.id)}
                            disabled={loadingCrearPj}
                            activeOpacity={0.85}
                          >
                            <LinearGradient
                              colors={['#7c3aed', '#4f46e5']}
                              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                              style={styles.formBtn}
                            >
                              {loadingCrearPj
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.formBtnText}>🚀 Crear Personaje</Text>
                              }
                            </LinearGradient>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={resetFormPj} style={styles.cancelBtn}>
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  circle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#7c3aed15', top: -80, right: -80,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#c026d315', bottom: 100, left: -60,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  headerEmoji: { fontSize: 44, marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  headerSub: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  animeCard: {
    backgroundColor: '#ffffff08', borderRadius: 16,
    borderWidth: 1, borderColor: '#ffffff10', marginBottom: 12, overflow: 'hidden',
  },
  animeHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  animeNombre: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15 },
  animeActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  expandIcon: { color: '#9ca3af', fontSize: 12 },
  personajesContainer: {
    borderTopWidth: 1, borderTopColor: '#ffffff10', paddingHorizontal: 16,
  },
  emptyText: { color: '#555', fontSize: 13, padding: 12, textAlign: 'center' },
  personajeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08',
  },
  personajeInfo: { flex: 1 },
  personajeNombre: { color: '#e2e8f0', fontWeight: '600', fontSize: 14 },
  personajeEdad: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  deletePersonajeBtn: { padding: 4 },
  agregarPjBtn: {
    margin: 12, padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#7c3aed', alignItems: 'center',
    borderStyle: 'dashed',
  },
  agregarPjBtnText: { color: '#7c3aed', fontWeight: '600', fontSize: 13 },
  formPj: { padding: 12 },
  formTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 12 },
  formInput: {
    backgroundColor: '#00000050', borderRadius: 10,
    borderWidth: 1, borderColor: '#ffffff10',
    color: '#fff', paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 10, fontSize: 14,
  },
  formLabel: { color: '#9ca3af', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  imageSlot: {
    width: '47%', height: 120, borderRadius: 10,
    backgroundColor: '#ffffff08', borderWidth: 1,
    borderColor: '#ffffff15', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderIcon: { fontSize: 22 },
  imagePlaceholderText: { color: '#555', fontSize: 11, marginTop: 2 },
  formBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  formBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  cancelBtn: { alignItems: 'center', padding: 8 },
  cancelBtnText: { color: '#555', fontSize: 13 },
});