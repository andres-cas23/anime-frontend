import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import { crearAnime, crearPersonaje } from '../services/api';
import { subirImagen } from '../services/supabase';

export default function CrearAnimeScreen() {
  const { usuario } = useContext(AppContext);

  const [nombreAnime, setNombreAnime] = useState('');
  const [descAnime, setDescAnime] = useState('');
  const [loadingAnime, setLoadingAnime] = useState(false);
  const [animeCreado, setAnimeCreado] = useState(null);

  const [nombrePj, setNombrePj] = useState('');
  const [edadPj, setEdadPj] = useState('');
  const [poderPj, setPoderPj] = useState('');
  const [imagenes, setImagenes] = useState([null, null, null, null]);
  const [loadingPj, setLoadingPj] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const [paso, setPaso] = useState(1);

  const handleCrearAnime = async () => {
    if (!nombreAnime) {
      Alert.alert('⚠️', 'El nombre del anime es requerido');
      return;
    }
    setLoadingAnime(true);
    try {
      const res = await crearAnime(nombreAnime, descAnime);
      setAnimeCreado(res.data);
      setPaso(2);
      Alert.alert('✅ Anime creado', `"${res.data.nombre}" agregado exitosamente`);
    } catch (err) {
      Alert.alert('❌ Error', err.response?.data?.error || 'Error al crear anime');
    } finally {
      setLoadingAnime(false);
    }
  };

  const seleccionarImagen = async (index) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('⚠️', 'Necesitamos permiso para acceder a tus fotos');
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
        const nuevas = [...imagenes];
        nuevas[index] = { uri, url };
        setImagenes(nuevas);
      } catch (err) {
        Alert.alert('❌ Error', 'No se pudo subir la imagen');
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  const handleCrearPersonaje = async () => {
    if (!nombrePj || !animeCreado) {
      Alert.alert('⚠️', 'Completa los campos requeridos');
      return;
    }
    const imagenesUrls = imagenes.map(img => img?.url).filter(Boolean);
    if (imagenesUrls.length < 4) {
      Alert.alert('⚠️', 'Sube las 4 imágenes del personaje');
      return;
    }
    setLoadingPj(true);
    try {
      await crearPersonaje(nombrePj, parseInt(edadPj), poderPj, animeCreado.id, imagenesUrls);
      Alert.alert('✅ Personaje creado', `"${nombrePj}" agregado a "${animeCreado.nombre}"`);
      setNombrePj('');
      setEdadPj('');
      setPoderPj('');
      setImagenes([null, null, null, null]);
    } catch (err) {
      Alert.alert('❌ Error', err.response?.data?.error || 'Error al crear personaje');
    } finally {
      setLoadingPj(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0015', '#1a0030', '#0d0025']} style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🎌</Text>
            <Text style={styles.headerTitle}>Crear Contenido</Text>
            <Text style={styles.headerSub}>Hola, {usuario?.usuario} 👋</Text>
          </View>

          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <LinearGradient
                colors={paso >= 1 ? ['#c026d3', '#7c3aed'] : ['#333', '#333']}
                style={styles.stepCircle}
              >
                <Text style={styles.stepNum}>1</Text>
              </LinearGradient>
              <Text style={[styles.stepLabel, paso >= 1 && styles.stepLabelActive]}>Anime</Text>
            </View>
            <View style={[styles.stepLine, paso >= 2 && styles.stepLineActive]} />
            <View style={styles.step}>
              <LinearGradient
                colors={paso >= 2 ? ['#7c3aed', '#4f46e5'] : ['#333', '#333']}
                style={styles.stepCircle}
              >
                <Text style={styles.stepNum}>2</Text>
              </LinearGradient>
              <Text style={[styles.stepLabel, paso >= 2 && styles.stepLabelActive]}>Personaje</Text>
            </View>
          </View>

          {paso === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎬 Nuevo Anime</Text>

              <Text style={styles.label}>Nombre del anime *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Dragon Ball Z"
                  placeholderTextColor="#555"
                  value={nombreAnime}
                  onChangeText={setNombreAnime}
                />
              </View>

              <Text style={styles.label}>Descripción</Text>
              <View style={[styles.inputContainer, { height: 90 }]}>
                <TextInput
                  style={[styles.input, { textAlignVertical: 'top' }]}
                  placeholder="Describe el anime..."
                  placeholderTextColor="#555"
                  value={descAnime}
                  onChangeText={setDescAnime}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity onPress={handleCrearAnime} disabled={loadingAnime} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#c026d3', '#7c3aed', '#4f46e5']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.btn}
                >
                  {loadingAnime
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>✨ Crear Anime</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {paso === 2 && (
            <View style={styles.card}>
              <View style={styles.animeTag}>
                <Text style={styles.animeTagText}>🎌 {animeCreado?.nombre}</Text>
              </View>

              <Text style={styles.cardTitle}>👤 Nuevo Personaje</Text>

              <Text style={styles.label}>Nombre *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Goku"
                  placeholderTextColor="#555"
                  value={nombrePj}
                  onChangeText={setNombrePj}
                />
              </View>

              <Text style={styles.label}>Edad</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 25"
                  placeholderTextColor="#555"
                  value={edadPj}
                  onChangeText={setEdadPj}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Poder especial</Text>
              <View style={[styles.inputContainer, { height: 80 }]}>
                <TextInput
                  style={[styles.input, { textAlignVertical: 'top' }]}
                  placeholder="Describe su poder..."
                  placeholderTextColor="#555"
                  value={poderPj}
                  onChangeText={setPoderPj}
                  multiline
                />
              </View>

              <Text style={styles.label}>🖼️ Imágenes del personaje (4 requeridas)</Text>
              <View style={styles.imageGrid}>
                {imagenes.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.imageSlot}
                    onPress={() => seleccionarImagen(index)}
                    disabled={uploadingIndex === index}
                  >
                    {uploadingIndex === index ? (
                      <ActivityIndicator color="#7c3aed" />
                    ) : img ? (
                      <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderIcon}>📷</Text>
                        <Text style={styles.imagePlaceholderText}>Foto {index + 1}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={handleCrearPersonaje} disabled={loadingPj} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#7c3aed', '#4f46e5']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.btn}
                >
                  {loadingPj
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>🚀 Crear Personaje</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setPaso(1)} style={styles.btnSecundario}>
                <Text style={styles.btnSecundarioText}>← Crear otro anime</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
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
  stepsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  step: { alignItems: 'center' },
  stepCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  stepLabel: { color: '#555', fontSize: 11, marginTop: 4, fontWeight: '600' },
  stepLabelActive: { color: '#c026d3' },
  stepLine: { width: 60, height: 2, backgroundColor: '#333', marginHorizontal: 8, marginBottom: 16 },
  stepLineActive: { backgroundColor: '#7c3aed' },
  card: {
    backgroundColor: '#ffffff08', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#ffffff10',
  },
  animeTag: {
    backgroundColor: '#7c3aed30', borderRadius: 10, padding: 8,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  animeTagText: { color: '#c026d3', fontWeight: 'bold', fontSize: 13 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 16 },
  label: { color: '#9ca3af', fontSize: 13, marginBottom: 6, marginTop: 8, fontWeight: '600' },
  inputContainer: {
    backgroundColor: '#00000050', borderRadius: 12,
    borderWidth: 1, borderColor: '#ffffff10',
    marginBottom: 10, paddingHorizontal: 14,
  },
  input: { color: '#fff', fontSize: 14, paddingVertical: 12 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16, marginTop: 8 },
  imageSlot: {
    width: '47%', height: 120, borderRadius: 10,
    backgroundColor: '#ffffff08', borderWidth: 1,
    borderColor: '#ffffff15', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderIcon: { fontSize: 28 },
  imagePlaceholderText: { color: '#555', fontSize: 12, marginTop: 4 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  btnSecundario: { alignItems: 'center', marginTop: 12, padding: 10 },
  btnSecundarioText: { color: '#7c3aed', fontSize: 14, fontWeight: '600' },
});