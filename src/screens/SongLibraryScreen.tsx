import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { Song, SongFilter } from '../types/song';
import { MediaService } from '../services/media.service';
import { useSongProgress } from '../hooks/useSongProgress';
import * as DocumentPicker from 'expo-document-picker';

export const SongLibraryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filter, setFilter] = useState<SongFilter>({
    sortBy: 'title',
    sortOrder: 'asc'
  });
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const mediaService = MediaService.getInstance();
  const { updateSongProgress } = useSongProgress();

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    songs.forEach(song => {
      song.customTags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [songs]);

  const filteredSongs = useMemo(() => {
    let result = [...songs];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filter.difficulty) {
      result = result.filter(song => song.difficulty === filter.difficulty);
    }
    if (filter.genre) {
      result = result.filter(song => song.genre === filter.genre);
    }
    if (filter.source) {
      result = result.filter(song => song.source === filter.source);
    }
    if (filter.favorites) {
      result = result.filter(song => song.isFavorite);
    }
    if (filter.customTags?.length) {
      result = result.filter(song => 
        filter.customTags?.every(tag => song.customTags?.includes(tag))
      );
    }

    // Apply sorting
    if (filter.sortBy) {
      result.sort((a, b) => {
        let compareResult = 0;
        switch (filter.sortBy) {
          case 'title':
            compareResult = a.title.localeCompare(b.title);
            break;
          case 'artist':
            compareResult = a.artist.localeCompare(b.artist);
            break;
          case 'lastPlayed':
            compareResult = (a.lastPlayed?.getTime() || 0) - (b.lastPlayed?.getTime() || 0);
            break;
          case 'practiceTime':
            compareResult = (a.practiceTime || 0) - (b.practiceTime || 0);
            break;
        }
        return filter.sortOrder === 'desc' ? -compareResult : compareResult;
      });
    }

    return result;
  }, [songs, filter, searchQuery]);

  const handleUploadSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const uploadedSong = await mediaService.uploadAudioFile(result.uri, result.name);
        setSongs(prev => [...prev, {
          id: uploadedSong.id,
          title: uploadedSong.title,
          artist: 'Unknown Artist',
          difficulty: 'beginner',
          source: 'local',
          filePath: uploadedSong.filePath,
          chordProgression: uploadedSong.chordProgression || [],
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error uploading song:', error);
    }
  };

  const handleAddFromLink = async () => {
    try {
      // Implementation would go here
      navigation.navigate('AddSongFromLink');
    } catch (error) {
      console.error('Error adding song from link:', error);
    }
  };

  const handleSongPress = (song: Song) => {
    navigation.navigate('SongDetail', { songId: song.id });
  };

  const toggleFavorite = (songId: string) => {
    setSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
    ));
  };

  const renderSongItem = ({ item: song }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => handleSongPress(song)}
    >
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.songArtist}>{song.artist}</Text>
        <View style={styles.tagContainer}>
          {song.customTags?.map(tag => (
            <Text key={tag} style={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>
      <View style={styles.songActions}>
        <TouchableOpacity onPress={() => toggleFavorite(song.id)}>
          <Ionicons
            name={song.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={song.isFavorite ? '#FF3B30' : '#666666'}
          />
        </TouchableOpacity>
        <Text style={styles.difficulty}>{song.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={isFilterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Songs</Text>
          
          <Text style={styles.filterLabel}>Difficulty</Text>
          <View style={styles.filterOptions}>
            {['beginner', 'intermediate', 'advanced'].map(diff => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.filterOption,
                  filter.difficulty === diff && styles.filterOptionSelected
                ]}
                onPress={() => setFilter(prev => ({
                  ...prev,
                  difficulty: prev.difficulty === diff ? undefined : diff as any
                }))}
              >
                <Text style={styles.filterOptionText}>{diff}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Sort By</Text>
          <View style={styles.filterOptions}>
            {['title', 'artist', 'lastPlayed', 'practiceTime'].map(sort => (
              <TouchableOpacity
                key={sort}
                style={[
                  styles.filterOption,
                  filter.sortBy === sort && styles.filterOptionSelected
                ]}
                onPress={() => setFilter(prev => ({
                  ...prev,
                  sortBy: sort as any,
                  sortOrder: prev.sortBy === sort && prev.sortOrder === 'asc' ? 'desc' : 'asc'
                }))}
              >
                <Text style={styles.filterOptionText}>
                  {sort}
                  {filter.sortBy === sort && (
                    <Text> ({filter.sortOrder === 'asc' ? '↑' : '↓'})</Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Tags</Text>
          <ScrollView horizontal style={styles.tagsScroll}>
            {availableTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagOption,
                  selectedTags.includes(tag) && styles.tagSelected
                ]}
                onPress={() => setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                )}
              >
                <Text style={styles.tagOptionText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <CustomButton
              title="Reset Filters"
              onPress={() => {
                setFilter({
                  sortBy: 'title',
                  sortOrder: 'asc'
                });
                setSelectedTags([]);
              }}
              variant="secondary"
            />
            <CustomButton
              title="Apply"
              onPress={() => {
                setFilter(prev => ({
                  ...prev,
                  customTags: selectedTags.length ? selectedTags : undefined
                }));
                setIsFilterModalVisible(false);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSongs}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.songList}
      />

      <View style={styles.actionButtons}>
        <CustomButton
          title="Upload Song"
          onPress={handleUploadSong}
          variant="secondary"
        />
        <CustomButton
          title="Add from Link"
          onPress={handleAddFromLink}
          variant="secondary"
        />
      </View>

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    padding: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  songList: {
    paddingBottom: 16,
  },
  songCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songArtist: {
    color: '#666666',
    fontSize: 14,
  },
  songActions: {
    alignItems: 'flex-end',
  },
  difficulty: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#404040',
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterLabel: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterOptionSelected: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  tagsScroll: {
    maxHeight: 48,
    marginBottom: 20,
  },
  tagOption: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  tagSelected: {
    backgroundColor: '#007AFF',
  },
  tagOptionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});