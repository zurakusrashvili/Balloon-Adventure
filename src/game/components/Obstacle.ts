import * as PIXI from 'pixi.js';

export class Obstacle {
    public container: PIXI.Container;
    private obstacleGraphics!: PIXI.Graphics;
    private moveSpeed: number;
    private bobSpeed: number;
    private bobOffset: number;

    constructor() {
        this.container = new PIXI.Container();
        this.moveSpeed = 0.5 + Math.random() * 1.0;
        this.bobSpeed = 0.02 + Math.random() * 0.03;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.createObstacle();
    }

    private createObstacle(): void {
        this.obstacleGraphics = new PIXI.Graphics();
        this.drawObstacle();
        this.container.addChild(this.obstacleGraphics);
    }

    private drawObstacle(): void {
        const size = 20 + Math.random() * 15;
        
        this.obstacleGraphics.clear();
        
        
        this.obstacleGraphics.beginFill(0xFF4444); 
        this.obstacleGraphics.lineStyle(2, 0xAA0000); 
        
        
        const spikes = 8;
        const innerRadius = size * 0.6;
        const outerRadius = size;
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                this.obstacleGraphics.moveTo(x, y);
            } else {
                this.obstacleGraphics.lineTo(x, y);
            }
        }

        this.obstacleGraphics.closePath();
        this.obstacleGraphics.endFill();
        
        
        this.obstacleGraphics.beginFill(0xFF6666, 0.3);
        this.obstacleGraphics.drawCircle(0, 0, outerRadius + 5);
        this.obstacleGraphics.endFill();
    }

    public update(): void {
        
        this.container.x -= this.moveSpeed;
        
        
        this.container.y += Math.sin(Date.now() * this.bobSpeed + this.bobOffset) * 0.5;
        
        
        this.container.rotation += 0.01;
        
        
        if (this.container.x < -50) {
            this.container.x = 850; 
            this.container.y = Math.random() * 500 + 50; 
        }
    }

    public getBounds(): PIXI.Rectangle {
        return this.obstacleGraphics.getBounds();
    }
} 
