import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

interface Particle {
    sprite: PIXI.Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    gravity: number;
}

export class ParticleSystem {
    public container: PIXI.Container;
    private particles: Particle[] = [];
    
    constructor() {
        this.container = new PIXI.Container();
        this.particles = [];
    }
    
    public createSuccessEffect(x: number, y: number): void {
        
        const screenWidth = this.container.parent?.parent?.width || 800;
        const isMobile = screenWidth <= 768;
        
        
        const confettiCount = isMobile ? 15 : 20; 
        const starCount = isMobile ? 6 : 8;
        
        
        for (let i = 0; i < confettiCount; i++) {
            this.createConfettiParticle(x, y, isMobile);
        }
        
        
        for (let i = 0; i < starCount; i++) {
            this.createStarParticle(x, y, isMobile);
        }
    }
    
    public createPopEffect(x: number, y: number): void {
        
        this.createShockwave(x, y);
        
        
        for (let i = 0; i < 25; i++) {
            this.createBalloonFragment(x, y);
        }
        
        
        for (let i = 0; i < 15; i++) {
            this.createDebrisParticle(x, y);
        }
        
        
        for (let i = 0; i < 20; i++) {
            this.createSmokeParticle(x, y);
        }
        
        
        for (let i = 0; i < 12; i++) {
            this.createSparkParticle(x, y);
        }
        
        
        for (let i = 0; i < 3; i++) {
            this.createPressureRing(x, y, i * 150);
        }
    }
    
    private createConfettiParticle(x: number, y: number, isMobile: boolean = false): void {
        const particle = new PIXI.Graphics();
        
        
        const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 0x98D8C8, 0xF7DC6F];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        
        const size = isMobile ? 3 : 4;
        const height = isMobile ? 6 : 8;
        
        
        particle.beginFill(color);
        particle.drawRect(0, 0, size, height);
        particle.endFill();
        
        
        const spread = isMobile ? 15 : 20;
        particle.x = x + (Math.random() - 0.5) * spread;
        particle.y = y + (Math.random() - 0.5) * spread;
        
        
        const velocityMultiplier = isMobile ? 0.7 : 1;
        const particleData: Particle = {
            sprite: particle,
            vx: (Math.random() - 0.5) * 8 * velocityMultiplier,
            vy: (-Math.random() * 6 - 2) * velocityMultiplier,
            life: 1,
            maxLife: 1,
            gravity: 0.2
        };
        
        this.particles.push(particleData);
        this.container.addChild(particle);
        
        
        const rotationDuration = isMobile ? 1.5 : 2;
        gsap.to(particle, {
            duration: rotationDuration,
            rotation: Math.PI * 4,
            ease: "none"
        });
    }
    
    private createStarParticle(x: number, y: number, isMobile: boolean = false): void {
        const particle = new PIXI.Graphics();
        
        
        const outerRadius = isMobile ? 6 : 8;
        const innerRadius = isMobile ? 3 : 4;
        
        
        particle.beginFill(0xFFD700);
        this.drawStar(particle, 0, 0, 5, outerRadius, innerRadius);
        particle.endFill();
        
        
        const spread = isMobile ? 20 : 30;
        particle.x = x + (Math.random() - 0.5) * spread;
        particle.y = y + (Math.random() - 0.5) * spread;
        
        
        const velocityMultiplier = isMobile ? 0.8 : 1;
        const particleData: Particle = {
            sprite: particle,
            vx: (Math.random() - 0.5) * 6 * velocityMultiplier,
            vy: (-Math.random() * 4 - 1) * velocityMultiplier,
            life: 1.5,
            maxLife: 1.5,
            gravity: 0.1
        };
        
        this.particles.push(particleData);
        this.container.addChild(particle);
        
        
        const scaleFactor = isMobile ? 1.3 : 1.5;
        const sparkleRepeat = isMobile ? 2 : 3;
        gsap.to(particle.scale, {
            duration: 0.5,
            x: scaleFactor,
            y: scaleFactor,
            yoyo: true,
            repeat: sparkleRepeat,
            ease: "sine.inOut"
        });
    }
    
    private createBalloonFragment(x: number, y: number): void {
        const particle = new PIXI.Graphics();
        
        
        const size = 4 + Math.random() * 8;
        const fragmentType = Math.random();
        
        if (fragmentType < 0.3) {
            
            particle.beginFill(0xFF6B6B, 0.9);
            particle.drawEllipse(0, 0, size, size * 0.6);
            particle.endFill();
        } else if (fragmentType < 0.6) {
            
            particle.beginFill(0xFF4444, 0.8);
            particle.moveTo(0, 0);
            particle.lineTo(size, Math.random() * size * 0.5);
            particle.lineTo(size * 0.7, size);
            particle.lineTo(-size * 0.3, size * 0.8);
            particle.lineTo(0, 0);
            particle.endFill();
        } else {
            
            particle.beginFill(0xFF5555, 0.85);
            particle.drawCircle(0, 0, size);
            particle.endFill();
        }
        
        particle.x = x + (Math.random() - 0.5) * 60;
        particle.y = y + (Math.random() - 0.5) * 60;
        
        const particleData: Particle = {
            sprite: particle,
            vx: (Math.random() - 0.5) * 15,
            vy: -Math.random() * 12 - 3,
            life: 2,
            maxLife: 2,
            gravity: 0.4
        };
        
        this.particles.push(particleData);
        this.container.addChild(particle);
        
        
        gsap.to(particle, {
            duration: 2,
            rotation: Math.PI * 4 * (Math.random() > 0.5 ? 1 : -1),
            ease: "none"
        });
    }
    
    private createSmokeParticle(x: number, y: number): void {
        const particle = new PIXI.Graphics();
        
        
        const size = 5 + Math.random() * 8;
        particle.beginFill(0x888888, 0.6);
        particle.drawCircle(0, 0, size);
        particle.endFill();
        
        particle.x = x + (Math.random() - 0.5) * 20;
        particle.y = y + (Math.random() - 0.5) * 20;
        
        const particleData: Particle = {
            sprite: particle,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2 - 1,
            life: 2,
            maxLife: 2,
            gravity: -0.05 
        };
        
        this.particles.push(particleData);
        this.container.addChild(particle);
        
        
        gsap.to(particle.scale, {
            duration: 2,
            x: 2,
            y: 2,
            ease: "power2.out"
        });
    }
    
    private drawStar(graphics: PIXI.Graphics, x: number, y: number, points: number, outerRadius: number, innerRadius: number): void {
        const angle = Math.PI / points;
        
        graphics.moveTo(x + outerRadius, y);
        
        for (let i = 1; i <= points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const currentAngle = angle * i;
            const px = x + Math.cos(currentAngle) * radius;
            const py = y + Math.sin(currentAngle) * radius;
            graphics.lineTo(px, py);
        }
        
        graphics.closePath();
    }
    
    public update(): void {
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            
            particle.vy += particle.gravity;
            particle.sprite.x += particle.vx;
            particle.sprite.y += particle.vy;
            
            
            particle.life -= 1 / 60; 
            
            
            const lifeRatio = particle.life / particle.maxLife;
            particle.sprite.alpha = Math.max(0, lifeRatio);
            
            
            if (particle.life <= 0) {
                this.container.removeChild(particle.sprite);
                this.particles.splice(i, 1);
            }
        }
    }
    
    private createShockwave(x: number, y: number): void {
        const shockwave = new PIXI.Graphics();
        shockwave.lineStyle(4, 0xFFFFFF, 0.8);
        shockwave.drawCircle(0, 0, 20);
        shockwave.x = x;
        shockwave.y = y;
        this.container.addChild(shockwave);
        
        gsap.to(shockwave, {
            duration: 0.3,
            alpha: 0,
            onComplete: () => {
                this.container.removeChild(shockwave);
            }
        });
        
        gsap.to(shockwave.scale, {
            duration: 0.3,
            x: 8,
            y: 8,
            ease: "power2.out"
        });
    }
    
    private createDebrisParticle(x: number, y: number): void {
        const particle = new PIXI.Graphics();
        
        const size = 1 + Math.random() * 3;
        const colors = [0x333333, 0x666666, 0x999999, 0xFF6B6B];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.beginFill(color, 0.7);
        particle.drawRect(-size/2, -size/2, size, size);
        particle.endFill();
        
        particle.x = x + (Math.random() - 0.5) * 80;
        particle.y = y + (Math.random() - 0.5) * 80;
        
        const particleData: Particle = {
            sprite: particle,
            vx: (Math.random() - 0.5) * 12,
            vy: -Math.random() * 10 - 2,
            life: 1.5,
            maxLife: 1.5,
            gravity: 0.35
        };
        
        this.particles.push(particleData);
        this.container.addChild(particle);
    }
    
    private createSparkParticle(x: number, y: number): void {
        const particle = new PIXI.Graphics();
        
        particle.beginFill(0xFFFF00, 0.9);
        particle.drawCircle(0, 0, 2);
        particle.endFill();
        
        particle.x = x + (Math.random() - 0.5) * 30;
        particle.y = y + (Math.random() - 0.5) * 30;
        
        const particleData: Particle = {
            sprite: particle,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6 - 1,
            life: 0.8,
            maxLife: 0.8,
            gravity: 0.1
        };
        
        this.particles.push(particleData);
        this.container.addChild(particle);
        
        
        gsap.to(particle.scale, {
            duration: 0.4,
            x: 0,
            y: 0,
            ease: "power2.out"
        });
    }
    
    private createPressureRing(x: number, y: number, delay: number): void {
        setTimeout(() => {
            const ring = new PIXI.Graphics();
            ring.lineStyle(2, 0xFFFFFF, 0.4);
            ring.drawCircle(0, 0, 5);
            ring.x = x;
            ring.y = y;
            this.container.addChild(ring);
            
            gsap.to(ring, {
                duration: 0.5,
                alpha: 0,
                onComplete: () => {
                    this.container.removeChild(ring);
                }
            });
            
            gsap.to(ring.scale, {
                duration: 0.5,
                x: 6,
                y: 6,
                ease: "power2.out"
            });
        }, delay);
    }

    public clear(): void {
        
        this.particles.forEach(particle => {
            this.container.removeChild(particle.sprite);
        });
        this.particles = [];
    }
} 
