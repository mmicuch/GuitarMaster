import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../hooks/useAudio';
import { CustomButton } from '../components/CustomButton';

type TimeSignature = '4/4' | '3/4' | '6/8';

export const MetronomeScreen = () => {
  const { theme } = useTheme();
  const { playSound } = useAudio();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(100);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [currentBeat, setCurrentBeat] = useState(1);
  const [pulseAnim] = useState(new Animated.Value(1));

  const getBeatsPerMeasure = () => {
    switch (timeSignature) {
      case '3/4': return 3;
      case '6/8': return 6;
      default: return 4;
    }
  };

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPlaying) {
      const interval = (60 / tempo) * 1000;
      intervalId = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = prev % getBeatsPerMeasure() + 1;
          pulse();
          playSound(nextBeat === 1 ? 'strong-beat' : 'weak-beat');
          return nextBeat;
        });
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, tempo, timeSignature, pulse, playSound]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
    if (!isPlaying) {
      setCurrentBeat(1);
    }
  };

  const adjustTempo = (change: number) => {
    setTempo(prev => Math.max(40, Math.min(220, prev + change)));
  };

  const BeatsVisualizer = () => (
    <View style={styles.beatsContainer}>
      {Array.from({ length: getBeatsPerMeasure() }, (_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.beat,
            {
              backgroundColor: i + 1 === currentBeat ? theme.colors.primary : theme.colors.surface,
              transform: [
                {
                  scale: i + 1 === currentBeat ? pulseAnim : 1,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.tempoSection}>
        <Text style={[styles.tempoText, { color: theme.colors.text }]}>
          {tempo} BPM
        </Text>
        <View style={styles.tempoControls}>
          <CustomButton
            title="-5"
            onPress={() => adjustTempo(-5)}
            variant="secondary"
            size="small"
          />
          <CustomButton
            title="-1"
            onPress={() => adjustTempo(-1)}
            variant="secondary"
            size="small"
          />
          <CustomButton
            title="+1"
            onPress={() => adjustTempo(1)}
            variant="secondary"
            size="small"
          />
          <CustomButton
            title="+5"
            onPress={() => adjustTempo(5)}
            variant="secondary"
            size="small"
          />
        </View>
      </View>

      <View style={styles.timeSignatureSection}>
        {(['4/4', '3/4', '6/8'] as TimeSignature[]).map((ts) => (
          <TouchableOpacity
            key={ts}
            style={[
              styles.timeSignatureButton,
              {
                backgroundColor:
                  timeSignature === ts ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            onPress={() => setTimeSignature(ts)}
          >
            <Text
              style={[
                styles.timeSignatureText,
                {
                  color:
                    timeSignature === ts ? '#ffffff' : theme.colors.text,
                },
              ]}
            >
              {ts}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <BeatsVisualizer />

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={togglePlay}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.presets}>
        <Text style={[styles.presetsTitle, { color: theme.colors.text }]}>
          Common Tempos
        </Text>
        <View style={styles.presetsGrid}>
          {[
            { label: 'Largo', tempo: 50 },
            { label: 'Adagio', tempo: 71 },
            { label: 'Andante', tempo: 92 },
            { label: 'Moderato', tempo: 112 },
            { label: 'Allegro', tempo: 130 },
            { label: 'Presto', tempo: 168 },
          ].map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[styles.presetButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setTempo(preset.tempo)}
            >
              <Text style={[styles.presetLabel, { color: theme.colors.text }]}>
                {preset.label}
              </Text>
              <Text style={[styles.presetTempo, { color: theme.colors.textSecondary }]}>
                {preset.tempo} BPM
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  tempoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  tempoText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tempoControls: {
    flexDirection: 'row',
    gap: 8,
  },
  timeSignatureSection: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  timeSignatureButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timeSignatureText: {
    fontSize: 18,
    fontWeight: '600',
  },
  beatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  beat: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  controls: {
    marginBottom: 32,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presets: {
    width: '100%',
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  presetTempo: {
    fontSize: 14,
  },
});