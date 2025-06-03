import { sound, Sound } from '@pixi/sound';

export enum SoundType {
    AMBIENT_MUSIC = 'ambient_music',
    POP = 'pop',
    SUCCESS = 'success',
    GAME_OVER = 'game_over',
    WIND = 'wind'
}

export interface AudioSettings {
    masterVolume: number;
    musicVolume: number;
    effectsVolume: number;
    muted: boolean;
}

export class AudioManager {
    private sounds: Map<SoundType, Sound> = new Map();
    private settings: AudioSettings;
    private initialized: boolean = false;

    constructor() {
        this.settings = {
            masterVolume: 0.7,
            musicVolume: 0.5,
            effectsVolume: 0.8,
            muted: false
        };
        
        this.loadSettings();
    }

    async init(): Promise<void> {
        if (this.initialized) return;

        try {
            console.log('Initializing PIXI Sound...');
            
            await this.loadAllSounds();
            this.initialized = true;
            console.log('AudioManager initialized successfully with PIXI Sound');
        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
            this.initialized = false;
        }
    }

    private async loadAllSounds(): Promise<void> {
        const soundPaths = {
            [SoundType.AMBIENT_MUSIC]: `${import.meta.env.BASE_URL}assets/audio/music/ambient.mp3`,
            [SoundType.POP]: `${import.meta.env.BASE_URL}assets/audio/sounds/pop.mp3`,
            [SoundType.SUCCESS]: `${import.meta.env.BASE_URL}assets/audio/sounds/success.mp3`,
            [SoundType.GAME_OVER]: `${import.meta.env.BASE_URL}assets/audio/sounds/game_over.mp3`,
            [SoundType.WIND]: `${import.meta.env.BASE_URL}assets/audio/sounds/wind.mp3`
        };

        const loadPromises = Object.entries(soundPaths).map(async ([type, path]) => {
            try {
                const pixiSound = sound.add(type, {
                    url: path,
                    preload: true,
                    autoPlay: false,
                    loop: type === SoundType.AMBIENT_MUSIC || type === SoundType.WIND,
                    volume: this.getVolumeForType(type as SoundType),
                    loaded: (err, sound) => {
                        if (err) {
                            console.warn(`Failed to load ${type}:`, err);
                        } else {
                            console.log(`Loaded: ${type}`);
                        }
                    }
                });

                this.sounds.set(type as SoundType, pixiSound);
                return Promise.resolve();
            } catch (error) {
                console.warn(`Failed to load sound: ${type}`, error);
                return Promise.resolve();
            }
        });

        await Promise.allSettled(loadPromises);
        console.log('PIXI Sound loading completed');
    }

    private getVolumeForType(soundType: SoundType): number {
        const baseVolume = soundType === SoundType.AMBIENT_MUSIC || soundType === SoundType.WIND 
            ? this.settings.musicVolume 
            : this.settings.effectsVolume;
        
        return baseVolume * this.settings.masterVolume;
    }

    play(soundType: SoundType, options: { volume?: number; loop?: boolean } = {}): void {
        if (!this.initialized || this.settings.muted) return;

        try {
            const volume = options.volume ?? 1;
            const finalVolume = volume * this.getVolumeForType(soundType);

            const instance = sound.play(soundType, {
                volume: finalVolume,
                loop: options.loop ?? (soundType === SoundType.AMBIENT_MUSIC || soundType === SoundType.WIND),
                complete: () => {
                    console.log(`Finished playing: ${soundType}`);
                }
            });

            if (instance) {
                console.log(`Successfully started playing: ${soundType}`);
            }
        } catch (error) {
            console.warn(`Error playing sound: ${soundType}`, error);
        }
    }

    stop(soundType: SoundType): void {
        try {
            sound.stop(soundType);
            console.log(`Stopped: ${soundType}`);
        } catch (error) {
            console.warn(`Error stopping sound: ${soundType}`, error);
        }
    }

    stopAll(): void {
        try {
            sound.stopAll();
            console.log('Stopped all sounds');
        } catch (error) {
            console.warn('Error stopping all sounds:', error);
        }
    }

    reset(): void {
        try {
            this.stopAll();
            
            [SoundType.WIND, SoundType.AMBIENT_MUSIC].forEach(soundType => {
                try {
                    sound.stop(soundType);
                } catch (e) {
                }
            });
            
            const highestId = setTimeout(() => {}, 1);
            for (let i = 0; i < highestId; i++) {
                clearTimeout(i);
                clearInterval(i);
            }
            
            if (this.settings.muted) {
                sound.muteAll();
            } else {
                sound.unmuteAll();
                sound.volumeAll = this.settings.masterVolume;
            }
            
            console.log('Audio system reset for game restart');
        } catch (error) {
            console.warn('Error resetting audio:', error);
        }
    }

    fadeOut(soundType: SoundType, duration: number = 1000): void {
        try {
            const soundInstance = sound.find(soundType);
            if (soundInstance && soundInstance.isPlaying) {
                const startVolume = soundInstance.volume;
                const fadeStep = startVolume / (duration / 50);
                
                const fadeInterval = setInterval(() => {
                    if (soundInstance.volume > fadeStep) {
                        soundInstance.volume -= fadeStep;
                    } else {
                        soundInstance.volume = 0;
                        this.stop(soundType);
                        clearInterval(fadeInterval);
                    }
                }, 50);
            }
        } catch (error) {
            console.warn(`Error fading out sound: ${soundType}`, error);
            this.stop(soundType);
        }
    }

    fadeIn(soundType: SoundType, duration: number = 1000, options: { volume?: number; loop?: boolean } = {}): void {
        try {
            const targetVolume = (options.volume ?? 1) * this.getVolumeForType(soundType);

            const instance = sound.play(soundType, {
                volume: 0,
                loop: options.loop ?? (soundType === SoundType.AMBIENT_MUSIC || soundType === SoundType.WIND)
            });

            if (instance) {
                const handleInstance = (audioInstance: any) => {
                    if (audioInstance && audioInstance.volume !== undefined) {
                        const fadeStep = targetVolume / (duration / 50);
                        
                        const fadeInterval = setInterval(() => {
                            if (audioInstance.volume < targetVolume - fadeStep) {
                                audioInstance.volume += fadeStep;
                            } else {
                                audioInstance.volume = targetVolume;
                                clearInterval(fadeInterval);
                            }
                        }, 50);
                    }
                };

                if (instance instanceof Promise) {
                    instance.then(handleInstance);
                } else {
                    handleInstance(instance);
                }
                
                console.log(`Fading in: ${soundType}`);
            }
        } catch (error) {
            console.warn(`Error fading in sound: ${soundType}`, error);
            this.play(soundType, options);
        }
    }

    setMasterVolume(volume: number): void {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        sound.volumeAll = this.settings.masterVolume;
        this.saveSettings();
    }

    setMusicVolume(volume: number): void {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeForType(SoundType.AMBIENT_MUSIC);
        this.updateVolumeForType(SoundType.WIND);
        this.saveSettings();
    }

    setEffectsVolume(volume: number): void {
        this.settings.effectsVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeForType(SoundType.POP);
        this.updateVolumeForType(SoundType.SUCCESS);
        this.updateVolumeForType(SoundType.GAME_OVER);
        this.saveSettings();
    }

    private updateVolumeForType(soundType: SoundType): void {
        try {
            const soundInstance = sound.find(soundType);
            if (soundInstance) {
                soundInstance.volume = this.getVolumeForType(soundType);
            }
        } catch (error) {
            console.warn(`Error updating volume for ${soundType}:`, error);
        }
    }

    toggleMute(): void {
        this.settings.muted = !this.settings.muted;
        if (this.settings.muted) {
            sound.muteAll();
        } else {
            sound.unmuteAll();
        }
        this.saveSettings();
    }

    private loadSettings(): void {
        try {
            const saved = localStorage.getItem('balloonAdventure_audioSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load audio settings:', error);
        }
    }

    private saveSettings(): void {
        try {
            localStorage.setItem('balloonAdventure_audioSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save audio settings:', error);
        }
    }

    getSettings(): AudioSettings {
        return { ...this.settings };
    }

    isPlaying(soundType: SoundType): boolean {
        try {
            const soundInstance = sound.find(soundType);
            return soundInstance ? soundInstance.isPlaying : false;
        } catch (error) {
            console.warn(`Error checking if sound is playing: ${soundType}`, error);
            return false;
        }
    }

    setVolume(soundType: SoundType, volume: number): void {
        try {
            const soundInstance = sound.find(soundType);
            if (soundInstance && soundInstance.isPlaying) {
                soundInstance.volume = Math.max(0, Math.min(1, volume)) * this.getVolumeForType(soundType);
            }
        } catch (error) {
            console.warn(`Error setting volume for ${soundType}:`, error);
        }
    }

    enableAudio(): void {
        try {
            if (!this.settings.muted) {
                sound.unmuteAll();
                sound.volumeAll = this.settings.masterVolume;
                
                this.updateAllVolumes();
            } else {
                sound.muteAll();
            }
            
            console.log('Audio enabled with PIXI Sound');
        } catch (error) {
            console.warn('Error enabling audio:', error);
        }
    }

    private updateAllVolumes(): void {
        try {
            [SoundType.AMBIENT_MUSIC, SoundType.WIND].forEach(type => {
                const soundInstance = sound.find(type);
                if (soundInstance) {
                    soundInstance.volume = this.settings.musicVolume * this.settings.masterVolume;
                }
            });

            [SoundType.POP, SoundType.SUCCESS, SoundType.GAME_OVER].forEach(type => {
                const soundInstance = sound.find(type);
                if (soundInstance) {
                    soundInstance.volume = this.settings.effectsVolume * this.settings.masterVolume;
                }
            });
        } catch (error) {
            console.warn('Error updating all volumes:', error);
        }
    }
} 