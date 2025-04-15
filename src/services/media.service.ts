import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import TrackPlayer from 'react-native-track-player';
import { ChordGenerationService } from './chordGeneration.service';

interface FileInfo extends FileSystem.FileInfo {
  size?: number;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'audio' | 'pdf' | 'image';
  uri: string;
  size: number;
  metadata?: any;
}

interface UploadedSong {
  id: string;
  title: string;
  artist?: string;
  filePath: string;
  fileType: 'audio' | 'link';
  sourceUrl?: string;
  duration?: number;
  chordProgression?: Array<{
    chord: string;
    startTime: number;
    duration: number;
  }>;
}

export class MediaService {
  private static instance: MediaService;
  private chordGenService: ChordGenerationService;
  private readonly API_URL = 'https://api.guitarmaster.com'; // Replace with actual API URL
  private readonly MEDIA_DIRECTORY = `${FileSystem.documentDirectory}media/`;
  private readonly ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/m4a'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
  private SUPPORTED_PLATFORMS = ['youtube', 'spotify'];

  private constructor() {
    this.initializeMediaDirectory();
    this.chordGenService = ChordGenerationService.getInstance();
  }

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  private async initializeMediaDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.MEDIA_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.MEDIA_DIRECTORY, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize media directory:', error);
    }
  }

  /**
   * Upload a media file
   */
  public async uploadFile(fileUri: string, type: 'audio' | 'pdf' | 'image'): Promise<MediaFile> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri) as FileInfo;
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      if (fileInfo.size && fileInfo.size > this.MAX_FILE_SIZE) {
        throw new Error('File size exceeds maximum allowed size');
      }

      // Generate unique ID for the file
      const fileId = this.generateFileId();
      const fileName = fileUri.split('/').pop() || fileId;
      const destinationUri = `${this.MEDIA_DIRECTORY}${fileId}-${fileName}`;

      // Copy file to app's media directory
      await FileSystem.copyAsync({
        from: fileUri,
        to: destinationUri,
      });

      const mediaFile: MediaFile = {
        id: fileId,
        name: fileName,
        type,
        uri: destinationUri,
        size: fileInfo.size || 0,
      };

      // Upload to server
      await this.uploadToServer(mediaFile);

      return mediaFile;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Download a media file
   */
  public async downloadFile(fileId: string): Promise<MediaFile> {
    try {
      const response = await fetch(`${this.API_URL}/media/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const fileName = response.headers.get('Content-Disposition')?.split('filename=')[1] || fileId;
      const destinationUri = `${this.MEDIA_DIRECTORY}${fileId}-${fileName}`;

      // Convert blob to base64 and save
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });

      await FileSystem.writeAsStringAsync(
        destinationUri,
        base64Data.split(',')[1],
        { encoding: FileSystem.EncodingType.Base64 }
      );

      const fileInfo = await FileSystem.getInfoAsync(destinationUri) as FileInfo;

      return {
        id: fileId,
        name: fileName,
        type: this.getFileType(fileName),
        uri: destinationUri,
        size: fileInfo.size || 0,
      };
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  /**
   * Delete a media file
   */
  public async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Delete from server
      await fetch(`${this.API_URL}/media/${fileId}`, {
        method: 'DELETE',
      });

      // Delete local file
      const files = await FileSystem.readDirectoryAsync(this.MEDIA_DIRECTORY);
      const fileToDelete = files.find(file => file.startsWith(fileId));
      
      if (fileToDelete) {
        await FileSystem.deleteAsync(`${this.MEDIA_DIRECTORY}${fileToDelete}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  /**
   * Share a media file
   */
  public async shareFile(fileId: string): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.MEDIA_DIRECTORY);
      const fileToShare = files.find(file => file.startsWith(fileId));
      
      if (!fileToShare) {
        throw new Error('File not found');
      }

      const filePath = `${this.MEDIA_DIRECTORY}${fileToShare}`;
      
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath);
        } else {
          throw new Error('Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Failed to share file:', error);
      throw error;
    }
  }

  /**
   * List all media files
   */
  public async listFiles(type?: 'audio' | 'pdf' | 'image'): Promise<MediaFile[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.MEDIA_DIRECTORY);
      const mediaFiles: MediaFile[] = [];

      for (const file of files) {
        const filePath = `${this.MEDIA_DIRECTORY}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath) as FileInfo;
        const fileType = this.getFileType(file);

        if (!type || fileType === type) {
          mediaFiles.push({
            id: file.split('-')[0],
            name: file.split('-').slice(1).join('-'),
            type: fileType,
            uri: filePath,
            size: fileInfo.size || 0,
          });
        }
      }

      return mediaFiles;
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  private generateFileId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private getFileType(fileName: string): 'audio' | 'pdf' | 'image' {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['mp3', 'wav', 'm4a'].includes(extension || '')) {
      return 'audio';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else {
      return 'image';
    }
  }

  private async uploadToServer(file: MediaFile): Promise<void> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: this.getMimeType(file.type, file.name),
        name: file.name,
      } as any);

      await fetch(`${this.API_URL}/media`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Failed to upload to server:', error);
      throw error;
    }
  }

  private getMimeType(type: 'audio' | 'pdf' | 'image', fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (type) {
      case 'audio':
        if (extension === 'mp3') return 'audio/mp3';
        if (extension === 'wav') return 'audio/wav';
        if (extension === 'm4a') return 'audio/m4a';
        return 'audio/mpeg';
      
      case 'pdf':
        return 'application/pdf';
      
      case 'image':
        if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
        if (extension === 'png') return 'image/png';
        return 'image/jpeg';
    }
  }

  /**
   * Get total storage usage
   */
  public async getStorageUsage(): Promise<number> {
    try {
      const files = await this.listFiles();
      return files.reduce((total, file) => total + file.size, 0);
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return 0;
    }
  }

  /**
   * Clean up unused media files
   */
  public async cleanupUnusedFiles(): Promise<void> {
    // TODO: Implement cleanup logic
    // This should check against a list of files that are actually in use
    // and delete any files that are no longer referenced
  }

  async uploadAudioFile(uri: string, title: string): Promise<UploadedSong> {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Create a unique filename
      const fileExtension = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;
      const newPath = `${FileSystem.documentDirectory}songs/${fileName}`;

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}songs/`,
        { intermediates: true }
      );

      // Copy file to app storage
      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      });

      // Initialize track player and get duration
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add({
        url: newPath,
        title: title
      });
      const duration = await TrackPlayer.getDuration();
      await TrackPlayer.reset();

      // Generate chord progression
      const audioBuffer = await FileSystem.readAsStringAsync(newPath, {
        encoding: FileSystem.EncodingType.Base64
      });
      const chordAnalysis = await this.chordGenService.generateChordsFromAudio(
        Buffer.from(audioBuffer, 'base64')
      );

      const song: UploadedSong = {
        id: fileName,
        title,
        filePath: newPath,
        fileType: 'audio',
        duration,
        chordProgression: chordAnalysis.chordProgression.map(cp => ({
          chord: cp.chord,
          startTime: cp.position,
          duration: cp.duration
        }))
      };

      return song;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw error;
    }
  }

  async addSongFromLink(url: string): Promise<UploadedSong> {
    try {
      const platform = this.identifyPlatform(url);
      if (!platform) {
        throw new Error('Unsupported platform or invalid URL');
      }

      // Generate chord progression from the link
      const chordAnalysis = await this.chordGenService.generateChordsFromLink(url);

      // Extract metadata from URL (mock implementation)
      const { title, artist } = await this.extractMetadataFromUrl(url);

      const song: UploadedSong = {
        id: Date.now().toString(),
        title,
        artist,
        fileType: 'link',
        sourceUrl: url,
        chordProgression: chordAnalysis.chordProgression.map(cp => ({
          chord: cp.chord,
          startTime: cp.position,
          duration: cp.duration
        }))
      };

      return song;
    } catch (error) {
      console.error('Error adding song from link:', error);
      throw error;
    }
  }

  private identifyPlatform(url: string): string | null {
    for (const platform of this.SUPPORTED_PLATFORMS) {
      if (url.includes(platform)) {
        return platform;
      }
    }
    return null;
  }

  private async extractMetadataFromUrl(url: string): Promise<{ title: string; artist: string }> {
    // This would normally call platform-specific APIs
    // Mock implementation for now
    return {
      title: 'Unknown Song',
      artist: 'Unknown Artist'
    };
  }

  async playSong(song: UploadedSong): Promise<void> {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.reset();
      
      if (song.fileType === 'audio') {
        await TrackPlayer.add({
          url: song.filePath,
          title: song.title,
          artist: song.artist
        });
      } else if (song.fileType === 'link' && song.sourceUrl) {
        // This would normally use platform-specific APIs
        await TrackPlayer.add({
          url: song.sourceUrl,
          title: song.title,
          artist: song.artist
        });
      }

      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing song:', error);
      throw error;
    }
  }

  async stopSong(): Promise<void> {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error('Error stopping song:', error);
      throw error;
    }
  }
}