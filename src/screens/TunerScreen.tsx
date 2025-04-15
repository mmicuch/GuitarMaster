import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { useAudio } from '../hooks/useAudio';
import { InstrumentTuning, InstrumentType } from '../types/tuning';

interface TuningNote {
  note: string;
  frequency: number;
  string: number;
}

const INSTRUMENTS: { [key in InstrumentType]: InstrumentTuning } = {
  guitar: {
    name: 'Guitar',
    strings: [
      { note: 'E', frequency: 329.63, string: 1 },
      { note: 'B', frequency: 246.94, string: 2 },
      { note: 'G', frequency: 196.00, string: 3 },
      { note: 'D', frequency: 146.83, string: 4 },
      { note: 'A', frequency: 110.00, string: 5 },
      { note: 'E', frequency: 82.41, string: 6 }
    ]
  },
  bass: {
    name: 'Bass Guitar',
    strings: [
      { note: 'G', frequency: 98.00, string: 1 },
      { note: 'D', frequency: 73.42, string: 2 },
      { note: 'A', frequency: 55.00, string: 3 },
      { note: 'E', frequency: 41.20, string: 4 }
    ]
  },
  ukulele: {
    name: 'Ukulele',
    strings: [
      { note: 'A', frequency: 440.00, string: 1 },
      { note: 'E', frequency: 329.63, string: 2 },
      { note: 'C', frequency: 261.63, string: 3 },
      { note: 'G', frequency: 392.00, string: 4 }
    ]
  }
};

export const TunerScreen: React.FC = () => {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('guitar');
  const [currentString, setCurrentString] = useState<number>(1);
  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [tuningAccuracy, setTuningAccuracy] = useState<'flat' | 'sharp' | 'in-tune' | null>(null);
  const { startListening, stopListening, frequency } = useAudio();

  useEffect(() => {
    if (frequency) {
      setPitch(frequency);
      const targetFreq = INSTRUMENTS[selectedInstrument].strings.find(
        s => s.string === currentString
      )?.frequency;
      
      if (targetFreq) {
        const difference = frequency - targetFreq;
        if (Math.abs(difference) < 1) {
          setTuningAccuracy('in-tune');
        } else if (difference < 0) {
          setTuningAccuracy('flat');
        } else {
          setTuningAccuracy('sharp');
        }
      }
    }
  }, [frequency, currentString, selectedInstrument]);

  const handleStringSelect = (stringNum: number) => {
    setCurrentString(stringNum);
    if (isListening) {
      stopListening();
      setIsListening(false);
    }
    setPitch(null);
    setTuningAccuracy(null);
  };

  const toggleListening = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
    setIsListening(!isListening);
  };

  const renderInstrumentSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.instrumentSelector}>
      {Object.entries(INSTRUMENTS).map(([type, data]) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.instrumentButton,
            selectedInstrument === type && styles.selectedInstrument
          ]}
          onPress={() => setSelectedInstrument(type as InstrumentType)}
        >
          <Text style={styles.instrumentText}>{data.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStringButtons = () => (
    <View style={styles.stringsContainer}>
      {INSTRUMENTS[selectedInstrument].strings.map((string) => (
        <TouchableOpacity
          key={string.string}
          style={[
            styles.stringButton,
            currentString === string.string && styles.selectedString
          ]}
          onPress={() => handleStringSelect(string.string)}
        >
          <Text style={styles.stringText}>{string.note}</Text>
          <Text style={styles.stringNumber}>{string.string}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderInstrumentSelector()}
      
      <View style={styles.tunerDisplay}>
        <Text style={styles.tunerNote}>
          {INSTRUMENTS[selectedInstrument].strings.find(s => s.string === currentString)?.note}
        </Text>
        {pitch && (
          <Text style={styles.frequency}>{Math.round(pitch)} Hz</Text>
        )}
        {tuningAccuracy && (
          <Text style={[
            styles.tuningStatus,
            tuningAccuracy === 'in-tune' && styles.inTune,
            tuningAccuracy === 'flat' && styles.flat,
            tuningAccuracy === 'sharp' && styles.sharp,
          ]}>
            {tuningAccuracy.toUpperCase()}
          </Text>
        )}
      </View>

      {renderStringButtons()}

      <TouchableOpacity
        style={[styles.listenButton, isListening && styles.listeningActive]}
        onPress={toggleListening}
      >
        <Text style={styles.listenButtonText}>
          {isListening ? 'Stop' : 'Start Tuning'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  instrumentSelector: {
    flexGrow: 0,
    marginBottom: 24,
  },
  instrumentButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedInstrument: {
    backgroundColor: '#007AFF',
  },
  instrumentText: {
    color: '#ffffff',
    fontSize: 16,
  },
  tunerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 32,
  },
  tunerNote: {
    fontSize: 72,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  frequency: {
    fontSize: 24,
    color: '#666666',
    marginTop: 8,
  },
  tuningStatus: {
    fontSize: 20,
    marginTop: 16,
    fontWeight: 'bold',
  },
  inTune: {
    color: '#4CAF50',
  },
  flat: {
    color: '#FFC107',
  },
  sharp: {
    color: '#FF5722',
  },
  stringsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  stringButton: {
    width: 80,
    height: 80,
    backgroundColor: '#2a2a2a',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedString: {
    backgroundColor: '#007AFF',
  },
  stringText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stringNumber: {
    color: '#666666',
    fontSize: 14,
  },
  listenButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  listeningActive: {
    backgroundColor: '#FF3B30',
  },
  listenButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});