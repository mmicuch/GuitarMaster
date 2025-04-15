import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ChordDiagram } from '../components/ChordDiagram';
import { CustomButton } from '../components/CustomButton';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { usePreferences } from '../hooks/usePreferences';
import { useSongProgress } from '../hooks/useSongProgress';
import { usePracticeTimer } from '../hooks/usePracticeTimer';

export const LivePlayScreen = ({ route, navigation }: any) => {
  const { songId } = route.params;
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [tempo, setTempo] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { preferences } = usePreferences();
  const { recordPracticeSession } = useSongProgress();
  const { 
    isActive: isTimerActive,
    start: startTimer,
    stop: stopTimer,
    getTimeString: getTimerString,
  } = usePracticeTimer();

  // Mock song data - will be replaced with actual data
  const songData = {
    title: 'Wonderwall',
    artist: 'Oasis',
    chordProgression: [
      { chord: 'Em', duration: 1 },
      { chord: 'G', duration: 1 },
      { chord: 'D', duration: 1 },
      { chord: 'A7sus4', duration: 1 },
    ],
  };

  const voiceCommands = [
    {
      name: 'startPlaying',
      pattern: /start|play|begin/i,
      handler: () => startPractice(),
    },
    {
      name: 'stopPlaying',
      pattern: /stop|pause|end/i,
      handler: () => stopPractice(),
    },
    {
      name: 'nextChord',
      pattern: /next|forward/i,
      handler: () => moveToNextChord(),
    },
    {
      name: 'previousChord',
      pattern: /previous|back/i,
      handler: () => moveToPreviousChord(),
    },
    {
      name: 'adjustTempo',
      pattern: /set tempo to (\d+)/i,
      handler: ([newTempo]: [string]) => setTempo(parseInt(newTempo, 10)),
    },
  ];

  const { isListening, startListening, stopListening } = useVoiceCommands(voiceCommands);
  const [voiceActive, setVoiceActive] = useState(false);

  const toggleListening = async () => {
    if (voiceActive) {
      await stopListening();
    } else {
      await startListening();
    }
    setVoiceActive(!voiceActive);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying) {
      intervalId = setInterval(() => {
        moveToNextChord();
      }, (60 / tempo) * 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, tempo]);

  const startPractice = () => {
    setIsPlaying(true);
    startTimer();
  };

  const stopPractice = async () => {
    setIsPlaying(false);
    const practiceTime = stopTimer();
    if (practiceTime) {
      await recordPracticeSession(songId, practiceTime.totalSeconds, true);
    }
  };

  const moveToNextChord = () => {
    setCurrentChordIndex((prev) => 
      prev === songData.chordProgression.length - 1 ? 0 : prev + 1
    );
  };

  const moveToPreviousChord = () => {
    setCurrentChordIndex((prev) => 
      prev === 0 ? songData.chordProgression.length - 1 : prev - 1
    );
  };

  const adjustTempo = (change: number) => {
    setTempo((prev) => Math.max(40, Math.min(220, prev + change)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{songData.title}</Text>
        <Text style={styles.artist}>{songData.artist}</Text>
      </View>

      <View style={styles.timerSection}>
        <Text style={styles.timerText}>{getTimerString()}</Text>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.tempoText}>{tempo} BPM</Text>
        <View style={styles.tempoControls}>
          <CustomButton
            title="-5"
            onPress={() => adjustTempo(-5)}
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

      <ScrollView horizontal style={styles.chordProgression}>
        {songData.chordProgression.map((item, index) => (
          <View
            key={index}
            style={[
              styles.chordContainer,
              currentChordIndex === index && styles.activeChord,
            ]}
          >
            <ChordDiagram
              name={item.chord}
              diagram={{
                positions: [0, 2, 2, 0, 0, 0],
                fingers: [0, 1, 2, 0, 0, 0],
                barres: [],
              }}
              size="large"
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <CustomButton
          title={isPlaying ? 'Stop Practice' : 'Start Practice'}
          onPress={isPlaying ? stopPractice : startPractice}
          variant={isPlaying ? 'danger' : 'primary'}
          size="large"
          fullWidth
        />
        
        <CustomButton
          title={voiceActive ? 'Voice Control Active' : 'Enable Voice Control'}
          onPress={toggleListening}
          variant="secondary"
          style={styles.voiceButton}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 16,
    color: '#999999',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 32,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tempoText: {
    fontSize: 20,
    color: '#ffffff',
  },
  tempoControls: {
    flexDirection: 'row',
    gap: 10,
  },
  chordProgression: {
    marginBottom: 20,
  },
  chordContainer: {
    marginRight: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  activeChord: {
    backgroundColor: '#1a1a1a',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  controls: {
    gap: 10,
  },
  voiceButton: {
    marginTop: 10,
  },
});