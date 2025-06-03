import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { Balloon } from '../components/Balloon.js';
import { Cloud, CloudLayer } from '../components/Cloud.js';
import { GameUI } from '../ui/GameUI.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { StartScreen } from '../screens/StartScreen.js';
import { GameOverScreen } from '../screens/GameOverScreen.js';
import { ResponsiveManager, ScaleMode, GameDimensions } from '../../utils/ResponsiveManager.js';

export enum GameState {
    MENU,
    PLAYING,
    LANDED,
    POPPED,
    GAME_OVER
}

export class BalloonGame {
    private app: PIXI.Application;
    private responsiveManager!: ResponsiveManager;
    private balloon!: Balloon;
    private clouds: Cloud[] = [];
    private gameUI!: GameUI;
    private particleSystem!: ParticleSystem;
    private startScreen!: StartScreen;
    private gameOverScreen!: GameOverScreen;
    
    private gameContainer!: PIXI.Container;
    private uiContainer!: PIXI.Container;
    
    private gameState: GameState = GameState.MENU;
    private score: number = 0;
    private altitude: number = 0;
    private riskLevel: number = 0;
    private gameStartTime: number = 0;
    private popTime: number = 0;
    private gameStarted: boolean = false;
    private gameRunning: boolean = false;
    
    
    private balloonStartY: number = 0;
    private balloonTargetY: number = 0;
    private balloonRisingPhase: boolean = true;
    private balloonVisualPosition: number = 0; 
    
    
    private CANVAS_WIDTH = 800;
    private CANVAS_HEIGHT = 600;
    private currentAscentSpeed: number = 0.5; 
    private currentAltitudeSpeed: number = 0.8; 
    private readonly BASE_ASCENT_SPEED = 1.5; 
    private readonly BASE_ALTITUDE_SPEED = 0.6; 
    private readonly SCORE_MULTIPLIER = 10;
    private readonly MIN_SAFE_TIME = 20000;
    private readonly MAX_GAME_TIME = 50000; 

    
    private groundStartY: number = 0;
    private ground: PIXI.Container = new PIXI.Container();
    
    
    private starField: PIXI.Container = new PIXI.Container();
    private stars: PIXI.Graphics[] = [];
    private gameLoopFunction: (() => void) | null = null; 
    
    constructor() {
        
        this.app = new PIXI.Application({
            width: this.CANVAS_WIDTH,
            height: this.CANVAS_HEIGHT,
            background: 0x87CEEB,
            antialias: true
        });
        (globalThis as any).__PIXI_APP__ = this.app; 
    }
    
    async init(): Promise<void> {
        
        
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.appendChild(this.app.view as HTMLCanvasElement);
            
            this.responsiveManager = new ResponsiveManager(this.app, gameContainer);
            this.responsiveManager.onScaleModeChange((scaleMode, dimensions) => {
                this.onScaleModeChange(scaleMode, dimensions);
            });
            
            
            this.responsiveManager.forceResize();
            
            
            const currentDimensions = this.responsiveManager.getCurrentDimensions();
            this.CANVAS_WIDTH = currentDimensions.width;
            this.CANVAS_HEIGHT = currentDimensions.height;
            
            
            this.updateResponsiveAscentSpeed();
            
        }
        
        this.setupContainers();
        this.setupScreens();
        
        
        this.showStartScreen();
        
    }
    
    private onScaleModeChange(scaleMode: ScaleMode, dimensions: GameDimensions): void {
        this.CANVAS_WIDTH = dimensions.width;
        this.CANVAS_HEIGHT = dimensions.height;
        
        this.updateResponsiveAscentSpeed();
        
        this.recreateScreens();
        
        if (this.gameStarted) {
            this.repositionGameElements();
        }
    }
    
    private recreateScreens(): void {
        
        const wasGameActive = this.gameState === GameState.PLAYING || 
                             this.gameState === GameState.LANDED || 
                             this.gameState === GameState.POPPED;
        const wasGameOver = this.gameState === GameState.GAME_OVER;
        
        
        if (this.startScreen) {
            this.app.stage.removeChild(this.startScreen);
        }
        if (this.gameOverScreen) {
            this.app.stage.removeChild(this.gameOverScreen);
        }
        
        
        this.startScreen = new StartScreen(() => this.startGame());
        this.startScreen.updateDimensions(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.startScreen.visible = false; 
        this.app.stage.addChild(this.startScreen);
        
        this.gameOverScreen = new GameOverScreen(() => this.restartGame());
        this.gameOverScreen.updateDimensions(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.gameOverScreen.visible = false; 
        this.app.stage.addChild(this.gameOverScreen);
        
        
        if (this.gameState === GameState.MENU) {
            this.startScreen.show();
            this.gameOverScreen.hide();
            this.gameContainer.visible = false;
            this.uiContainer.visible = false;
        } else if (wasGameOver) {
            this.gameOverScreen.show(this.score);
            this.startScreen.hide();
            this.gameContainer.visible = false;
            this.uiContainer.visible = false;
        } else if (wasGameActive) {
            
            this.startScreen.hide();
            this.gameOverScreen.hide();
            this.gameContainer.visible = true;
            this.uiContainer.visible = true;
        }
    }
    
    private repositionGameElements(): void {
        
        if (this.balloon && this.gameState !== GameState.LANDED && this.gameState !== GameState.POPPED) {
            const balloonScale = this.balloon.calculateResponsiveScale(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            this.balloon.setScale(balloonScale);
            
            
            this.updateBalloonStartPosition(balloonScale);
            this.balloonTargetY = this.CANVAS_HEIGHT / 2;
            
            
            this.balloon.container.x = this.CANVAS_WIDTH / 2;
            if (this.balloonRisingPhase) {
                
            } else {
                this.balloon.container.y = this.balloonTargetY;
            }
        }
        
        
        
        
        
        const groundHeight = Math.max(150, this.CANVAS_HEIGHT * 0.25);
        this.groundStartY = this.CANVAS_HEIGHT - groundHeight;
        
        
        this.createBackground();
        
        
        if (this.ground) {
            this.updateGroundGraphics(); 
            
            
            if (this.balloonRisingPhase) {
                this.ground.y = this.groundStartY;
            }
        }
        
        
        if (this.gameUI) {
            this.uiContainer.removeChild(this.gameUI.container);
            this.gameUI = new GameUI(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            this.uiContainer.addChild(this.gameUI.container);
            this.gameUI.onLandButtonClick = () => this.landBalloon();
            
            
            this.gameUI.updateScore(this.score);
            this.gameUI.updateAltitude(Math.floor(this.altitude));
            this.gameUI.updateRiskLevel(this.riskLevel);
        }
        
        
        this.clouds.forEach((cloud) => {
            cloud.updateScreenWidth(this.CANVAS_WIDTH);
            cloud.updateScreenHeight(this.CANVAS_HEIGHT);
            
            const currentX = cloud.container.x;
            const currentY = cloud.container.y;
            
            const padding = 100; 
            const xPosition = Math.max(padding, Math.min(this.CANVAS_WIDTH - padding, currentX));
            
            const layer = cloud.getLayer();
            let yPosition;
            
            if (layer <= CloudLayer.BACKGROUND) {
                const maxY = this.CANVAS_HEIGHT * 0.4;
                yPosition = Math.max(0, Math.min(maxY, currentY));
            } else {
                const minY = this.CANVAS_HEIGHT * 0.15;
                const maxY = this.CANVAS_HEIGHT * 0.75;
                yPosition = Math.max(minY, Math.min(maxY, currentY));
            }
            
            cloud.setPosition(xPosition, yPosition);
        });
        
        
        if (this.starField) {
            
            this.gameContainer.removeChild(this.starField);
            
            
            this.createStarField();
            
            
            const starFieldIndex = this.gameContainer.getChildIndex(this.balloon.container);
            this.gameContainer.addChildAt(this.starField, starFieldIndex);
            
            
            this.updateBackgroundColor();
        }
    }
    
    private setupContainers(): void {
        
        this.gameContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);
        
        
        this.uiContainer = new PIXI.Container();
        this.app.stage.addChild(this.uiContainer);
    }
    
    private setupScreens(): void {
        
        this.startScreen = new StartScreen(() => this.startGame());
        this.startScreen.updateDimensions(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.app.stage.addChild(this.startScreen);
        
        
        this.gameOverScreen = new GameOverScreen(() => this.restartGame());
        this.gameOverScreen.updateDimensions(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.app.stage.addChild(this.gameOverScreen);
    }
    
    private showStartScreen(): void {
        this.gameState = GameState.MENU;
        this.startScreen.show();
        this.gameOverScreen.hide();
        this.gameContainer.visible = false;
        this.uiContainer.visible = false;
    }
    
    private startGame(): void {
        this.gameState = GameState.PLAYING;
        this.startScreen.hide();
        this.gameContainer.visible = true;
        this.uiContainer.visible = true;
        
        if (!this.gameStarted) {
        this.setupGame();
            this.gameStarted = true;
        } else {
            this.resetGame();
        }
        
        this.gameRunning = true;
        this.startGameLoop();
    }
    
    private setupGame(): void {
        
        this.createBackground();
        
        
        this.createGround();
        
        
        this.createStarField();
        
        
        this.balloon = new Balloon(this.app);
        this.gameUI = new GameUI(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.particleSystem = new ParticleSystem();
        
        
        const balloonScale = this.balloon.calculateResponsiveScale(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.balloon.setScale(balloonScale);
        
        
        this.createClouds();
        
        
        this.gameContainer.addChild(this.ground); 
        this.gameContainer.addChild(this.starField); 
        this.gameContainer.addChild(this.balloon.container);
        this.uiContainer.addChild(this.gameUI.container);
        this.gameContainer.addChild(this.particleSystem.container);
        
        
        this.gameUI.onLandButtonClick = () => this.landBalloon();
        
        
        this.updateBalloonStartPosition(balloonScale);
        this.balloonTargetY = this.CANVAS_HEIGHT / 2;
        this.balloonRisingPhase = false; 
        
        
        const groundHeight = Math.max(150, this.CANVAS_HEIGHT * 0.25);
        this.groundStartY = this.CANVAS_HEIGHT - groundHeight;
        this.ground.y = this.groundStartY;
        
        
        this.balloon.container.x = this.CANVAS_WIDTH / 2;
        this.balloon.container.y = this.balloonStartY;
        
        
        this.resetGameState();
        
        
        if (this.starField) {
            this.starField.visible = false;
            this.starField.alpha = 0;
        }
    }
    
    private updateBalloonStartPosition(balloonScale: number): void {
        
        const balloonHeight = 120 * balloonScale; 
        this.balloonStartY = this.CANVAS_HEIGHT - balloonHeight - 50; 
    }
    
    private createBackground(): void {
        
        const existingBackground = this.gameContainer.getChildByName('gameBackground');
        if (existingBackground) {
            this.gameContainer.removeChild(existingBackground);
        }
        
        const background = new PIXI.Graphics();
        background.name = 'gameBackground'; 
        background.beginFill(0x87CEEB);
        background.drawRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        background.endFill();
        
        
        this.gameContainer.addChildAt(background, 0);
    }
    
    private createClouds(): void {
        
        
        const isMobile = this.CANVAS_WIDTH <= 768;
        const cloudMultiplier = isMobile ? 0.4 : 1.0; 
        
        const layerDistribution = [
            { layer: CloudLayer.FAR_BACKGROUND, count: Math.round(2 * cloudMultiplier) },
            { layer: CloudLayer.BACKGROUND, count: Math.round(2 * cloudMultiplier) },
            { layer: CloudLayer.MIDDLE, count: Math.round(3 * cloudMultiplier) },
            { layer: CloudLayer.FOREGROUND, count: Math.round(2 * cloudMultiplier) },
            { layer: CloudLayer.NEAR, count: Math.round(1 * cloudMultiplier) }
        ];
        
        
        layerDistribution.forEach(({ layer, count }) => {
            for (let i = 0; i < count; i++) {
                
                const padding = 100; 
                const xPosition = padding + Math.random() * (this.CANVAS_WIDTH - 2 * padding);
                
                const cloud = new Cloud(layer, xPosition);
                cloud.updateScreenWidth(this.CANVAS_WIDTH);
                cloud.updateScreenHeight(this.CANVAS_HEIGHT);
                
                
                let yPosition = -200 - Math.random() * 300;
                
                cloud.setPosition(xPosition, yPosition);
                
                
                this.setCloudAltitudeVisibility(cloud);
                
                this.clouds.push(cloud);
            }
        });
        
        
        this.clouds.sort((a, b) => a.getLayerDepth() - b.getLayerDepth());
        
        
        this.clouds.forEach(cloud => {
            this.gameContainer.addChild(cloud.container);
        });
    }
    
    private setCloudAltitudeVisibility(cloud: Cloud): void {
        const layer = cloud.getLayer();
        
        
        let appearanceAltitude = 0;
        switch (layer) {
            case CloudLayer.FAR_BACKGROUND:
                appearanceAltitude = 0; 
                break;
            case CloudLayer.BACKGROUND:
                appearanceAltitude = 50; 
                break;
            case CloudLayer.MIDDLE:
                appearanceAltitude = 100; 
                break;
            case CloudLayer.FOREGROUND:
                appearanceAltitude = 200; 
                break;
            case CloudLayer.NEAR:
                appearanceAltitude = 300; 
                break;
        }
        
        
        if (this.altitude < appearanceAltitude) {
            cloud.container.visible = false;
        }
    }
    
    private resetGame(): void {
        
        this.balloon.reset();
        
        
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        
        
        const balloonScale = this.balloon.calculateResponsiveScale(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.balloon.setScale(balloonScale);
        this.updateBalloonStartPosition(balloonScale);
        
        
        this.balloon.container.x = this.CANVAS_WIDTH / 2;
        this.balloon.container.y = this.balloonStartY;
        
        
        this.balloonRisingPhase = false;
        
        
        this.ground.y = this.groundStartY;
        
        
        this.updateResponsiveAscentSpeed();
        
        
        this.resetGameState();
        
        
        if (this.starField) {
            this.starField.visible = false;
            this.starField.alpha = 0;
        }
    }
    
    private updateGround(elapsedTime: number): void {
        
        
        const groundOffset = this.altitude * 0.8; 
        this.ground.y = this.groundStartY + groundOffset;
    }
    
    private restartGame(): void {
        this.gameOverScreen.hide();
        this.startGame();
    }
    
    private resetGameState(): void {
        this.gameState = GameState.PLAYING;
        this.score = 0;
        this.altitude = 0;
        this.balloonVisualPosition = 0; 
        this.riskLevel = 0;
        this.gameStartTime = Date.now();
        
        
        this.popTime = this.gameStartTime + this.MIN_SAFE_TIME + 
                      Math.random() * (this.MAX_GAME_TIME - this.MIN_SAFE_TIME);
        
        
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        
        this.gameUI.reset();
    }
    
    private startGameLoop(): void {
        
        if (this.gameLoopFunction) {
            this.app.ticker.remove(this.gameLoopFunction);
        }
        
        
        this.gameLoopFunction = () => this.gameLoop();
        this.app.ticker.add(this.gameLoopFunction);
    }
    
    private stopGameLoop(): void {
        if (this.gameLoopFunction) {
            this.app.ticker.remove(this.gameLoopFunction);
            this.gameLoopFunction = null;
        }
    }
    
    private gameLoop(): void {
        if (this.gameState !== GameState.PLAYING || !this.gameRunning) return;
        
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.gameStartTime;
        
        
        this.altitude += this.currentAltitudeSpeed;
        this.balloonVisualPosition += this.currentAscentSpeed; 
        this.score = Math.floor(this.altitude * this.SCORE_MULTIPLIER);
        
        
        const isMobile = this.CANVAS_WIDTH <= 768;
        const effectiveGameTime = isMobile ? this.MAX_GAME_TIME * 1.4 : this.MAX_GAME_TIME; 
        
        this.riskLevel = Math.min(elapsedTime / effectiveGameTime, 1.0);
        
        
        this.updateBalloonPosition(elapsedTime);
        
        
        this.updateGround(elapsedTime);
        
        
        this.updateClouds();
        
        
        
        
        
        
        this.particleSystem.update();
        
        
        this.gameUI.updateScore(this.score);
        this.gameUI.updateAltitude(Math.floor(this.altitude));
        this.gameUI.updateRiskLevel(this.riskLevel);
        
        
        if (currentTime >= this.popTime) {
            this.popBalloon();
        }
    }
    
    private updateBalloonPosition(elapsedTime: number): void {
        if (this.gameState !== GameState.PLAYING) return;
        
        const baseX = this.CANVAS_WIDTH / 2;
        
        const maxVisualPositionForCenter = 400; 
        const visualProgress = Math.min(this.balloonVisualPosition / maxVisualPositionForCenter, 1.0);
        
        const baseY = this.balloonStartY + 
            (this.balloonTargetY - this.balloonStartY) * visualProgress;
        
        this.balloon.setBasePosition(baseX, baseY);
        
        if (this.balloonVisualPosition >= 150) {
            this.balloon.startSwingAnimation();
        }
        
        this.balloon.updateRisk(this.riskLevel);
    }
            

    
    private updateClouds(): void {
        
        const additionalVerticalSpeed = this.currentAscentSpeed * 0.8; 
        
        
        const isMobile = this.CANVAS_WIDTH <= 768;
        const thresholdMultiplier = isMobile ? 1.5 : 1.0;
        const fadeStartAltitude = 2000 * thresholdMultiplier; 
        const fadeEndAltitude = 3000 * thresholdMultiplier;   
        
        let cloudVisibility = 1.0;
        if (this.altitude > fadeStartAltitude) {
            if (this.altitude > fadeEndAltitude) {
                cloudVisibility = 0.0; 
            } else {
                
                const fadeProgress = (this.altitude - fadeStartAltitude) / (fadeEndAltitude - fadeStartAltitude);
                cloudVisibility = 1.0 - fadeProgress;
            }
        }
        
        this.clouds.forEach(cloud => {
            
            cloud.update(additionalVerticalSpeed);
            
            
            const layer = cloud.getLayer();
            let baseSpeed = 0.5;
            switch (layer) {
                case CloudLayer.FAR_BACKGROUND:
                    baseSpeed = 0.3;
                    break;
                case CloudLayer.BACKGROUND:
                    baseSpeed = 0.4;
                    break;
                case CloudLayer.MIDDLE:
                    baseSpeed = 0.5;
                    break;
                case CloudLayer.FOREGROUND:
                    baseSpeed = 0.6;
                    break;
                case CloudLayer.NEAR:
                    baseSpeed = 0.7;
                    break;
            }
            
            
            const currentY = cloud.container.y + baseSpeed;
            cloud.container.y = currentY;
            
            
            if (currentY > this.CANVAS_HEIGHT + 100) {
                const newY = -200 - Math.random() * 300;
                const padding = 100;
                const newX = padding + Math.random() * (this.CANVAS_WIDTH - 2 * padding);
                cloud.setPosition(newX, newY);
            }
            
            cloud.container.visible = true;
            cloud.setVisibility(cloudVisibility);
        });
        
        
        this.updateBackgroundColor();
    }
    
    private updateBackgroundColor(): void {
        
        
        const isMobile = this.CANVAS_WIDTH <= 768;
        const thresholdMultiplier = isMobile ? 1.5 : 1.0; 
        
        
        const skyBlueThreshold = 600 * thresholdMultiplier;      
        const royalBlueThreshold = 1500 * thresholdMultiplier;   
        const spaceThreshold = 3000 * thresholdMultiplier;       
        
        let newColor: number;
        let starAlpha = 0;
        
        if (this.altitude < skyBlueThreshold) {
            
            const progress = this.altitude / skyBlueThreshold;
            newColor = this.interpolateColor(0x87CEEB, 0x4169E1, progress);
        } else if (this.altitude < royalBlueThreshold) {
            
            const progress = (this.altitude - skyBlueThreshold) / (royalBlueThreshold - skyBlueThreshold);
            newColor = this.interpolateColor(0x4169E1, 0x191970, progress);
        } else if (this.altitude < spaceThreshold) {
            
            const progress = (this.altitude - royalBlueThreshold) / (spaceThreshold - royalBlueThreshold);
            newColor = this.interpolateColor(0x191970, 0x0B0B2F, progress);
            
            starAlpha = progress * 0.3;
        } else {
            
            const progress = Math.min((this.altitude - spaceThreshold) / (1200 * thresholdMultiplier), 1);
            newColor = this.interpolateColor(0x0B0B2F, 0x000000, progress);
            starAlpha = 0.3 + progress * 0.7; 
        }
        
        
        if (starAlpha > 0) {
            this.starField.visible = true;
            this.starField.alpha = starAlpha;
        } else {
            this.starField.visible = false;
        }
        
        
        this.app.renderer.background.color = newColor;
        
        
        const background = this.gameContainer.getChildByName('gameBackground') as PIXI.Graphics;
        if (background) {
            background.clear();
            background.beginFill(newColor);
            background.drawRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            background.endFill();
        }
    }
    
    private interpolateColor(color1: number, color2: number, factor: number): number {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;
        
        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return (r << 16) | (g << 8) | b;
    }
    
    private landBalloon(): void {
        this.gameState = GameState.LANDED;
        this.gameRunning = false;
        this.stopGameLoop(); 
        
        this.balloon.stopAllMovementAnimations();
        
        gsap.killTweensOf(this.balloon.container);
        
        const isMobile = this.CANVAS_WIDTH <= 768;
        const isPortrait = this.CANVAS_HEIGHT > this.CANVAS_WIDTH;
        const animationDuration = isMobile ? 1.5 : 2; 
        
        this.gameUI.hideLandButton();
        
        setTimeout(() => {
            const balloonCurrentX = this.CANVAS_WIDTH / 2;
            const balloonCurrentY = this.balloon.container.y;
            
            gsap.set(this.balloon.container, {
                x: balloonCurrentX,
                rotation: 0
            });
            
            this.balloon.setBasePosition(balloonCurrentX, balloonCurrentY, true);
            
            let descentDistance = 100; 
            if (isMobile) {
                descentDistance = isPortrait ? 150 : 120; 
            }
            
            const balloonTargetY = balloonCurrentY + descentDistance;
            
            gsap.to(this.balloon.container, {
                duration: animationDuration,
                y: balloonTargetY,
                x: balloonCurrentX,
                rotation: 0,
                ease: "power2.out",
                overwrite: true,
                force3D: false,
                onUpdate: () => {
                    this.balloon.setBasePosition(balloonCurrentX, this.balloon.container.y, true);
                },
                onComplete: () => {
                    this.altitude = 0;
                    this.updateBackgroundColor(); 
                }
            });
        }, 100);
        
        gsap.to(this.ground, {
            duration: animationDuration,
            y: this.groundStartY,
            ease: "power2.out"
        });
        
        const successScreenDelay = isMobile ? 2000 : 2500; 
        
        setTimeout(() => {
            this.showSuccessScreen();
        }, successScreenDelay);
    }
    
    private popBalloon(): void {
        this.gameState = GameState.POPPED;
        this.gameRunning = false;
        this.stopGameLoop(); 
        
        
        this.particleSystem.createPopEffect(
            this.balloon.container.x,
            this.balloon.container.y
        );
        
        
        this.balloon.pop();
        
        
        this.gameUI.hideLandButton();
        
        setTimeout(() => {
            this.showGameOverScreen();
        }, 1000);
    }
    
    private showGameOverScreen(): void {
        this.gameState = GameState.GAME_OVER;
        this.gameContainer.visible = false;
        this.uiContainer.visible = false;
        this.gameOverScreen.show(this.score, false); 
    }
    
    private showSuccessScreen(): void {
        this.gameState = GameState.GAME_OVER;
        this.gameContainer.visible = false;
        this.uiContainer.visible = false;
        this.gameOverScreen.show(this.score, true); 
    }
    
    public restart(): void {
        this.restartGame();
    }
    
    public destroy(): void {
        this.app.destroy(true);
    }

    public get gameWidth(): number {
        return this.CANVAS_WIDTH;
    }

    public get gameHeight(): number {
        return this.CANVAS_HEIGHT;
    }

    public get ascentSpeed(): number {
        return this.currentAscentSpeed;
    }

    public get currentAltitude(): number {
        return this.altitude;
    }

    private createGround(): void {
        this.ground = new PIXI.Container();
        
        
        this.updateGroundGraphics();
    }
    
    private updateGroundGraphics(): void {
        
        this.ground.removeChildren();
        
        
        const texture = PIXI.Texture.from('/Balloon-Adventure/assets/images/land.png');
        const landSprite = new PIXI.Sprite(texture);
        
        
        const intendedGroundHeight = Math.max(150, this.CANVAS_HEIGHT * 0.25); 
        
        
        const scaleToFitWidth = this.CANVAS_WIDTH / texture.width;
        const scaledHeight = texture.height * scaleToFitWidth;
        
        
        landSprite.width = this.CANVAS_WIDTH;
        landSprite.height = scaledHeight;
        
        
        landSprite.x = 0; 
        landSprite.y = intendedGroundHeight - scaledHeight; 
        
        
        this.ground.addChild(landSprite);
    }

    private updateResponsiveAscentSpeed(): void {
        const screenWidth = this.CANVAS_WIDTH;
        const screenHeight = this.CANVAS_HEIGHT;
        const screenArea = screenWidth * screenHeight;
        
        
        const isMobile = screenWidth <= 768;
        const isTablet = screenWidth > 768 && screenWidth <= 1024;
        const isDesktop = screenWidth > 1024;
        
        
        let deviceMultiplier = 1.0;
        if (isMobile) {
            
            deviceMultiplier = 0.5; 
        } else if (isTablet) {
            
            deviceMultiplier = 0.75; 
        } else if (isDesktop) {
            
            deviceMultiplier = 1.0;
        }
        
        
        let sizeMultiplier = 1.0;
        const baseArea = 800 * 600; 
        const areaRatio = screenArea / baseArea;
        
        if (areaRatio > 2.0) {
            
            sizeMultiplier = 1.4;
        } else if (areaRatio > 1.5) {
            
            sizeMultiplier = 1.2;
        } else if (areaRatio > 1.0) {
            
            sizeMultiplier = 1.1;
        } else if (areaRatio < 0.5) {
            
            sizeMultiplier = 0.6;
        } else if (areaRatio < 0.8) {
            
            sizeMultiplier = 0.8;
        }
        
        
        const aspectRatio = screenWidth / screenHeight;
        let aspectMultiplier = 1.0;
        if (aspectRatio > 2.0) {
            
            aspectMultiplier = 1.15;
        } else if (aspectRatio > 1.6) {
            
            aspectMultiplier = 1.05;
        } else if (aspectRatio < 0.8) {
            
            aspectMultiplier = 0.9;
        }
        
        
        let performanceMultiplier = 1.0;
        if (screenArea > 2073600) { 
            performanceMultiplier = 0.95;
        }
        
        
        this.currentAscentSpeed = this.BASE_ASCENT_SPEED * 
                                 deviceMultiplier * 
                                 sizeMultiplier * 
                                 aspectMultiplier * 
                                 performanceMultiplier;
        
        
        this.currentAltitudeSpeed = this.BASE_ALTITUDE_SPEED * 
                                   deviceMultiplier * 
                                   sizeMultiplier * 
                                   aspectMultiplier * 
                                   performanceMultiplier;
        
        
        this.currentAscentSpeed = Math.max(0.4, Math.min(2.0, this.currentAscentSpeed));
        this.currentAltitudeSpeed = Math.max(0.2, Math.min(1.2, this.currentAltitudeSpeed));
        
    }

    private createStarField(): void {
        this.starField = new PIXI.Container();
        this.stars = [];
        
        
        const starCount = 200; 
        
        for (let i = 0; i < starCount; i++) {
            const star = new PIXI.Graphics();
            
            
            const size = Math.random() * 2 + 0.5; 
            const brightness = Math.random() * 0.8 + 0.2; 
            const twinkle = Math.random() > 0.7; 
            
            
            star.beginFill(0xFFFFFF, brightness);
            star.drawCircle(0, 0, size);
            star.endFill();
            
            
            star.x = Math.random() * this.CANVAS_WIDTH;
            star.y = Math.random() * this.CANVAS_HEIGHT;
            
            
            if (twinkle) {
                gsap.to(star, {
                    duration: 1 + Math.random() * 2, 
                    alpha: brightness * 0.3,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut",
                    delay: Math.random() * 2 
                });
            }
            
            this.stars.push(star);
            this.starField.addChild(star);
        }
        
        
        this.starField.alpha = 0;
        this.starField.visible = false;
    }
} 
