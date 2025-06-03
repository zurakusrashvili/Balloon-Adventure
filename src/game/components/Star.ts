import * as PIXI from 'pixi.js';

export class Star extends PIXI.Container {
    private starGraphics!: PIXI.Graphics;
    private rotationSpeed: number;

    constructor() {
        super();
        this.rotationSpeed = 0.02 + Math.random() * 0.03;
        this.createStar();
    }

    private createStar(): void {
        this.starGraphics = new PIXI.Graphics();
        this.drawStar();
        this.addChild(this.starGraphics);
    }

    private drawStar(): void {
        const size = 15;
        const points = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;

        this.starGraphics.clear();
        this.starGraphics.beginFill(0xFFD700); 
        this.starGraphics.lineStyle(2, 0xFFA500); 

        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                this.starGraphics.moveTo(x, y);
            } else {
                this.starGraphics.lineTo(x, y);
            }
        }

        this.starGraphics.closePath();
        this.starGraphics.endFill();
    }

    public update(): void {
        this.rotation += this.rotationSpeed;
        
        
        this.y += Math.sin(Date.now() * 0.003 + this.x * 0.01) * 0.2;
    }

    public getBounds(): PIXI.Rectangle {
        return this.starGraphics.getBounds();
    }
} 
