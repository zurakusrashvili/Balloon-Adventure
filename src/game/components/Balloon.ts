import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class Balloon {
    public container: PIXI.Container;
    private balloon!: PIXI.Graphics;
    private bunny!: PIXI.Graphics;
    private basket!: PIXI.Graphics;
    private rope!: PIXI.Graphics;
    
    private swayTween: gsap.core.Tween | null = null;
    private swayAnimationStarted: boolean = false;
    private initialY: number;
    
    private windTween: gsap.core.Tween | null = null;
    private bobbingTween: gsap.core.Tween | null = null;
    private dangerShakeTween: gsap.core.Tween | null = null;
    private baseX: number = 0;
    private baseY: number = 0;
    private windOffset: number = 0;
    private currentRiskLevel: number = 0;
    
    constructor(private app: PIXI.Application) {
        this.container = new PIXI.Container();
        this.initialY = this.app.screen.height - 150;
        
        this.createBalloon();
        this.createBunny();
        this.createBasket();
        this.createRope();
        
        this.reset();
    }
    
    private createBalloon(): void {
        this.balloon = new PIXI.Graphics();
        
        this.balloon.beginFill(0xFF6B6B);
        this.balloon.drawCircle(0, 0, 40);
        this.balloon.endFill();
        
        this.balloon.beginFill(0xFFAAAA, 0.6);
        this.balloon.drawCircle(-10, -10, 15);
        this.balloon.endFill();
        
        this.balloon.beginFill(0xCC5555);
        this.balloon.moveTo(0, 40);
        this.balloon.lineTo(-5, 50);
        this.balloon.lineTo(5, 50);
        this.balloon.lineTo(0, 40);
        this.balloon.endFill();
        
        this.container.addChild(this.balloon);
    }
    
    private createBunny(): void {
        this.bunny = new PIXI.Graphics();
        
        this.bunny.beginFill(0xF5F5DC); 
        this.bunny.drawCircle(0, 0, 8);
        this.bunny.endFill();
        
        this.bunny.beginFill(0xF5F5DC);
        this.bunny.drawEllipse(-4, -8, 3, 8);
        this.bunny.drawEllipse(4, -8, 3, 8);
        this.bunny.endFill();
        
        this.bunny.beginFill(0xFFB6C1); 
        this.bunny.drawEllipse(-4, -8, 1.5, 4);
        this.bunny.drawEllipse(4, -8, 1.5, 4);
        this.bunny.endFill();
        
        this.bunny.beginFill(0x000000);
        this.bunny.drawCircle(-3, -2, 1.5);
        this.bunny.drawCircle(3, -2, 1.5);
        this.bunny.endFill();
        
        this.bunny.beginFill(0xFFB6C1);
        this.bunny.drawCircle(0, 1, 1);
        this.bunny.endFill();
        
        this.bunny.y = 55; 
        this.container.addChild(this.bunny);
    }
    
    private createBasket(): void {
        this.basket = new PIXI.Graphics();
        
        this.basket.beginFill(0x8B4513); 
        this.basket.drawRect(-15, 0, 30, 20);
        this.basket.endFill();
        
        this.basket.beginFill(0x654321); 
        for (let i = 0; i < 3; i++) {
            this.basket.drawRect(-15, i * 7, 30, 2);
        }
        this.basket.endFill();
        
        this.basket.beginFill(0x654321);
        this.basket.drawRect(-16, -2, 32, 4);
        this.basket.endFill();
        
        this.basket.y = 60;
        this.container.addChild(this.basket);
    }
    
    private createRope(): void {
        this.rope = new PIXI.Graphics();
        
        const ropePositions = [
            { balloonX: -25, balloonY: 35, basketX: -12, basketY: 60 },
            { balloonX: 25, balloonY: 35, basketX: 12, basketY: 60 },
            { balloonX: -15, balloonY: 40, basketX: -8, basketY: 60 },
            { balloonX: 15, balloonY: 40, basketX: 8, basketY: 60 }
        ];
        
        this.rope.lineStyle(2, 0x8B4513);
        ropePositions.forEach(pos => {
            this.rope.moveTo(pos.balloonX, pos.balloonY);
            this.rope.lineTo(pos.basketX, pos.basketY);
        });
        
        this.container.addChild(this.rope);
    }
    
    private startSwayAnimation(): void {
        const swingAngle = 0.05 + Math.random() * 0.08; 
        const swingDistance = 8 + Math.random() * 12; 
        const duration = 2.5 + Math.random() * 2; 
        
        this.swayTween = gsap.to(this.container, {
            duration: duration,
            x: `+=${swingDistance}`,
            rotation: swingAngle,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            onComplete: () => {
                if (this.swayTween) {
                    const newDuration = 2 + Math.random() * 3; 
                    const newAngle = 0.03 + Math.random() * 0.1; 
                    const newDistance = 6 + Math.random() * 15; 
                    
                    this.swayTween.duration(newDuration);
                    this.swayTween.vars.rotation = newAngle;
                    this.swayTween.vars.x = `+=${newDistance}`;
                }
            }
        });
    }
    
    public update(altitude: number, riskLevel: number): void {
        this.container.y = this.initialY - altitude;
        this.updateRisk(riskLevel);
    }
    
    public updateRisk(riskLevel: number): void {
        this.currentRiskLevel = riskLevel;
        
        const riskColor = this.interpolateColor(0xFF6B6B, 0xFF0000, riskLevel);
        this.balloon.clear();
        
        this.balloon.beginFill(riskColor);
        this.balloon.drawCircle(0, 0, 40);
        this.balloon.endFill();
        
        this.balloon.beginFill(0xFFAAAA, 0.6);
        this.balloon.drawCircle(-10, -10, 15);
        this.balloon.endFill();
        
        this.balloon.beginFill(this.darkenColor(riskColor, 0.2));
        this.balloon.moveTo(0, 40);
        this.balloon.lineTo(-5, 50);
        this.balloon.lineTo(5, 50);
        this.balloon.lineTo(0, 40);
        this.balloon.endFill();
        
        this.updateDangerEffects(riskLevel);
    }
    
    private updateDangerEffects(riskLevel: number): void {
        const wasInDanger = this.currentRiskLevel >= 0.6;
        const isNowInDanger = riskLevel >= 0.6;
        
        if (this.dangerShakeTween) {
            this.dangerShakeTween.kill();
            this.dangerShakeTween = null;
        }
        
        if (isNowInDanger) {
            let shakeIntensity: number;
            let shakeFrequency: number;
            
            if (riskLevel < 0.8) {
                shakeIntensity = (riskLevel - 0.6) * 15;
                shakeFrequency = 0.1 + (riskLevel - 0.6) * 0.15;
                
                this.dangerShakeTween = gsap.to(this.container, {
                    duration: shakeFrequency,
                    x: this.baseX + (Math.random() - 0.5) * shakeIntensity,
                    y: this.baseY + (Math.random() - 0.5) * shakeIntensity * 0.5,
                    ease: "power2.inOut",
                    repeat: -1,
                    yoyo: false,
                    onRepeat: () => {
                        if (this.dangerShakeTween) {
                            gsap.set(this.dangerShakeTween, {
                                x: this.baseX + (Math.random() - 0.5) * shakeIntensity,
                                y: this.baseY + (Math.random() - 0.5) * shakeIntensity * 0.5
                            });
                        }
                    }
                });
            } else if (riskLevel < 0.9) {
                shakeIntensity = 3 + (riskLevel - 0.8) * 50;
                shakeFrequency = 0.03 + (riskLevel - 0.8) * 0.02;
                
                this.dangerShakeTween = gsap.to(this.container, {
                    duration: shakeFrequency,
                    x: this.baseX + (Math.random() - 0.5) * shakeIntensity,
                    y: this.baseY + (Math.random() - 0.5) * shakeIntensity * 0.7,
                    rotation: (Math.random() - 0.5) * 0.1,
                    ease: "power2.inOut",
                    repeat: -1,
                    yoyo: false,
                    onRepeat: () => {
                        if (this.dangerShakeTween) {
                            const newIntensity = 3 + (riskLevel - 0.8) * 50;
                            gsap.set(this.dangerShakeTween, {
                                x: this.baseX + (Math.random() - 0.5) * newIntensity,
                                y: this.baseY + (Math.random() - 0.5) * newIntensity * 0.7,
                                rotation: (Math.random() - 0.5) * 0.1
                            });
                        }
                    }
                });
            } else {
                shakeIntensity = 8 + (riskLevel - 0.9) * 70;
                shakeFrequency = 0.02;
                
                this.dangerShakeTween = gsap.to(this.container, {
                    duration: shakeFrequency,
                    x: this.baseX + (Math.random() - 0.5) * shakeIntensity,
                    y: this.baseY + (Math.random() - 0.5) * shakeIntensity,
                    rotation: (Math.random() - 0.5) * 0.15,
                    scaleX: 1 + (Math.random() - 0.5) * 0.05,
                    scaleY: 1 + (Math.random() - 0.5) * 0.05,
                    ease: "power2.inOut",
                    repeat: -1,
                    yoyo: false,
                    onRepeat: () => {
                        if (this.dangerShakeTween) {
                            const extremeIntensity = 8 + (riskLevel - 0.9) * 70;
                            gsap.set(this.dangerShakeTween, {
                                x: this.baseX + (Math.random() - 0.5) * extremeIntensity,
                                y: this.baseY + (Math.random() - 0.5) * extremeIntensity,
                                rotation: (Math.random() - 0.5) * 0.15,
                                scaleX: 1 + (Math.random() - 0.5) * 0.05,
                                scaleY: 1 + (Math.random() - 0.5) * 0.05
                            });
                        }
                    }
                });
            }
        } else if (wasInDanger && !isNowInDanger) {
            const currentX = this.container.x;
            const currentY = this.container.y;
            
            this.baseX = currentX - this.windOffset;
            this.baseY = currentY;
            
            gsap.to(this.container, {
                duration: 0.3,
                x: this.baseX + this.windOffset,
                y: this.baseY,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                ease: "power2.out"
            });
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
    
    private darkenColor(color: number, factor: number): number {
        const r = ((color >> 16) & 0xFF) * (1 - factor);
        const g = ((color >> 8) & 0xFF) * (1 - factor);
        const b = (color & 0xFF) * (1 - factor);
        
        return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
    }
    
    public pop(): void {
        this.stopAllMovementAnimations();
        
        this.balloon.clear();
        
        const scale = this.container.scale.x;
        const isMobile = this.app.screen.width <= 768;
        const responsiveMultiplier = isMobile ? 1.5 : 1.0;
        
        const popParticleCount = isMobile ? 12 : 15;
        const particleSize = Math.max(3, 4 * scale * responsiveMultiplier);
        const spreadDistance = Math.max(150, 200 * scale * responsiveMultiplier);
        const fallDistance = Math.max(200, 300 * scale * responsiveMultiplier);
        
        for (let i = 0; i < popParticleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0xFF6B6B);
            particle.drawRect(0, 0, particleSize, particleSize);
            particle.endFill();
            
            const initialSpread = 20 * scale;
            particle.x = (Math.random() - 0.5) * initialSpread;
            particle.y = (Math.random() - 0.5) * initialSpread;
            
            this.container.addChild(particle);
            
            gsap.to(particle, {
                duration: isMobile ? 1.2 : 1.5,
                x: particle.x + (Math.random() - 0.5) * spreadDistance,
                y: particle.y + Math.random() * (fallDistance * 0.5) + (fallDistance * 0.5),
                alpha: 0,
                rotation: Math.random() * Math.PI * 2,
                ease: "power2.out",
                force3D: false,
                onComplete: () => {
                    if (this.container.children.includes(particle)) {
                        this.container.removeChild(particle);
                    }
                }
            });
        }
        
        const balloonScale = 40 * scale;
        const crackScale = scale;
        
        this.balloon.beginFill(0x000000, 0.3);
        this.balloon.drawCircle(0, 0, balloonScale * 1.05);
        this.balloon.endFill();
        
        this.balloon.beginFill(0x444444, 0.7);
        this.balloon.drawCircle(0, 0, balloonScale * 0.95);
        this.balloon.endFill();
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const length = (35 + Math.random() * 15) * crackScale;
            const startX = Math.cos(angle) * (20 * crackScale);
            const startY = Math.sin(angle) * (20 * crackScale);
            const endX = Math.cos(angle) * length;
            const endY = Math.sin(angle) * length;
            
            this.balloon.lineStyle((2 + Math.random() * 2) * crackScale, 0x333333, 0.8);
            this.balloon.moveTo(startX, startY);
            this.balloon.lineTo(endX, endY);
        }
        
        gsap.to(this.balloon, {
            duration: 2,
            alpha: 0.3,
            ease: "power2.out",
            force3D: false
        });
        
        gsap.to([this.basket, this.bunny, this.rope], {
            duration: isMobile ? 2.5 : 3,
            y: `+=${fallDistance}`,
            rotation: Math.random() * 0.3 - 0.15,
            ease: "power2.in",
            force3D: false,
            overwrite: true
        });
    }
    
    public reset(): void {
        if (this.swayTween) {
            this.swayTween.kill();
            this.swayTween = null;
        }
        if (this.windTween) {
            this.windTween.kill();
            this.windTween = null;
        }
        if (this.bobbingTween) {
            this.bobbingTween.kill();
            this.bobbingTween = null;
        }
        if (this.dangerShakeTween) {
            this.dangerShakeTween.kill();
            this.dangerShakeTween = null;
        }
        
        gsap.killTweensOf([this.container, this, this.balloon, this.basket, this.bunny, this.rope]);
        
        this.container.x = 0;
        this.container.y = this.initialY;
        this.container.rotation = 0;
        this.container.scale.set(1, 1);
        
        this.balloon.x = 0;
        this.balloon.y = 0;
        this.balloon.rotation = 0;
        this.balloon.scale.set(1, 1);
        
        this.basket.x = 0;
        this.basket.y = 60;
        this.basket.rotation = 0;
        this.basket.scale.set(1, 1);
        
        this.bunny.x = 0;
        this.bunny.y = 55;
        this.bunny.rotation = 0;
        this.bunny.scale.set(1, 1);
        
        this.rope.x = 0;
        this.rope.y = 0;
        this.rope.rotation = 0;
        this.rope.scale.set(1, 1);
        
        this.balloon.alpha = 1;
        this.basket.alpha = 1;
        this.bunny.alpha = 1;
        this.rope.alpha = 1;
        
        this.swayAnimationStarted = false;
        
        this.recreateBalloonGraphics();
    }
    
    private recreateBalloonGraphics(): void {
        this.container.removeChild(this.balloon);
        
        this.balloon = new PIXI.Graphics();
        this.balloon.beginFill(0xFF6B6B);
        this.balloon.drawCircle(0, 0, 40);
        this.balloon.endFill();
        
        this.balloon.beginFill(0xFFAAAA, 0.6);
        this.balloon.drawCircle(-10, -10, 15);
        this.balloon.endFill();
        
        this.balloon.beginFill(0xCC5555);
        this.balloon.moveTo(0, 40);
        this.balloon.lineTo(-5, 50);
        this.balloon.lineTo(5, 50);
        this.balloon.lineTo(0, 40);
        this.balloon.endFill();
        
        this.container.addChildAt(this.balloon, 0); 
    }
    
    public startSwingAnimation(): void {
        if (!this.swayAnimationStarted) {
            this.swayAnimationStarted = true;
            this.startSwayAnimation();
            this.startWindEffect();
            this.startBobbing();
        }
    }
    
    private startWindEffect(): void {
        const windCycleDuration = 8 + Math.random() * 6;
        const windStrength = 5 + Math.random() * 10;
        
        this.windTween = gsap.to(this, {
            duration: windCycleDuration,
            windOffset: windStrength,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (this.currentRiskLevel < 0.6) {
                    gsap.set(this.container, {
                        x: this.baseX + this.windOffset
                    });
                }
            }
        });
    }
    
    private startBobbing(): void {
        const bobCycleDuration = 3 + Math.random() * 2;
        const bobHeight = 2 + Math.random() * 3;
        
        this.bobbingTween = gsap.to(this.container, {
            duration: bobCycleDuration,
            y: `+=${bobHeight}`,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                this.baseY = this.container.y;
            }
        });
    }
    
    public setBasePosition(x: number, y: number, immediate: boolean = false): void {
        const oldBaseX = this.baseX;
        const oldBaseY = this.baseY;
        
        this.baseX = x;
        this.baseY = y;
        
        if (immediate || this.currentRiskLevel >= 0.6) {
            return;
        }
        
        if (this.currentRiskLevel < 0.6) {
            if (oldBaseX !== x || oldBaseY !== y) {
                gsap.to(this.container, {
                    duration: 0.1,
                    x: this.baseX + this.windOffset,
                    y: this.baseY,
                    ease: "none"
                });
            }
        }
    }

    public stopAllMovementAnimations(): void {
        if (this.swayTween) {
            this.swayTween.kill();
            this.swayTween = null;
        }
        if (this.windTween) {
            this.windTween.kill();
            this.windTween = null;
        }
        if (this.bobbingTween) {
            this.bobbingTween.kill();
            this.bobbingTween = null;
        }
        if (this.dangerShakeTween) {
            this.dangerShakeTween.kill();
            this.dangerShakeTween = null;
        }
        
        gsap.killTweensOf([this.container, this, this.balloon, this.basket, this.bunny, this.rope]);
        
        this.windOffset = 0;
        this.currentRiskLevel = 0;
        this.swayAnimationStarted = false;
        
        this.container.rotation = 0;
        this.balloon.rotation = 0;
        this.basket.rotation = 0;
        this.bunny.rotation = 0;
        this.rope.rotation = 0;
    }

    public setScale(scale: number): void {
        this.container.scale.set(scale, scale);
    }

    public calculateResponsiveScale(canvasWidth: number, canvasHeight: number): number {
        const baseWidth = 800; 
        const baseHeight = 600; 
        
        const isMobile = canvasWidth <= 600 || canvasHeight <= 600;
        const isWideScreen = canvasWidth > 1400;
        const isLandscape = canvasWidth > canvasHeight;
        
        const widthScale = canvasWidth / baseWidth;
        const heightScale = canvasHeight / baseHeight;
        let scale = Math.min(widthScale, heightScale);
        
        if (isMobile) {
            if (isLandscape) {
                scale *= 2.2;
            } else {
                scale *= 2.5;
            }
        } else if (isWideScreen) {
            scale *= 3.2;
        } else {
            if (isLandscape) {
                scale *= 1.3;
            } else {
                scale *= 1.4;
            }
        }
        
        return Math.max(0.8, Math.min(scale, 4.0));
    }
} 
