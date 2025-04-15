import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [syncEnabled, setSyncEnabled] = React.useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Preferences
        </Text>
        
        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
          <Switch
            value={theme.dark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Practice Reminders
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Cloud Sync</Text>
          <Switch
            value={syncEnabled}
            onValueChange={setSyncEnabled}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Data Management
        </Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Backup')}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="save-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Backup & Restore
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.danger }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});