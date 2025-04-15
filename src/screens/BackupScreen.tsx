import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BackupService } from '../services/backup.service';
import { CustomButton } from '../components/CustomButton';

interface BackupItem {
  path: string;
  timestamp: number;
  size: number;
}

export const BackupScreen = () => {
  const { theme } = useTheme();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);
  const backupService = BackupService.getInstance();

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const backupsList = await backupService.listBackups();
      setBackups(backupsList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load backups');
    }
  };

  const createBackup = async () => {
    try {
      setIsLoading(true);
      const backupPath = await backupService.createBackup(includeMedia);
      Alert.alert('Success', 'Backup created successfully');
      loadBackups();
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreBackup = async (backup: BackupItem) => {
    Alert.alert(
      'Confirm Restore',
      'This will replace all current data with the backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await backupService.restoreFromBackup(backup.path);
              Alert.alert('Success', 'Backup restored successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to restore backup');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const shareBackup = async (backup: BackupItem) => {
    try {
      await backupService.shareBackup(backup.path);
    } catch (error) {
      Alert.alert('Error', 'Failed to share backup');
    }
  };

  const deleteBackup = async (backup: BackupItem) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this backup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await backupService.deleteBackup(backup.path);
              loadBackups();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete backup');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const renderBackupItem = ({ item }: { item: BackupItem }) => (
    <View style={[styles.backupItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.backupInfo}>
        <Text style={[styles.backupDate, { color: theme.colors.text }]}>
          {formatDate(item.timestamp)}
        </Text>
        <Text style={[styles.backupSize, { color: theme.colors.textSecondary }]}>
          {formatSize(item.size)}
        </Text>
      </View>
      <View style={styles.backupActions}>
        <TouchableOpacity
          onPress={() => restoreBackup(item)}
          style={styles.actionButton}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => shareBackup(item)}
          style={styles.actionButton}
        >
          <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteBackup(item)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            Include Media Files
          </Text>
          <Switch
            value={includeMedia}
            onValueChange={setIncludeMedia}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
        <CustomButton
          title="Create New Backup"
          onPress={createBackup}
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
          fullWidth
        />
      </View>

      {backups.length > 0 ? (
        <FlatList
          data={backups}
          renderItem={renderBackupItem}
          keyExtractor={(item) => item.path}
          contentContainerStyle={styles.backupList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No backups available
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
  backupList: {
    gap: 12,
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  backupSize: {
    fontSize: 14,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});