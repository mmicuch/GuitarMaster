import Voice, { SpeechStartEvent, SpeechResultsEvent } from '@react-native-community/voice';

interface VoiceCommandHandler {
  command: string | RegExp;
  handler: (args?: string[]) => void | Promise<void>;
  description: string;
}

export class VoiceCommandService {
  private static instance: VoiceCommandService;
  private isListening: boolean = false;
  private handlers: VoiceCommandHandler[] = [];
  private commandTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeVoice();
  }

  public static getInstance(): VoiceCommandService {
    if (!VoiceCommandService.instance) {
      VoiceCommandService.instance = new VoiceCommandService();
    }
    return VoiceCommandService.instance;
  }

  private async initializeVoice() {
    try {
      await Voice.isAvailable();
      this.setupVoiceHandlers();
    } catch (error) {
      console.error('Voice recognition not available:', error);
    }
  }

  private setupVoiceHandlers() {
    Voice.onSpeechStart = this.handleSpeechStart.bind(this);
    Voice.onSpeechEnd = this.handleSpeechEnd.bind(this);
    Voice.onSpeechResults = this.handleSpeechResults.bind(this);
    Voice.onSpeechError = this.handleSpeechError.bind(this);
  }

  /**
   * Start listening for voice commands
   */
  public async startListening(): Promise<void> {
    if (this.isListening) return;

    try {
      this.isListening = true;
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
      throw error;
    }
  }

  /**
   * Stop listening for voice commands
   */
  public async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  }

  /**
   * Register a new voice command handler
   */
  public registerCommand(handler: VoiceCommandHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Remove a voice command handler
   */
  public unregisterCommand(command: string | RegExp): void {
    this.handlers = this.handlers.filter(h => 
      h.command.toString() !== command.toString()
    );
  }

  /**
   * Get all available commands and their descriptions
   */
  public getAvailableCommands(): { command: string; description: string }[] {
    return this.handlers.map(h => ({
      command: h.command.toString(),
      description: h.description,
    }));
  }

  private handleSpeechStart(e: SpeechStartEvent) {
    // Reset command timeout if it exists
    if (this.commandTimeout) {
      clearTimeout(this.commandTimeout);
      this.commandTimeout = null;
    }
  }

  private handleSpeechEnd() {
    // Set a timeout to stop listening if no results are received
    this.commandTimeout = setTimeout(() => {
      this.stopListening();
    }, 1000);
  }

  private async handleSpeechResults(e: SpeechResultsEvent) {
    if (!e.value || e.value.length === 0) return;

    const command = e.value[0].toLowerCase();
    await this.processCommand(command);
  }

  private handleSpeechError(e: any) {
    console.error('Speech recognition error:', e);
    this.isListening = false;
  }

  private async processCommand(command: string): Promise<void> {
    for (const handler of this.handlers) {
      let matches: RegExpMatchArray | null = null;

      if (typeof handler.command === 'string') {
        if (command.includes(handler.command.toLowerCase())) {
          matches = [command];
        }
      } else {
        matches = command.match(handler.command);
      }

      if (matches) {
        try {
          const args = matches.slice(1);
          await handler.handler(args);
          return;
        } catch (error) {
          console.error('Error executing command handler:', error);
        }
      }
    }

    // No matching command found
    console.log('No matching command found for:', command);
  }

  /**
   * Clean up voice recognition
   */
  public cleanup() {
    Voice.removeAllListeners();
  }

  /**
   * Register default commands
   */
  public registerDefaultCommands(
    navigation: any,
    metronomeControls: any,
    tunerControls: any
  ) {
    // Navigation commands
    this.registerCommand({
      command: /go to (home|tuner|chords|songs|profile)/i,
      handler: (args) => {
        if (!args || !args[0]) return;
        const screen = args[0];
        const screens: { [key: string]: string } = {
          home: 'Home',
          tuner: 'Tuner',
          chords: 'ChordLibrary',
          songs: 'SongLibrary',
          profile: 'Profile',
        };
        navigation.navigate(screens[screen.toLowerCase()]);
      },
      description: 'Navigate to different screens (e.g., "go to tuner")',
    });

    // Metronome commands
    this.registerCommand({
      command: /set tempo (\d+)/i,
      handler: (args) => {
        if (!args || !args[0]) return;
        const tempo = parseInt(args[0], 10);
        metronomeControls.setTempo(tempo);
      },
      description: 'Set metronome tempo (e.g., "set tempo 120")',
    });

    this.registerCommand({
      command: /(start|stop) metronome/i,
      handler: (args) => {
        if (!args || !args[0]) return;
        const action = args[0];
        action.toLowerCase() === 'start'
          ? metronomeControls.start()
          : metronomeControls.stop();
      },
      description: 'Control metronome (e.g., "start metronome")',
    });

    // Tuner commands
    this.registerCommand({
      command: /(start|stop) tuner/i,
      handler: (args) => {
        if (!args || !args[0]) return;
        const action = args[0];
        action.toLowerCase() === 'start'
          ? tunerControls.start()
          : tunerControls.stop();
      },
      description: 'Control tuner (e.g., "start tuner")',
    });

    // Add more default commands as needed
  }
}