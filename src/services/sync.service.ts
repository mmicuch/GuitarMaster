import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface SyncData {
  preferences: any;
  favorites: any[];
  songProgress: any;
  customChords: any[];
  practiceSessions: any[];
  lastSyncTimestamp: number;
}

export class SyncService {
  private static instance: SyncService;
  private readonly API_URL = 'https://api.guitarmaster.com'; // Replace with actual API URL
  private syncInProgress: boolean = false;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private syncTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Start automatic synchronization
   */
  public startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.syncData();
    }, this.SYNC_INTERVAL);

    // Initial sync
    this.syncData();
  }

  /**
   * Stop automatic synchronization
   */
  public stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Manually trigger data synchronization
   */
  public async syncData(): Promise<boolean> {
    if (this.syncInProgress) {
      return false;
    }

    try {
      this.syncInProgress = true;

      // Get local data
      const localData = await this.getLocalData();

      // Get server data
      const serverData = await this.fetchServerData();

      if (!serverData) {
        // Initial sync, push local data to server
        await this.pushToServer(localData);
      } else {
        // Merge data and resolve conflicts
        const mergedData = this.mergeData(localData, serverData);
        
        // Save merged data locally
        await this.saveLocalData(mergedData);
        
        // Push merged data to server
        await this.pushToServer(mergedData);
      }

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get all local data for synchronization
   */
  private async getLocalData(): Promise<SyncData> {
    try {
      const [
        preferences,
        favorites,
        songProgress,
        customChords,
        practiceSessions,
        lastSync
      ] = await Promise.all([
        AsyncStorage.getItem('preferences'),
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('songProgress'),
        AsyncStorage.getItem('customChords'),
        AsyncStorage.getItem('practiceSessions'),
        AsyncStorage.getItem('lastSyncTimestamp')
      ]);

      return {
        preferences: preferences ? JSON.parse(preferences) : {},
        favorites: favorites ? JSON.parse(favorites) : [],
        songProgress: songProgress ? JSON.parse(songProgress) : {},
        customChords: customChords ? JSON.parse(customChords) : [],
        practiceSessions: practiceSessions ? JSON.parse(practiceSessions) : [],
        lastSyncTimestamp: lastSync ? parseInt(lastSync) : 0
      };
    } catch (error) {
      console.error('Error getting local data:', error);
      throw error;
    }
  }

  /**
   * Save merged data locally
   */
  private async saveLocalData(data: SyncData): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('preferences', JSON.stringify(data.preferences)),
        AsyncStorage.setItem('favorites', JSON.stringify(data.favorites)),
        AsyncStorage.setItem('songProgress', JSON.stringify(data.songProgress)),
        AsyncStorage.setItem('customChords', JSON.stringify(data.customChords)),
        AsyncStorage.setItem('practiceSessions', JSON.stringify(data.practiceSessions)),
        AsyncStorage.setItem('lastSyncTimestamp', data.lastSyncTimestamp.toString())
      ]);
    } catch (error) {
      console.error('Error saving local data:', error);
      throw error;
    }
  }

  /**
   * Fetch data from server
   */
  private async fetchServerData(): Promise<SyncData | null> {
    try {
      const response = await fetch(`${this.API_URL}/sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch server data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching server data:', error);
      return null;
    }
  }

  /**
   * Push data to server
   */
  private async pushToServer(data: SyncData): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to push data to server');
      }
    } catch (error) {
      console.error('Error pushing to server:', error);
      throw error;
    }
  }

  /**
   * Merge local and server data, resolving conflicts
   */
  private mergeData(localData: SyncData, serverData: SyncData): SyncData {
    const merged: SyncData = {
      preferences: this.mergePreferences(localData.preferences, serverData.preferences),
      favorites: this.mergeFavorites(localData.favorites, serverData.favorites),
      songProgress: this.mergeSongProgress(localData.songProgress, serverData.songProgress),
      customChords: this.mergeCustomChords(localData.customChords, serverData.customChords),
      practiceSessions: this.mergePracticeSessions(
        localData.practiceSessions,
        serverData.practiceSessions
      ),
      lastSyncTimestamp: Date.now()
    };

    return merged;
  }

  private mergePreferences(local: any, server: any): any {
    // Prefer local preferences, but merge with server for any new fields
    return { ...server, ...local };
  }

  private mergeFavorites(local: any[], server: any[]): any[] {
    // Combine favorites and remove duplicates
    return [...new Set([...local, ...server])];
  }

  private mergeSongProgress(local: any, server: any): any {
    const merged = { ...server };
    
    // For each song, use the most recent progress
    for (const songId in local) {
      if (!merged[songId] || local[songId].lastUpdated > merged[songId].lastUpdated) {
        merged[songId] = local[songId];
      }
    }

    return merged;
  }

  private mergeCustomChords(local: any[], server: any[]): any[] {
    // Merge custom chords, preferring local versions in case of conflict
    const mergedMap = new Map();
    
    [...server, ...local].forEach(chord => {
      mergedMap.set(chord.id, chord);
    });

    return Array.from(mergedMap.values());
  }

  private mergePracticeSessions(local: any[], server: any[]): any[] {
    // Combine all practice sessions and sort by date
    const allSessions = [...local, ...server];
    const uniqueSessions = allSessions.filter((session, index) => {
      return allSessions.findIndex(s => s.id === session.id) === index;
    });

    return uniqueSessions.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Delete server data (useful for account deletion)
   */
  public async deleteServerData(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/sync`, {
        method: 'DELETE',
        headers: {
          // Add authentication headers here
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting server data:', error);
      return false;
    }
  }
}