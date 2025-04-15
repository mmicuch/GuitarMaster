import { Audio } from 'expo-av';

export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
    return true;
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
};

export const startAudioRecording = async () => {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      throw new Error('Audio recording permission not granted');
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return null;
  }
};

export const stopAudioRecording = async (recording: Audio.Recording) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return null;
  }
};

export const playAudioFile = async (uri: string) => {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri });
    await sound.playAsync();
    return sound;
  } catch (error) {
    console.error('Failed to play audio:', error);
    return null;
  }
};