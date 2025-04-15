import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TunerScreen } from '../screens/TunerScreen';
import { ChordLibraryScreen } from '../screens/ChordLibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SongLibraryScreen } from '../screens/SongLibraryScreen';
import { SongDetailScreen } from '../screens/SongDetailScreen';
import { LivePlayScreen } from '../screens/LivePlayScreen';
import { MetronomeScreen } from '../screens/MetronomeScreen';
import { BackupScreen } from '../screens/BackupScreen';
import { CustomChordsScreen } from '../screens/CustomChordsScreen';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LibraryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#121212',
      },
      headerTintColor: '#fff',
    }}
  >
    <Stack.Screen name="Songs" component={SongLibraryScreen} />
    <Stack.Screen name="SongDetail" component={SongDetailScreen} />
    <Stack.Screen 
      name="CustomChords" 
      component={CustomChordsScreen}
      options={{ title: 'Custom Chords' }}
    />
    <Stack.Screen name="LivePlay" component={LivePlayScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#2a2a2a',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tuner" 
        component={TunerScreen}
        options={{
          tabBarLabel: 'Tuner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ChordLibrary" 
        component={ChordLibraryScreen}
        options={{
          tabBarLabel: 'Chords',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Metronome" 
        component={MetronomeScreen}
        options={{
          tabBarLabel: 'Metronome',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SongDetail"
        component={SongDetailScreen}
        options={{ title: 'Song Details' }}
      />
      <Stack.Screen
        name="LivePlay"
        component={LivePlayScreen}
        options={{ title: 'Live Practice' }}
      />
      <Stack.Screen
        name="Backup"
        component={BackupScreen}
        options={{ title: 'Backup & Restore' }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Main App Stack
          <Stack.Screen
            name="Main"
            component={MainStack}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};