import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import ConsultaScreen from '../screens/ConsultaScreen';
import ResumenScreen from '../screens/ResumenScreen';
import LoginScreen from '../screens/LoginScreen';
import CrearAnimeScreen from '../screens/CrearAnimeScreen';
import GestionScreen from '../screens/GestionScreen';
import { AppContext } from '../context/AppContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ emoji, label, focused, color }) => (
  <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    {focused && <View style={[styles.tabDot, { backgroundColor: color }]} />}
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Consulta"
        component={ConsultaScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="CONSULTA" focused={focused} color={focused ? '#c026d3' : '#444'} />
          ),
        }}
      />
      <Tab.Screen
        name="Resumen"
        component={ResumenScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="RESUMEN" focused={focused} color={focused ? '#7c3aed' : '#444'} />
          ),
        }}
      />
      <Tab.Screen
        name="Crear"
        component={CrearAnimeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="➕" label="CREAR" focused={focused} color={focused ? '#4f46e5' : '#444'} />
          ),
        }}
      />
      <Tab.Screen
        name="Gestion"
        component={GestionScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="GESTIÓN" focused={focused} color={focused ? '#e94560' : '#444'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { usuario } = useContext(AppContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!usuario ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0015',
    borderTopColor: '#ffffff10',
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabItemFocused: {
    transform: [{ scale: 1.05 }],
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});