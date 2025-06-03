import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class GameUI {
    public container: PIXI.Container;
    public onLandButtonClick: (() => void) | null = null;
    public onMuteToggle: (() => void) | null = null;
    
    private scoreText!: PIXI.Text;
    private altitudeText!: PIXI.Text;
    private riskMeter!: PIXI.Graphics;
    private riskMeterFill!: PIXI.Graphics;
    private landButton!: PIXI.Container;
    private landButtonText!: PIXI.Text;
    private gameOverContainer!: PIXI.Container;
    private muteButton!: PIXI.Container;
    private muteIcon!: PIXI.Text;
    private isMuted: boolean = false;
    
    constructor(private canvasWidth: number, private canvasHeight: number) {
        this.container = new PIXI.Container();
        
        this.createScoreDisplay();
        this.createAltitudeDisplay();
        this.createRiskMeter();
        this.createMuteButton();
        this.createLandButton();
        this.createGameOverScreen();
    }
    
    private createScoreDisplay(): void {
        this.scoreText = new PIXI.Text('Score: 0', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 2,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2
        });
        
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.container.addChild(this.scoreText);
    }
    
    private createAltitudeDisplay(): void {
        this.altitudeText = new PIXI.Text('Altitude: 0m', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 2,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2
        });
        
        this.altitudeText.x = 20;
        this.altitudeText.y = 50;
        this.container.addChild(this.altitudeText);
    }
    
    private createRiskMeter(): void {
        
        this.riskMeter = new PIXI.Graphics();
        this.riskMeter.beginFill(0x333333, 0.8);
        this.riskMeter.drawRect(0, 0, 200, 20);
        this.riskMeter.endFill();
        this.riskMeter.lineStyle(2, 0xFFFFFF);
        this.riskMeter.drawRect(0, 0, 200, 20);
        
        this.riskMeter.x = this.canvasWidth - 220;
        this.riskMeter.y = 20;
        this.container.addChild(this.riskMeter);
        
        
        this.riskMeterFill = new PIXI.Graphics();
        this.riskMeterFill.x = this.canvasWidth - 218;
        this.riskMeterFill.y = 22;
        this.container.addChild(this.riskMeterFill);
        
        
        const riskLabel = new PIXI.Text('DANGER', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 1
        });
        riskLabel.x = this.canvasWidth - 220;
        riskLabel.y = 45;
        this.container.addChild(riskLabel);
    }

    private createMuteButton(): void {
        this.muteButton = new PIXI.Container();
        
        const buttonBg = new PIXI.Graphics();
        buttonBg.beginFill(0x333333, 0.8);
        buttonBg.drawCircle(0, 0, 20);
        buttonBg.endFill();
        buttonBg.lineStyle(2, 0xFFFFFF, 0.8);
        buttonBg.drawCircle(0, 0, 20);
        
        this.muteIcon = new PIXI.Text('🔊', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF
        });
        this.muteIcon.anchor.set(0.5);
        
        this.muteButton.addChild(buttonBg);
        this.muteButton.addChild(this.muteIcon);
        
        this.muteButton.x = this.canvasWidth - 50;
        this.muteButton.y = 70;
        
        this.muteButton.interactive = true;
        this.muteButton.cursor = 'pointer';
        
        this.muteButton.on('pointerover', () => {
            buttonBg.tint = 0xCCCCCC;
            gsap.to(this.muteButton.scale, {
                duration: 0.1,
                x: 1.1,
                y: 1.1
            });
        });
        
        this.muteButton.on('pointerout', () => {
            buttonBg.tint = 0xFFFFFF;
            gsap.to(this.muteButton.scale, {
                duration: 0.1,
                x: 1,
                y: 1
            });
        });
        
        this.muteButton.on('pointerup', () => {
            this.toggleMute();
            if (this.onMuteToggle) {
                this.onMuteToggle();
            }
        });
        
        this.container.addChild(this.muteButton);
    }
    
    private createLandButton(): void {
        this.landButton = new PIXI.Container();
        
        
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.3);
        shadow.drawRoundedRect(6, 8, 160, 65, 32);
        shadow.endFill();
        shadow.filters = [new PIXI.filters.BlurFilter(4)];
        
        
        const buttonBg = new PIXI.Graphics();
        
        
        buttonBg.beginFill(0x2E7D32); 
        buttonBg.drawRoundedRect(0, 0, 160, 65, 32);
        buttonBg.endFill();
        
        buttonBg.beginFill(0x4CAF50, 0.8); 
        buttonBg.drawRoundedRect(3, 3, 154, 59, 29);
        buttonBg.endFill();
        
        buttonBg.beginFill(0x66BB6A, 0.6); 
        buttonBg.drawRoundedRect(6, 6, 148, 30, 26);
        buttonBg.endFill();
        
        
        const highlight = new PIXI.Graphics();
        highlight.beginFill(0xFFFFFF, 0.2);
        highlight.drawRoundedRect(12, 12, 136, 18, 18);
        highlight.endFill();
        
        
        const glow = new PIXI.Graphics();
        glow.lineStyle(8, 0x4CAF50, 0.3);
        glow.drawRoundedRect(-6, -6, 172, 77, 38);
        glow.filters = [new PIXI.filters.BlurFilter(6)];
        
        
        this.landButtonText = new PIXI.Text('🚁 LAND NOW!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
            stroke: 0x2E7D32,
            strokeThickness: 2,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 3,
            dropShadowAngle: Math.PI / 4,
            dropShadowDistance: 2
        });
        
        
        this.landButtonText.x = (160 - this.landButtonText.width) / 2;
        this.landButtonText.y = (65 - this.landButtonText.height) / 2;
        
        
        this.landButton.addChild(shadow);
        this.landButton.addChild(glow);
        this.landButton.addChild(buttonBg);
        this.landButton.addChild(highlight);
        this.landButton.addChild(this.landButtonText);
        
        
        this.landButton.pivot.set(80, 32.5); 
        
        
        const isMobile = this.canvasWidth <= 768;
        const isPortrait = this.canvasHeight > this.canvasWidth;
        
        
        this.landButton.x = this.canvasWidth / 2;
        
        if (isMobile) {
            
            this.landButton.y = this.canvasHeight - (isPortrait ? 70 : 60);
        } else {
            this.landButton.y = this.canvasHeight - 55;
        }
        
        
        this.landButton.interactive = true;
        this.landButton.cursor = 'pointer';
        
        
        if (isMobile) {
            
            this.landButton.on('pointerdown', () => {
                buttonBg.tint = 0xCCE8CC;
                
                gsap.to(this.landButton.scale, {
                    duration: 0.1,
                    x: 0.95,
                    y: 0.95,
                    ease: "power2.out"
                });
            });
            
            this.landButton.on('pointerup', () => {
                buttonBg.tint = 0xE8F5E8;
                
                gsap.to(this.landButton.scale, {
                    duration: 0.2,
                    x: 1,
                    y: 1,
                    ease: "back.out(1.7)"
                });
                
                if (this.onLandButtonClick) {
                    this.onLandButtonClick();
                }
            });
            
            this.landButton.on('pointerupoutside', () => {
                
                buttonBg.tint = 0xFFFFFF;
                gsap.to(this.landButton.scale, {
                    duration: 0.2,
                    x: 1,
                    y: 1,
                    ease: "power2.out"
                });
            });
        } else {
            
            this.landButton.on('pointerover', () => {
                buttonBg.tint = 0xE8F5E8;
            });
            
            this.landButton.on('pointerout', () => {
                buttonBg.tint = 0xFFFFFF;
            });
            
            this.landButton.on('pointerdown', () => {
                buttonBg.tint = 0xCCE8CC;
            });
            
            this.landButton.on('pointerup', () => {
                buttonBg.tint = 0xE8F5E8;
                
                if (this.onLandButtonClick) {
                    this.onLandButtonClick();
                }
            });
        }
        
        
        gsap.to(glow, {
            duration: 1.5,
            alpha: 0.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
        
        this.container.addChild(this.landButton);
    }
    
    private createGameOverScreen(): void {
        this.gameOverContainer = new PIXI.Container();
        this.gameOverContainer.visible = false;
        
        
        const overlay = new PIXI.Graphics();
        overlay.beginFill(0x000000, 0.7);
        overlay.drawRect(0, 0, this.canvasWidth, this.canvasHeight);
        overlay.endFill();
        this.gameOverContainer.addChild(overlay);
        
        
        const panel = new PIXI.Graphics();
        panel.beginFill(0xFFFFFF, 0.95);
        panel.drawRoundedRect(0, 0, 400, 300, 20);
        panel.endFill();
        panel.lineStyle(3, 0x333333);
        panel.drawRoundedRect(0, 0, 400, 300, 20);
        
        panel.x = (this.canvasWidth - 400) / 2;
        panel.y = (this.canvasHeight - 300) / 2;
        this.gameOverContainer.addChild(panel);
        
        this.container.addChild(this.gameOverContainer);
    }
    
    public updateScore(score: number): void {
        this.scoreText.text = `Score: ${score}`;
    }
    
    public updateAltitude(altitude: number): void {
        this.altitudeText.text = `Altitude: ${altitude}m`;
    }
    
    public updateRiskLevel(riskLevel: number): void {
        this.riskMeterFill.clear();
        
        
        const fillWidth = 196 * riskLevel;
        
        
        let fillColor = 0x4CAF50; 
        if (riskLevel > 0.3) fillColor = 0xFFC107; 
        if (riskLevel > 0.6) fillColor = 0xFF9800; 
        if (riskLevel > 0.8) fillColor = 0xF44336; 
        
        this.riskMeterFill.beginFill(fillColor, 0.8);
        this.riskMeterFill.drawRect(0, 0, fillWidth, 16);
        this.riskMeterFill.endFill();
        
        
        if (riskLevel > 0.8) {
            const flash = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
            this.riskMeterFill.alpha = flash;
        }
    }
    
    public hideLandButton(): void {
        gsap.to(this.landButton, {
            duration: 0.3,
            alpha: 0,
            scale: 0,
            ease: "back.in"
        });
    }
    
    public showGameOver(success: boolean, score: number, altitude: number): void {
        this.gameOverContainer.visible = true;
        
        
        while (this.gameOverContainer.children.length > 2) {
            this.gameOverContainer.removeChildAt(2);
        }
        
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        
        const title = new PIXI.Text(success ? '🎉 SAFE LANDING!' : '💥 BALLOON POPPED!', {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: success ? 0x4CAF50 : 0xF44336,
            fontWeight: 'bold'
        });
        title.anchor.set(0.5);
        title.x = centerX;
        title.y = centerY - 80;
        this.gameOverContainer.addChild(title);
        
        
        const scoreText = new PIXI.Text(`Final Score: ${score}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x333333
        });
        scoreText.anchor.set(0.5);
        scoreText.x = centerX;
        scoreText.y = centerY - 30;
        this.gameOverContainer.addChild(scoreText);
        
        
        const altitudeText = new PIXI.Text(`Max Altitude: ${altitude}m`, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0x666666
        });
        altitudeText.anchor.set(0.5);
        altitudeText.x = centerX;
        altitudeText.y = centerY;
        this.gameOverContainer.addChild(altitudeText);
        
        
        const playAgainButton = new PIXI.Container();
        const buttonBg = new PIXI.Graphics();
        buttonBg.beginFill(0x2196F3, 0.9);
        buttonBg.drawRoundedRect(0, 0, 150, 50, 25);
        buttonBg.endFill();
        buttonBg.lineStyle(3, 0x1976D2);
        buttonBg.drawRoundedRect(0, 0, 150, 50, 25);
        
        const buttonText = new PIXI.Text('PLAY AGAIN', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        buttonText.x = (150 - buttonText.width) / 2;
        buttonText.y = (50 - buttonText.height) / 2;
        
        playAgainButton.addChild(buttonBg);
        playAgainButton.addChild(buttonText);
        playAgainButton.x = centerX - 75;
        playAgainButton.y = centerY + 50;
        
        playAgainButton.interactive = true;
        
        playAgainButton.on('pointerup', () => {            
            window.location.reload();
        });
        
        this.gameOverContainer.addChild(playAgainButton);
        
        
        this.gameOverContainer.alpha = 0;
        gsap.to(this.gameOverContainer, {
            duration: 0.5,
            alpha: 1,
            ease: "power2.out"
        });
    }

    public toggleMute(): void {
        this.isMuted = !this.isMuted;
        this.updateMuteIcon();
    }

    public setMuteState(muted: boolean): void {
        this.isMuted = muted;
        this.updateMuteIcon();
    }

    private updateMuteIcon(): void {
        this.muteIcon.text = this.isMuted ? '🔇' : '🔊';
    }
    
    public reset(): void {
        this.gameOverContainer.visible = false;
        this.landButton.visible = true;
        this.landButton.alpha = 1;
        this.landButton.scale.set(1);
        
        
        this.riskMeterFill.clear();
    }
} 
