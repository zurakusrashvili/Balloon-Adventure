import * as PIXI from 'pixi.js';

export enum ScaleMode {
    COMPUTER = 'computer',
    WIDE_MOBILE = 'wideMobile',
    MOBILE = 'mobile',
    MOBILE_LANDSCAPE = 'mobileLandscape',
    WIDE_MOBILE_LANDSCAPE = 'wideMobileLandscape'
}

export interface GameDimensions {
    width: number;
    height: number;
}

export class ResponsiveManager {
    private app: PIXI.Application;
    private gameContainer: HTMLElement;
    private currentScaleMode: ScaleMode = ScaleMode.COMPUTER;
    private gameScale: number = 1;
    private isMobile: boolean = false;
    
    private dimensions: Record<ScaleMode, GameDimensions> = {
        [ScaleMode.COMPUTER]: { width: 1920, height: 1080 },
        [ScaleMode.WIDE_MOBILE]: { width: 600, height: 1000 },
        [ScaleMode.MOBILE]: { width: 375, height: 812 },
        [ScaleMode.MOBILE_LANDSCAPE]: { width: 812, height: 375 },
        [ScaleMode.WIDE_MOBILE_LANDSCAPE]: { width: 1000, height: 600 }
    };
    
    private onScaleModeChangeCallbacks: Array<(scaleMode: ScaleMode, dimensions: GameDimensions) => void> = [];

    constructor(app: PIXI.Application, gameContainer: HTMLElement) {
        this.app = app;
        this.gameContainer = gameContainer;
        
        this.setupEventListeners();
        
        this.forceResize();
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.resize();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resize();
            }, 100);
        });
    }

    private isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|MacIntel|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0) ||
               navigator.platform === 'iPad';
    }

    private determineScaleMode(): ScaleMode {
        const containerWidth = this.gameContainer.clientWidth;
        const containerHeight = this.gameContainer.clientHeight;
        const aspectRatio = containerWidth / containerHeight;
        
        const isMobileDevice = this.isMobileDevice();
        
        if (aspectRatio >= 1 && !isMobileDevice) {
            this.isMobile = false;
            return ScaleMode.COMPUTER;
        } else if (aspectRatio < 0.5) {
            this.isMobile = true;
            return ScaleMode.MOBILE;
        } else if (aspectRatio >= 0.5 && aspectRatio < 1) {
            this.isMobile = true;
            return ScaleMode.WIDE_MOBILE;
        } else if (aspectRatio >= 2 && isMobileDevice) {
            this.isMobile = true;
            return ScaleMode.MOBILE_LANDSCAPE;
        } else if (aspectRatio >= 1 && aspectRatio < 2 && isMobileDevice) {
            this.isMobile = true;
            return ScaleMode.WIDE_MOBILE_LANDSCAPE;
        }
        
        this.isMobile = false;
        return ScaleMode.COMPUTER;
    }

    public resize(): void {
        document.body.style.height = window.innerHeight + 'px';
        
        if (this.gameContainer.clientWidth === 0 || this.gameContainer.clientHeight === 0) {
            setTimeout(() => this.resize(), 16);
            return;
        }
        
        const newScaleMode = this.determineScaleMode();
        const shouldUpdateGameObjects = newScaleMode !== this.currentScaleMode;
        
        if (shouldUpdateGameObjects) {
            this.currentScaleMode = newScaleMode;
            this.notifyScaleModeChange();
        }
        
        this.resizeGame();
    }

    private resizeGame(): void {
        const containerWidth = this.gameContainer.clientWidth;
        const containerHeight = this.gameContainer.clientHeight;
        const gameDimensions = this.dimensions[this.currentScaleMode];
        
        const scaleFactor = Math.min(
            containerWidth / gameDimensions.width,
            containerHeight / gameDimensions.height
        );
        
        this.gameScale = scaleFactor;
        
        const displayWidth = gameDimensions.width * scaleFactor;
        const displayHeight = gameDimensions.height * scaleFactor;
        
        this.app.renderer.resize(gameDimensions.width, gameDimensions.height);
        
        const canvas = this.app.view as HTMLCanvasElement;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        
        canvas.style.position = 'absolute';
        canvas.style.left = '50%';
        canvas.style.top = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
    }

    private notifyScaleModeChange(): void {
        const dimensions = this.dimensions[this.currentScaleMode];
        this.onScaleModeChangeCallbacks.forEach(callback => {
            callback(this.currentScaleMode, dimensions);
        });
    }

    public onScaleModeChange(callback: (scaleMode: ScaleMode, dimensions: GameDimensions) => void): void {
        this.onScaleModeChangeCallbacks.push(callback);
    }

    public getCurrentScaleMode(): ScaleMode {
        return this.currentScaleMode;
    }

    public getCurrentDimensions(): GameDimensions {
        return this.dimensions[this.currentScaleMode];
    }

    public getGameScale(): number {
        return this.gameScale;
    }

    public isMobileMode(): boolean {
        return this.isMobile;
    }

    public isPortraitMode(): boolean {
        return this.currentScaleMode === ScaleMode.MOBILE || 
               this.currentScaleMode === ScaleMode.WIDE_MOBILE;
    }

    public isLandscapeMode(): boolean {
        return this.currentScaleMode === ScaleMode.MOBILE_LANDSCAPE || 
               this.currentScaleMode === ScaleMode.WIDE_MOBILE_LANDSCAPE;
    }

    public isComputerMode(): boolean {
        return this.currentScaleMode === ScaleMode.COMPUTER;
    }

    public forceResize(): void {
        this.resize();
    }
} 
