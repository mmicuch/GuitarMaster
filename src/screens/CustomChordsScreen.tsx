import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomChordEditor } from '../components/CustomChordEditor';
import { CustomChord } from '../types/song';
import { ChordDiagram } from '../components/ChordDiagram';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CustomChordsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [customChords, setCustomChords] = useState<CustomChord[]>([]);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [selectedChord, setSelectedChord] = useState<CustomChord | undefined>();

  useEffect(() => {
    loadCustomChords();
  }, []);

  const loadCustomChords = async () => {
    try {
      const savedChords = await AsyncStorage.getItem('customChords');
      if (savedChords) {
        setCustomChords(JSON.parse(savedChords));
      }
    } catch (error) {
      console.error('Error loading custom chords:', error);
    }
  };

  const saveCustomChords = async (chords: CustomChord[]) => {
    try {
      await AsyncStorage.setItem('customChords', JSON.stringify(chords));
    } catch (error) {
      console.error('Error saving custom chords:', error);
    }
  };

  const handleAddChord = () => {
    setSelectedChord(undefined);
    setIsEditorVisible(true);
  };

  const handleEditChord = (chord: CustomChord) => {
    setSelectedChord(chord);
    setIsEditorVisible(true);
  };

  const handleDeleteChord = (chordId: string) => {
    const updatedChords = customChords.filter(chord => chord.id !== chordId);
    setCustomChords(updatedChords);
    saveCustomChords(updatedChords);
  };

  const handleSaveChord = (chord: CustomChord) => {
    const updatedChords = selectedChord
      ? customChords.map(c => c.id === chord.id ? chord : c)
      : [...customChords, chord];
    
    setCustomChords(updatedChords);
    saveCustomChords(updatedChords);
    setIsEditorVisible(false);
    setSelectedChord(undefined);
  };

  const renderChordItem = ({ item }: { item: CustomChord }) => (
    <View style={styles.chordCard}>
      <View style={styles.chordInfo}>
        <Text style={styles.chordName}>{item.name}</Text>
        <ChordDiagram
          frets={item.frets}
          fingers={item.fingers}
          isBarred={item.isBarred}
          barredFret={item.barredFret}
        />
      </View>
      <View style={styles.chordActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditChord(item)}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteChord(item.id)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={customChords}
        renderItem={renderChordItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chordList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No custom chords yet. Create your first one!
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddChord}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={isEditorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditorVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomChordEditor
              onSave={handleSaveChord}
              onCancel={() => {
                setIsEditorVisible(false);
                setSelectedChord(undefined);
              }}
              initialChord={selectedChord}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  chordList: {
    padding: 16,
  },
  chordCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chordInfo: {
    flex: 1,
  },
  chordName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chordActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
});