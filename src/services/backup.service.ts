import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface BackupData {
  preferences: any;
  favorites: string[];
  songProgress: any;
  customChords: any[];
  practiceSessions: any[];
  timestamp: number;
  version: string;
}

interface FileInfo extends FileSystem.FileInfo {
  size?: number;
}

export class BackupService {
  private static instance: BackupService;
  private readonly APP_VERSION = '1.0.0';
  private readonly BACKUP_DIRECTORY = `${FileSystem.documentDirectory}backups/`;

  private constructor() {}

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Create a backup of all user data
   */
  public async createBackup(includeMedia: boolean = false): Promise<string> {
    try {
      // Ensure backup directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.BACKUP_DIRECTORY, { intermediates: true });
      }

      // Collect data to backup
      const backupData: BackupData = {
        preferences: await this.getItem('preferences'),
        favorites: await this.getItem('favorites') || [],
        songProgress: await this.getItem('songProgress') || {},
        customChords: await this.getItem('customChords') || [],
        practiceSessions: await this.getItem('practiceSessions') || [],
        timestamp: Date.now(),
        version: this.APP_VERSION,
      };

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `guitarmaster-backup-${timestamp}.json`;
      const filePath = `${this.BACKUP_DIRECTORY}${filename}`;

      // Save backup file
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(backupData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      // If includeMedia is true, also backup media files
      if (includeMedia) {
        await this.backupMediaFiles(timestamp);
      }

      return filePath;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Restore data from a backup file
   */
  public async restoreFromBackup(backupUri: string): Promise<void> {
    try {
      // Read and parse backup file
      const backupContent = await FileSystem.readAsStringAsync(backupUri);
      const backupData: BackupData = JSON.parse(backupContent);

      // Validate backup version
      if (!this.isBackupCompatible(backupData.version)) {
        throw new Error('Incompatible backup version');
      }

      // Restore each data type
      await Promise.all([
        AsyncStorage.setItem('preferences', JSON.stringify(backupData.preferences)),
        AsyncStorage.setItem('favorites', JSON.stringify(backupData.favorites)),
        AsyncStorage.setItem('songProgress', JSON.stringify(backupData.songProgress)),
        AsyncStorage.setItem('customChords', JSON.stringify(backupData.customChords)),
        AsyncStorage.setItem('practiceSessions', JSON.stringify(backupData.practiceSessions)),
      ]);

      // Restore media files if they exist
      const mediaBackupPath = backupUri.replace('.json', '_media');
      const mediaInfo = await FileSystem.getInfoAsync(mediaBackupPath);
      if (mediaInfo.exists) {
        await this.restoreMediaFiles(mediaBackupPath);
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  /**
   * Share backup file
   */
  public async shareBackup(backupPath: string): Promise<void> {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(backupPath);
        } else {
          throw new Error('Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error sharing backup:', error);
      throw error;
    }
  }

  /**
   * List available backups
   */
  public async listBackups(): Promise<{
    path: string;
    timestamp: number;
    size: number;
  }[]> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_DIRECTORY);
      if (!dirInfo.exists) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(this.BACKUP_DIRECTORY);
      const backupFiles = files.filter(file => file.endsWith('.json'));

      const backupInfo = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = `${this.BACKUP_DIRECTORY}${file}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          const content = await FileSystem.readAsStringAsync(filePath);
          const data: BackupData = JSON.parse(content);

          return {
            path: filePath,
            timestamp: data.timestamp,
            size: await this.getBackupSize(filePath),
          };
        })
      );

      return backupInfo.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error listing backups:', error);
      throw error;
    }
  }

  /**
   * Delete a backup
   */
  public async deleteBackup(backupPath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(backupPath);
      
      // Also delete associated media backup if it exists
      const mediaBackupPath = backupPath.replace('.json', '_media');
      const mediaInfo = await FileSystem.getInfoAsync(mediaBackupPath);
      if (mediaInfo.exists) {
        await FileSystem.deleteAsync(mediaBackupPath);
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  private async getItem(key: string): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  private isBackupCompatible(backupVersion: string): boolean {
    // Simple version check - can be made more sophisticated
    const currentParts = this.APP_VERSION.split('.').map(Number);
    const backupParts = backupVersion.split('.').map(Number);
    
    return currentParts[0] === backupParts[0];
  }

  private async backupMediaFiles(timestamp: string): Promise<void> {
    try {
      const mediaDir = `${FileSystem.documentDirectory}media/`;
      const mediaBackupDir = `${this.BACKUP_DIRECTORY}guitarmaster-backup-${timestamp}_media/`;
      
      const mediaInfo = await FileSystem.getInfoAsync(mediaDir);
      if (!mediaInfo.exists) {
        return;
      }

      await FileSystem.copyAsync({
        from: mediaDir,
        to: mediaBackupDir,
      });
    } catch (error) {
      console.error('Error backing up media files:', error);
      throw error;
    }
  }

  private async restoreMediaFiles(mediaBackupPath: string): Promise<void> {
    try {
      const mediaDir = `${FileSystem.documentDirectory}media/`;
      
      // Ensure media directory exists
      const mediaDirInfo = await FileSystem.getInfoAsync(mediaDir);
      if (!mediaDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(mediaDir, { intermediates: true });
      }

      // Copy backup files to media directory
      await FileSystem.copyAsync({
        from: mediaBackupPath,
        to: mediaDir,
      });
    } catch (error) {
      console.error('Error restoring media files:', error);
      throw error;
    }
  }

  private async getBackupSize(backupPath: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(backupPath) as FileInfo;
      return fileInfo.size || 0;
    } catch (error) {
      console.error('Error getting backup size:', error);
      return 0;
    }
  }
}