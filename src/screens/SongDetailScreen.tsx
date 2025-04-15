import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Audio } from 'expo-av';

interface ChordProgression {
  chord: string;
  duration: number;
  position: number;
}

export const SongDetailScreen = ({ route, navigation }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [tempo, setTempo] = useState(100);

  // Mock data - will be replaced with API data
  const songData = {
    title: 'Wonderwall',
    artist: 'Oasis',
    key: 'Em',
    tempo: 100,
    difficulty: 'beginner',
    chordProgression: [
      { chord: 'Em', duration: 1, position: 1 },
      { chord: 'G', duration: 1, position: 1 },
      { chord: 'D', duration: 1, position: 1 },
      { chord: 'A7sus4', duration: 1, position: 1 },
    ] as ChordProgression[],
  };

  const startLivePlay = async () => {
    setIsPlaying(true);
    // TODO: Implement chord progression playback
    // This will advance through chords at the specified tempo
  };

  const stopLivePlay = () => {
    setIsPlaying(false);
    setCurrentChordIndex(0);
  };

  const adjustTempo = (change: number) => {
    const newTempo = Math.max(60, Math.min(200, tempo + change));
    setTempo(newTempo);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{songData.title}</Text>
          <Text style={styles.artist}>{songData.artist}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.meta}>Key: {songData.key}</Text>
            <Text style={styles.meta}>Tempo: {songData.tempo} BPM</Text>
          </View>
        </View>

        <View style={styles.chordSection}>
          <Text style={styles.sectionTitle}>Chord Progression</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chordProgression}>
              {songData.chordProgression.map((prog, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.chordBox,
                    currentChordIndex === index && isPlaying && styles.activeChord
                  ]}
                >
                  <Text style={styles.chordText}>{prog.chord}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>LivePlay Controls</Text>
          
          <View style={styles.tempoControl}>
            <TouchableOpacity 
              style={styles.tempoButton} 
              onPress={() => adjustTempo(-5)}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.tempoText}>{tempo} BPM</Text>
            <TouchableOpacity 
              style={styles.tempoButton} 
              onPress={() => adjustTempo(5)}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.playButton, isPlaying && styles.stopButton]} 
            onPress={isPlaying ? stopLivePlay : startLivePlay}
          >
            <Text style={styles.buttonText}>
              {isPlaying ? 'Stop' : 'Start LivePlay'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 18,
    color: '#999999',
    marginTop: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    marginTop: 12,
  },
  meta: {
    color: '#666666',
    marginRight: 16,
  },
  chordSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: '600',
  },
  chordProgression: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  chordBox: {
    width: 80,
    height: 80,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeChord: {
    backgroundColor: '#007AFF',
  },
  chordText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  controlSection: {
    padding: 20,
  },
  tempoControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tempoButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  tempoText: {
    color: '#ffffff',
    fontSize: 18,
  },
  playButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});