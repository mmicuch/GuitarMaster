import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { CustomButton } from '../components/CustomButton';
import { useSongProgress } from '../hooks/useSongProgress';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { favorites, isLoading } = useSongProgress();

  // Mock data - will be replaced with actual user data
  const practiceStats = {
    weeklyGoal: 5 * 60 * 60, // 5 hours
    weeklyProgress: 3.5 * 60 * 60, // 3.5 hours
    totalSongs: 15,
    masteredSongs: 3,
  };

  const recentSongs = [
    { id: '1', title: 'Wonderwall', artist: 'Oasis', progress: 75 },
    { id: '2', title: 'Hey There Delilah', artist: "Plain White T's", progress: 45 },
    { id: '3', title: 'Hotel California', artist: 'Eagles', progress: 30 },
  ];

  const calculateWeeklyProgress = () => {
    return (practiceStats.weeklyProgress / practiceStats.weeklyGoal) * 100;
  };

  const calculateMasteryProgress = () => {
    return (practiceStats.masteredSongs / practiceStats.totalSongs) * 100;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          Welcome back!
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Let's practice and improve
        </Text>
      </View>

      <View style={styles.statsSection}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <ProgressIndicator
            progress={calculateWeeklyProgress()}
            size="large"
            label="Weekly Goal"
            color={theme.colors.primary}
          />
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            {Math.round(practiceStats.weeklyProgress / 3600)}h / {practiceStats.weeklyGoal / 3600}h
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <ProgressIndicator
            progress={calculateMasteryProgress()}
            size="large"
            label="Songs Mastered"
            color={theme.colors.secondary}
          />
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            {practiceStats.masteredSongs} / {practiceStats.totalSongs} Songs
          </Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <CustomButton
          title="Start Tuning"
          onPress={() => navigation.navigate('Tuner')}
          variant="primary"
          style={styles.actionButton}
        />
        <CustomButton
          title="Open Metronome"
          onPress={() => navigation.navigate('Metronome')}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Recently Practiced
        </Text>
        {recentSongs.map((song) => (
          <TouchableOpacity
            key={song.id}
            style={[styles.songCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('SongDetail', { songId: song.id })}
          >
            <View style={styles.songInfo}>
              <Text style={[styles.songTitle, { color: theme.colors.text }]}>
                {song.title}
              </Text>
              <Text style={[styles.songArtist, { color: theme.colors.textSecondary }]}>
                {song.artist}
              </Text>
            </View>
            <View style={styles.songProgress}>
              <ProgressIndicator
                progress={song.progress}
                size="small"
                showLabel={false}
              />
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={theme.colors.textSecondary} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Daily Tips
        </Text>
        <View style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            Practice tip: Start slow and gradually increase tempo as you become comfortable with the chord changes.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  songCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
  songProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});