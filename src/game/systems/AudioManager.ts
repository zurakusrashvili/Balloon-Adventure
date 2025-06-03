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
    private sounds: Map<SoundType, HTMLAudioElement> = new Map();
    private currentMusic: HTMLAudioElement | null = null;
    private settings: AudioSettings;
    private audioContext: AudioContext | null = null;
    private gainNodes: Map<SoundType, GainNode> = new Map();
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
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            await this.loadAllSounds();
            this.initialized = true;
            console.log('AudioManager initialized successfully');
        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
            await this.loadAllSoundsBasic();
            this.initialized = true;
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
                const audio = new Audio(path);
                audio.preload = 'auto';
                
                if (type === SoundType.AMBIENT_MUSIC || type === SoundType.WIND) {
                    audio.loop = true;
                }
                
                if (this.audioContext) {
                    const source = this.audioContext.createMediaElementSource(audio);
                    const gainNode = this.audioContext.createGain();
                    source.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    this.gainNodes.set(type as SoundType, gainNode);
                }
                
                this.sounds.set(type as SoundType, audio);
                
                return new Promise<void>((resolve, reject) => {
                    audio.addEventListener('canplaythrough', () => resolve());
                    audio.addEventListener('error', reject);
                });
            } catch (error) {
                console.warn(`Failed to load sound: ${type}`, error);
            }
        });

        await Promise.allSettled(loadPromises);
    }

    private async loadAllSoundsBasic(): Promise<void> {
        const soundPaths = {
            [SoundType.AMBIENT_MUSIC]: `${import.meta.env.BASE_URL}assets/audio/music/ambient.mp3`,
            [SoundType.POP]: `${import.meta.env.BASE_URL}assets/audio/sounds/pop.mp3`,
            [SoundType.SUCCESS]: `${import.meta.env.BASE_URL}assets/audio/sounds/success.mp3`,
            [SoundType.GAME_OVER]: `${import.meta.env.BASE_URL}assets/audio/sounds/game_over.mp3`,
            [SoundType.WIND]: `${import.meta.env.BASE_URL}assets/audio/sounds/wind.mp3`
        };

        Object.entries(soundPaths).forEach(([type, path]) => {
            try {
                const audio = new Audio(path);
                audio.preload = 'auto';
                
                if (type === SoundType.AMBIENT_MUSIC || type === SoundType.WIND) {
                    audio.loop = true;
                }
                
                this.sounds.set(type as SoundType, audio);
            } catch (error) {
                console.warn(`Failed to load sound: ${type}`, error);
            }
        });
    }

    play(soundType: SoundType, options: { volume?: number; loop?: boolean } = {}): void {
        if (!this.initialized || this.settings.muted) return;

        const sound = this.sounds.get(soundType);
        if (!sound) {
            console.warn(`Sound not found: ${soundType}`);
            return;
        }

        try {
            sound.currentTime = 0;
            
            const baseVolume = soundType === SoundType.AMBIENT_MUSIC || soundType === SoundType.WIND 
                ? this.settings.musicVolume 
                : this.settings.effectsVolume;
            
            const volume = (options.volume ?? 1) * baseVolume * this.settings.masterVolume;
            
            if (this.gainNodes.has(soundType)) {
                this.gainNodes.get(soundType)!.gain.value = volume;
            } else {
                sound.volume = volume;
            }
            
            if (options.loop !== undefined) {
                sound.loop = options.loop;
            }
            
            const playPromise = sound.play();
            if (playPromise) {
                playPromise.catch(error => {
                    console.warn(`Failed to play sound: ${soundType}`, error);
                });
            }
            
            if (soundType === SoundType.AMBIENT_MUSIC) {
                this.currentMusic = sound;
            }
        } catch (error) {
            console.warn(`Error playing sound: ${soundType}`, error);
        }
    }

    stop(soundType: SoundType): void {
        const sound = this.sounds.get(soundType);
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            
            if (soundType === SoundType.AMBIENT_MUSIC && this.currentMusic === sound) {
                this.currentMusic = null;
            }
        }
    }

    stopAll(): void {
        this.sounds.forEach((sound, type) => {
            this.stop(type);
        });
        this.currentMusic = null;
    }

    fadeOut(soundType: SoundType, duration: number = 1000): void {
        const sound = this.sounds.get(soundType);
        if (!sound) return;

        const gainNode = this.gainNodes.get(soundType);
        if (gainNode && this.audioContext) {
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
            setTimeout(() => this.stop(soundType), duration);
        } else {
            const startVolume = sound.volume;
            const fadeStep = startVolume / (duration / 50);
            
            const fadeInterval = setInterval(() => {
                if (sound.volume > fadeStep) {
                    sound.volume -= fadeStep;
                } else {
                    sound.volume = 0;
                    this.stop(soundType);
                    clearInterval(fadeInterval);
                }
            }, 50);
        }
    }

    fadeIn(soundType: SoundType, duration: number = 1000, options: { volume?: number; loop?: boolean } = {}): void {
        const sound = this.sounds.get(soundType);
        if (!sound) return;

        const targetVolume = (options.volume ?? 1) * 
            (soundType === SoundType.AMBIENT_MUSIC || soundType === SoundType.WIND 
                ? this.settings.musicVolume 
                : this.settings.effectsVolume) * 
            this.settings.masterVolume;

        const gainNode = this.gainNodes.get(soundType);
        if (gainNode && this.audioContext) {
            gainNode.gain.value = 0;
            this.play(soundType, { ...options, volume: 0 });
            gainNode.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + duration / 1000);
        } else {
            sound.volume = 0;
            this.play(soundType, { ...options, volume: 0 });
            
            const fadeStep = targetVolume / (duration / 50);
            const fadeInterval = setInterval(() => {
                if (sound.volume < targetVolume - fadeStep) {
                    sound.volume += fadeStep;
                } else {
                    sound.volume = targetVolume;
                    clearInterval(fadeInterval);
                }
            }, 50);
        }
    }

    setMasterVolume(volume: number): void {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }

    setMusicVolume(volume: number): void {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }

    setEffectsVolume(volume: number): void {
        this.settings.effectsVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }

    toggleMute(): void {
        this.settings.muted = !this.settings.muted;
        if (this.settings.muted) {
            this.stopAll();
        }
        this.saveSettings();
    }

    private updateAllVolumes(): void {
        this.sounds.forEach((sound, type) => {
            if (sound.paused) return;
            
            const baseVolume = type === SoundType.AMBIENT_MUSIC || type === SoundType.WIND 
                ? this.settings.musicVolume 
                : this.settings.effectsVolume;
            
            const volume = baseVolume * this.settings.masterVolume;
            
            if (this.gainNodes.has(type)) {
                this.gainNodes.get(type)!.gain.value = volume;
            } else {
                sound.volume = volume;
            }
        });
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

    enableAudio(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
} 