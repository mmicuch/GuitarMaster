import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

type SoundType = 'metronome-click' | 'tuner-note' | 'success' | 'error';

interface SoundMap {
  [key: string]: Audio.Sound;
}

export const useAudio = () => {
  const [sounds, setSounds] = useState<SoundMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const loadSounds = async () => {
    try {
      const soundFiles = {
        'metronome-click': require('../assets/sounds/metronome-click.mp3'),
        'tuner-note': require('../assets/sounds/tuner-note.mp3'),
        'success': require('../assets/sounds/success.mp3'),
        'error': require('../assets/sounds/error.mp3'),
      };

      const loadedSounds: SoundMap = {};
      
      for (const [key, file] of Object.entries(soundFiles)) {
        const { sound } = await Audio.Sound.createAsync(file, {
          shouldPlay: false,
          volume: 1.0,
        });
        loadedSounds[key] = sound;
      }

      setSounds(loadedSounds);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  };

  const unloadSounds = async () => {
    try {
      for (const sound of Object.values(sounds)) {
        await sound.unloadAsync();
      }
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  };

  const playSound = async (type: SoundType) => {
    try {
      if (!isLoaded || !sounds[type]) return;

      // Stop and rewind the sound before playing
      await sounds[type].stopAsync();
      await sounds[type].setPositionAsync(0);
      await sounds[type].playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const stopSound = async (type: SoundType) => {
    try {
      if (!isLoaded || !sounds[type]) return;
      await sounds[type].stopAsync();
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  return {
    playSound,
    stopSound,
    isLoaded,
  };
};