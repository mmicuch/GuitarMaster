import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PracticeSession {
  songId: string;
  date: string;
  duration: number;
  completed: boolean;
}

interface SongProgress {
  songId: string;
  lastPracticed: string;
  totalPracticeTime: number;
  masteryLevel: number; // 0-100
  practiceSessions: PracticeSession[];
}

interface FavoriteSong {
  songId: string;
  dateAdded: string;
}

export const useSongProgress = () => {
  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: SongProgress }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [favoritesData, progressData] = await Promise.all([
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('songProgress'),
      ]);

      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
      if (progressData) {
        setProgress(JSON.parse(progressData));
      }
    } catch (error) {
      console.error('Failed to load song data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (songId: string) => {
    try {
      const isFavorite = favorites.some(fav => fav.songId === songId);
      let newFavorites: FavoriteSong[];

      if (isFavorite) {
        newFavorites = favorites.filter(fav => fav.songId !== songId);
      } else {
        newFavorites = [...favorites, { songId, dateAdded: new Date().toISOString() }];
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      return true;
    } catch (error) {
      console.error('Failed to update favorites:', error);
      return false;
    }
  };

  const recordPracticeSession = async (
    songId: string,
    duration: number,
    completed: boolean
  ) => {
    try {
      const currentProgress = progress[songId] || {
        songId,
        lastPracticed: '',
        totalPracticeTime: 0,
        masteryLevel: 0,
        practiceSessions: [],
      };

      const newSession: PracticeSession = {
        songId,
        date: new Date().toISOString(),
        duration,
        completed,
      };

      const updatedProgress = {
        ...currentProgress,
        lastPracticed: newSession.date,
        totalPracticeTime: currentProgress.totalPracticeTime + duration,
        practiceSessions: [...currentProgress.practiceSessions, newSession],
      };

      // Calculate mastery level based on practice time and completion rate
      const completedSessions = updatedProgress.practiceSessions.filter(s => s.completed).length;
      const completionRate = completedSessions / updatedProgress.practiceSessions.length;
      const practiceTimeWeight = Math.min(updatedProgress.totalPracticeTime / 3600, 1); // Cap at 1 hour
      updatedProgress.masteryLevel = Math.round((completionRate * 0.7 + practiceTimeWeight * 0.3) * 100);

      const newProgress = {
        ...progress,
        [songId]: updatedProgress,
      };

      await AsyncStorage.setItem('songProgress', JSON.stringify(newProgress));
      setProgress(newProgress);
      return true;
    } catch (error) {
      console.error('Failed to update progress:', error);
      return false;
    }
  };

  const getSongProgress = (songId: string): SongProgress | null => {
    return progress[songId] || null;
  };

  const getFavorites = (): FavoriteSong[] => {
    return favorites;
  };

  return {
    isLoading,
    favorites,
    toggleFavorite,
    recordPracticeSession,
    getSongProgress,
    getFavorites,
  };
};