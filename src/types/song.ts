export interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: 'local' | 'link' | 'custom';
  filePath?: string;
  sourceUrl?: string;
  chordProgression: ChordProgressionItem[];
  isFavorite: boolean;
  lastPlayed?: Date;
  practiceTime?: number;
  customTags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChordProgressionItem {
  chord: string;
  startTime: number;
  duration: number;
  isCustom?: boolean;
}

export interface SongFilter {
  searchQuery?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  genre?: string;
  source?: 'local' | 'link' | 'custom';
  favorites?: boolean;
  customTags?: string[];
  sortBy?: 'title' | 'artist' | 'lastPlayed' | 'practiceTime';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomChord {
  id: string;
  name: string;
  frets: number[];
  fingers: number[];
  isBarred: boolean;
  barredFret?: number;
  createdBy: string;
  createdAt: Date;
}