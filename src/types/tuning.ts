export type InstrumentType = 'guitar' | 'bass' | 'ukulele';

export interface TuningNote {
  note: string;
  frequency: number;
  string: number;
}

export interface InstrumentTuning {
  name: string;
  strings: TuningNote[];
  alternativeTunings?: {
    name: string;
    strings: TuningNote[];
  }[];
}

export interface TunerConfig {
  instrument: InstrumentType;
  tuning?: string; // Name of alternative tuning if using one
  tolerance: number; // Hz tolerance for tuning accuracy
  referenceA4?: number; // Reference frequency for A4, default 440Hz
}

export const INSTRUMENT_TUNINGS: { [key in InstrumentType]: InstrumentTuning } = {
  guitar: {
    name: 'Guitar (Standard)',
    strings: [
      { note: 'E', frequency: 329.63, string: 1 },
      { note: 'B', frequency: 246.94, string: 2 },
      { note: 'G', frequency: 196.00, string: 3 },
      { note: 'D', frequency: 146.83, string: 4 },
      { note: 'A', frequency: 110.00, string: 5 },
      { note: 'E', frequency: 82.41, string: 6 }
    ],
    alternativeTunings: [
      {
        name: 'Drop D',
        strings: [
          { note: 'E', frequency: 329.63, string: 1 },
          { note: 'B', frequency: 246.94, string: 2 },
          { note: 'G', frequency: 196.00, string: 3 },
          { note: 'D', frequency: 146.83, string: 4 },
          { note: 'A', frequency: 110.00, string: 5 },
          { note: 'D', frequency: 73.42, string: 6 }
        ]
      },
      {
        name: 'Open G',
        strings: [
          { note: 'D', frequency: 293.66, string: 1 },
          { note: 'B', frequency: 246.94, string: 2 },
          { note: 'G', frequency: 196.00, string: 3 },
          { note: 'D', frequency: 146.83, string: 4 },
          { note: 'G', frequency: 98.00, string: 5 },
          { note: 'D', frequency: 73.42, string: 6 }
        ]
      }
    ]
  },
  bass: {
    name: 'Bass (Standard)',
    strings: [
      { note: 'G', frequency: 98.00, string: 1 },
      { note: 'D', frequency: 73.42, string: 2 },
      { note: 'A', frequency: 55.00, string: 3 },
      { note: 'E', frequency: 41.20, string: 4 }
    ],
    alternativeTunings: [
      {
        name: 'Drop D',
        strings: [
          { note: 'G', frequency: 98.00, string: 1 },
          { note: 'D', frequency: 73.42, string: 2 },
          { note: 'A', frequency: 55.00, string: 3 },
          { note: 'D', frequency: 36.71, string: 4 }
        ]
      }
    ]
  },
  ukulele: {
    name: 'Ukulele (Standard)',
    strings: [
      { note: 'A', frequency: 440.00, string: 1 },
      { note: 'E', frequency: 329.63, string: 2 },
      { note: 'C', frequency: 261.63, string: 3 },
      { note: 'G', frequency: 392.00, string: 4 }
    ],
    alternativeTunings: [
      {
        name: 'D Tuning',
        strings: [
          { note: 'B', frequency: 493.88, string: 1 },
          { note: 'F#', frequency: 369.99, string: 2 },
          { note: 'D', frequency: 293.66, string: 3 },
          { note: 'A', frequency: 440.00, string: 4 }
        ]
      }
    ]
  }
};