import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import PDFLib from 'react-native-pdf-lib';

export interface ChordExportData {
  name: string;
  positions: {
    positions: number[];
    fingers: number[];
    barres: { fret: number; fromString: number; toString: number; }[];
  }[];
}

export interface SongExportData {
  title: string;
  artist: string;
  chords: ChordExportData[];
  lyrics?: string;
  notes?: string;
}

const EXPORT_DIRECTORY = `${FileSystem.documentDirectory}exports/`;

// Ensure export directory exists
const ensureExportDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(EXPORT_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(EXPORT_DIRECTORY, { intermediates: true });
  }
};

// Generate a unique filename
const generateFilename = (prefix: string, extension: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}.${extension}`;
};

// Export chord diagram as image
export const exportChordAsImage = async (
  chordRef: React.RefObject<any>,
  chordName: string
): Promise<string> => {
  try {
    const uri = await captureView(chordRef);

    await ensureExportDirectory();
    const filename = generateFilename(chordName, 'png');
    const filePath = `${EXPORT_DIRECTORY}${filename}`;
    
    await FileSystem.moveAsync({
      from: uri,
      to: filePath,
    });

    return filePath;
  } catch (error) {
    console.error('Error exporting chord as image:', error);
    throw error;
  }
};

// Export song data as PDF
export const exportSongAsPDF = async (songData: SongExportData): Promise<string> => {
  try {
    await ensureExportDirectory();
    const filename = generateFilename(songData.title, 'pdf');
    const filePath = `${EXPORT_DIRECTORY}${filename}`;

    // Create PDF
    const page = PDFLib.PDFPage.create()
      .setMediaBox(595.28, 841.89); // A4 size

    // Add title
    page.drawText(songData.title, {
      x: 50,
      y: 800,
      fontSize: 24,
      color: '#000000',
    });

    // Add artist
    page.drawText(songData.artist, {
      x: 50,
      y: 770,
      fontSize: 16,
      color: '#666666',
    });

    // Add chords section if available
    if (songData.chords.length > 0) {
      page.drawText('Chords:', {
        x: 50,
        y: 730,
        fontSize: 16,
        color: '#000000',
      });

      // Add chord names
      const chordList = songData.chords.map(chord => chord.name).join(', ');
      page.drawText(chordList, {
        x: 50,
        y: 710,
        fontSize: 14,
        color: '#000000',
      });
    }

    // Add lyrics if available
    if (songData.lyrics) {
      page.drawText('Lyrics:', {
        x: 50,
        y: 670,
        fontSize: 16,
        color: '#000000',
      });
      page.drawText(songData.lyrics, {
        x: 50,
        y: 650,
        fontSize: 12,
        color: '#000000',
      });
    }

    // Add notes if available
    if (songData.notes) {
      page.drawText('Notes:', {
        x: 50,
        y: 200,
        fontSize: 16,
        color: '#000000',
      });
      page.drawText(songData.notes, {
        x: 50,
        y: 180,
        fontSize: 12,
        color: '#000000',
      });
    }

    const doc = PDFLib.PDFDocument.create();
    doc.addPages(page);
    await doc.write(filePath);

    return filePath;
  } catch (error) {
    console.error('Error exporting song as PDF:', error);
    throw error;
  }
};

// Share exported file
export const shareFile = async (filePath: string): Promise<void> => {
  try {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath);
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
};

const captureView = async (viewRef: any): Promise<string> => {
  try {
    return await viewRef.current.capture();
  } catch (error) {
    console.error('Error capturing view:', error);
    throw error;
  }
};