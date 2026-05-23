import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Animated, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import { login, registro, setAuthToken } from '../services/api';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { setUsuario } = useContext(AppContext);
  const [usuario, setUsuarioInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState('login');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleAuth = async () => {
    if (!usuario || !password) {
      Alert.alert('⚠️ Campos vacíos', 'Por favor ingresa usuario y contraseña');
      return;
    }
    setLoading(true);
    try {
      if (modo === 'login') {
        const res = await login(usuario, password);
        setAuthToken(res.data.token);
        setUsuario({ usuario: res.data.usuario, token: res.data.token });
      } else {
        await registro(usuario, password);
        Alert.alert('✅ Registro exitoso', '¡Cuenta creada! Ya puedes iniciar sesión');
        setModo('login');
      }
    } catch (err) {
      Alert.alert('❌ Error', err.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0015', '#1a0030', '#0d0025']} style={styles.container}>
      {/* Círculos decorativos */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.emoji}>⛩️</Text>
          <Text style={styles.title}>ANIME WORLD</Text>
          <Text style={styles.subtitle}>Tu universo anime en un solo lugar</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, modo === 'login' && styles.tabActive]}
              onPress={() => setModo('login')}
            >
              <Text style={[styles.tabText, modo === 'login' && styles.tabTextActive]}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, modo === 'registro' && styles.tabActive]}
              onPress={() => setModo('registro')}
            >
              <Text style={[styles.tabText, modo === 'registro' && styles.tabTextActive]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={[styles.inputContainer, focusedInput === 'usuario' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor="#555"
              value={usuario}
              onChangeText={setUsuarioInput}
              autoCapitalize="none"
              onFocus={() => setFocusedInput('usuario')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Botón */}
          <TouchableOpacity onPress={handleAuth} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={['#c026d3', '#7c3aed', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{modo === 'login' ? '✨ Entrar' : '🚀 Crear cuenta'}</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>🎌 Powered by Anime World</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  circle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#7c3aed22', top: -80, right: -80,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#c026d322', bottom: 100, left: -60,
  },
  circle3: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#4f46e522', top: '40%', right: -40,
  },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: {
    fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 6,
    textShadowColor: '#c026d3', textShadowRadius: 20,
  },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 6, letterSpacing: 1 },
  card: {
    backgroundColor: '#ffffff08',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#ffffff15',
  },
  tabs: { flexDirection: 'row', backgroundColor: '#00000040', borderRadius: 12, marginBottom: 24, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#7c3aed' },
  tabText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#00000050', borderRadius: 14,
    borderWidth: 1, borderColor: '#ffffff10',
    marginBottom: 14, paddingHorizontal: 14,
  },
  inputFocused: { borderColor: '#7c3aed', backgroundColor: '#7c3aed15' },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  footer: { color: '#374151', textAlign: 'center', marginTop: 32, fontSize: 12 },
});