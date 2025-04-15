export interface ChordPosition {
  positions: number[]; // Fret positions for each string (0 = open, -1 = muted)
  fingers: number[]; // Finger positions (1-4, 0 = no finger)
  barres: { fret: number; fromString: number; toString: number }[]; // Barre chord information
  baseFret?: number; // Starting fret for barre chords
}

export interface Chord {
  name: string; // Base note (C, D, etc.)
  suffix: string; // Chord type (major, minor, 7th, etc.)
  positions: ChordPosition[]; // Different ways to play the chord
  complexity: number; // 1-10 scale of difficulty
}

// Basic open chords
const openChords: Chord[] = [
  {
    name: 'A',
    suffix: '',
    positions: [{
      positions: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      barres: [],
    }],
    complexity: 2,
  },
  {
    name: 'Am',
    suffix: 'm',
    positions: [{
      positions: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      barres: [],
    }],
    complexity: 2,
  },
  {
    name: 'D',
    suffix: '',
    positions: [{
      positions: [-1, -1, 0, 2, 3, 2],
      fingers: [0, 0, 0, 1, 3, 2],
      barres: [],
    }],
    complexity: 3,
  },
  {
    name: 'Dm',
    suffix: 'm',
    positions: [{
      positions: [-1, -1, 0, 2, 3, 1],
      fingers: [0, 0, 0, 2, 3, 1],
      barres: [],
    }],
    complexity: 3,
  },
  {
    name: 'G',
    suffix: '',
    positions: [{
      positions: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
      barres: [],
    }],
    complexity: 4,
  },
  {
    name: 'C',
    suffix: '',
    positions: [{
      positions: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      barres: [],
    }],
    complexity: 3,
  },
  {
    name: 'Em',
    suffix: 'm',
    positions: [{
      positions: [0, 2, 2, 0, 0, 0],
      fingers: [0, 1, 2, 0, 0, 0],
      barres: [],
    }],
    complexity: 1,
  },
];

// Common barre chords
const barreChords: Chord[] = [
  {
    name: 'F',
    suffix: '',
    positions: [{
      positions: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fret: 1, fromString: 1, toString: 6 }],
      baseFret: 1,
    }],
    complexity: 7,
  },
  {
    name: 'B',
    suffix: '',
    positions: [{
      positions: [2, 4, 4, 4, 2, 2],
      fingers: [1, 3, 3, 3, 1, 1],
      barres: [{ fret: 2, fromString: 1, toString: 6 }],
      baseFret: 1,
    }],
    complexity: 8,
  },
];

// 7th chords
const seventhChords: Chord[] = [
  {
    name: 'A',
    suffix: '7',
    positions: [{
      positions: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 0, 2, 0, 3, 0],
      barres: [],
    }],
    complexity: 4,
  },
  {
    name: 'D',
    suffix: '7',
    positions: [{
      positions: [-1, -1, 0, 2, 1, 2],
      fingers: [0, 0, 0, 2, 1, 3],
      barres: [],
    }],
    complexity: 4,
  },
];

// Combine all chord types
const allChords = [...openChords, ...barreChords, ...seventhChords];

export const getAllChords = (): Chord[] => {
  return allChords;
};

export const getChordByName = (name: string, suffix: string = ''): Chord | undefined => {
  return allChords.find(chord => chord.name === name && chord.suffix === suffix);
};

export const getChordComplexity = (chord: Chord): 'beginner' | 'intermediate' | 'advanced' => {
  if (chord.complexity <= 3) return 'beginner';
  if (chord.complexity <= 6) return 'intermediate';
  return 'advanced';
};

// Helper function to transpose chords
export const transposeChord = (chord: Chord, semitones: number): Chord => {
  const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  const currentIndex = notes.indexOf(chord.name);
  const newIndex = (currentIndex + semitones + 12) % 12;
  
  return {
    ...chord,
    name: notes[newIndex],
  };
};

// Helper function to get alternative positions for a chord
export const getAlternativePositions = (chord: Chord): ChordPosition[] => {
  return chord.positions;
};