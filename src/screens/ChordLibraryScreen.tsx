import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ChordDiagram } from '../components/ChordDiagram';
import { getChordByName, getAllChords, getChordComplexity, Chord } from '../utils/chordUtils';

type ChordFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export const ChordLibraryScreen = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ChordFilter>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const allChords = getAllChords();

  const filterChords = useCallback((chords: Chord[]) => {
    return chords.filter(chord => {
      const matchesSearch = 
        chord.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chord.suffix.toLowerCase().includes(searchQuery.toLowerCase());
        
      const complexity = getChordComplexity(chord);
      const matchesFilter = 
        selectedFilter === 'all' || 
        complexity === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  const filteredChords = filterChords(allChords);

  const toggleFavorite = (chordName: string) => {
    setFavorites(prev => 
      prev.includes(chordName)
        ? prev.filter(name => name !== chordName)
        : [...prev, chordName]
    );
  };

  const renderChordItem = ({ item }: { item: Chord }) => (
    <View style={[styles.chordCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.chordHeader}>
        <Text style={[styles.chordName, { color: theme.colors.text }]}>
          {item.name}{item.suffix}
        </Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.name + item.suffix)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={favorites.includes(item.name + item.suffix) ? 'heart' : 'heart-outline'}
            size={24}
            color={favorites.includes(item.name + item.suffix) ? theme.colors.primary : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      
      <ChordDiagram
        name={item.name + item.suffix}
        diagram={item.positions[0]}
        size="large"
      />
      
      <Text style={[styles.complexity, { color: theme.colors.textSecondary }]}>
        Difficulty: {getChordComplexity(item)}
      </Text>
    </View>
  );

  const FilterButton = ({ filter, label }: { filter: ChordFilter; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { 
          backgroundColor: selectedFilter === filter 
            ? theme.colors.primary 
            : theme.colors.surface,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          { 
            color: selectedFilter === filter 
              ? '#ffffff' 
              : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search chords..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <FilterButton filter="all" label="All" />
        <FilterButton filter="beginner" label="Beginner" />
        <FilterButton filter="intermediate" label="Intermediate" />
        <FilterButton filter="advanced" label="Advanced" />
      </View>

      <FlatList
        data={filteredChords}
        renderItem={renderChordItem}
        keyExtractor={(item) => item.name + item.suffix}
        contentContainerStyle={styles.chordList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              No chords found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chordList: {
    gap: 16,
  },
  chordCard: {
    padding: 16,
    borderRadius: 12,
  },
  chordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chordName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 4,
  },
  complexity: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
  },
});