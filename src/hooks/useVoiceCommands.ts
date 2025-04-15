import { useState, useEffect, useCallback } from 'react';
import { VoiceCommandService } from '../services/voiceCommand.service';

export const useVoiceCommands = (
  navigation: any,
  metronomeControls?: any,
  tunerControls?: any
) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const voiceCommandService = VoiceCommandService.getInstance();

  useEffect(() => {
    // Register default commands when the hook is initialized
    voiceCommandService.registerDefaultCommands(
      navigation,
      metronomeControls,
      tunerControls
    );

    return () => {
      // Clean up voice recognition when the hook is unmounted
      voiceCommandService.cleanup();
    };
  }, [navigation, metronomeControls, tunerControls]);

  const startListening = useCallback(async () => {
    try {
      await voiceCommandService.startListening();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start voice recognition');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await voiceCommandService.stopListening();
      setIsListening(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop voice recognition');
    }
  }, []);

  const registerCommand = useCallback((
    command: string | RegExp,
    handler: (args?: string[]) => void | Promise<void>,
    description: string
  ) => {
    voiceCommandService.registerCommand({ command, handler, description });
  }, []);

  const unregisterCommand = useCallback((command: string | RegExp) => {
    voiceCommandService.unregisterCommand(command);
  }, []);

  const getAvailableCommands = useCallback(() => {
    return voiceCommandService.getAvailableCommands();
  }, []);

  return {
    isListening,
    error,
    startListening,
    stopListening,
    registerCommand,
    unregisterCommand,
    getAvailableCommands,
  };
};