import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CustomButton } from './CustomButton';
import { CustomChord } from '../types/song';

interface Props {
  onSave: (chord: CustomChord) => void;
  onCancel: () => void;
  initialChord?: CustomChord;
}

const FRET_COUNT = 5;
const STRING_COUNT = 6;

export const CustomChordEditor: React.FC<Props> = ({
  onSave,
  onCancel,
  initialChord,
}) => {
  const [chordName, setChordName] = useState(initialChord?.name || '');
  const [selectedFrets, setSelectedFrets] = useState<number[]>(
    initialChord?.frets || Array(STRING_COUNT).fill(-1)
  );
  const [selectedFingers, setSelectedFingers] = useState<number[]>(
    initialChord?.fingers || Array(STRING_COUNT).fill(0)
  );
  const [isBarred, setIsBarred] = useState(initialChord?.isBarred || false);
  const [barredFret, setBarredFret] = useState(initialChord?.barredFret || 0);

  const handleFretPress = (string: number, fret: number) => {
    const newFrets = [...selectedFrets];
    newFrets[string] = newFrets[string] === fret ? -1 : fret;
    setSelectedFrets(newFrets);
  };

  const handleFingerPress = (string: number, finger: number) => {
    const newFingers = [...selectedFingers];
    newFingers[string] = newFingers[string] === finger ? 0 : finger;
    setSelectedFingers(newFingers);
  };

  const handleSave = () => {
    if (!chordName.trim()) {
      // Show error about required name
      return;
    }

    const newChord: CustomChord = {
      id: initialChord?.id || Date.now().toString(),
      name: chordName.trim(),
      frets: selectedFrets,
      fingers: selectedFingers,
      isBarred,
      barredFret: isBarred ? barredFret : undefined,
      createdBy: 'user', // Replace with actual user ID
      createdAt: initialChord?.createdAt || new Date(),
    };

    onSave(newChord);
  };

  const renderFretboard = () => (
    <View style={styles.fretboard}>
      {Array.from({ length: STRING_COUNT }).map((_, string) => (
        <View key={string} style={styles.string}>
          {Array.from({ length: FRET_COUNT }).map((_, fret) => (
            <TouchableOpacity
              key={fret}
              style={[
                styles.fret,
                selectedFrets[string] === fret && styles.selectedFret,
                isBarred && barredFret === fret && styles.barredFret,
              ]}
              onPress={() => handleFretPress(string, fret)}
            >
              {selectedFrets[string] === fret && (
                <Text style={styles.fingerText}>
                  {selectedFingers[string] || '•'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  const renderFingerSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.fingerSelector}>
        {Array.from({ length: 4 }).map((_, i) => (
          <TouchableOpacity
            key={i + 1}
            style={[
              styles.fingerButton,
              selectedFingers.includes(i + 1) && styles.selectedFinger,
            ]}
            onPress={() => {
              const stringIndex = selectedFrets.findIndex(fret => fret !== -1);
              if (stringIndex !== -1) {
                handleFingerPress(stringIndex, i + 1);
              }
            }}
          >
            <Text style={styles.fingerButtonText}>{i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {initialChord ? 'Edit Chord' : 'Create Custom Chord'}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Chord Name</Text>
        <TextInput
          style={styles.input}
          value={chordName}
          onChangeText={setChordName}
          placeholder="Enter chord name..."
          placeholderTextColor="#666666"
        />
      </View>

      {renderFretboard()}
      {renderFingerSelector()}

      <View style={styles.barreSection}>
        <TouchableOpacity
          style={[styles.barreButton, isBarred && styles.barreButtonActive]}
          onPress={() => setIsBarred(!isBarred)}
        >
          <Text style={styles.barreButtonText}>Barre Chord</Text>
        </TouchableOpacity>
        {isBarred && (
          <View style={styles.barreFretSelector}>
            {Array.from({ length: FRET_COUNT }).map((_, fret) => (
              <TouchableOpacity
                key={fret}
                style={[
                  styles.barreFretButton,
                  barredFret === fret && styles.selectedBarreFret,
                ]}
                onPress={() => setBarredFret(fret)}
              >
                <Text style={styles.barreFretText}>{fret}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <CustomButton
          title="Cancel"
          onPress={onCancel}
          variant="secondary"
        />
        <CustomButton
          title="Save Chord"
          onPress={handleSave}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  fretboard: {
    marginBottom: 24,
  },
  string: {
    flexDirection: 'row',
    marginBottom: 1,
    height: 40,
  },
  fret: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRightWidth: 1,
    borderColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFret: {
    backgroundColor: '#007AFF',
  },
  barredFret: {
    backgroundColor: '#FF9500',
  },
  fingerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fingerSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  fingerButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFinger: {
    backgroundColor: '#007AFF',
  },
  fingerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  barreSection: {
    marginBottom: 24,
  },
  barreButton: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  barreButtonActive: {
    backgroundColor: '#FF9500',
  },
  barreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  barreFretSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  barreFretButton: {
    width: 32,
    height: 32,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBarreFret: {
    backgroundColor: '#FF9500',
  },
  barreFretText: {
    color: '#ffffff',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});