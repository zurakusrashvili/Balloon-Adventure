import * as PIXI from 'pixi.js';


export enum CloudLayer {
    FAR_BACKGROUND = 0,    
    BACKGROUND = 1,        
    MIDDLE = 2,           
    FOREGROUND = 3,       
    NEAR = 4              
}

export class Cloud {
    public container: PIXI.Container;
    private cloud!: PIXI.Sprite;
    private verticalSpeed!: number;
    private staticX: number; 
    private screenWidth: number = 1920;
    private screenHeight: number = 1080;
    private layer: CloudLayer;
    private layerData: any;
    private originalAlpha: number = 1.0; 
    
    constructor(layer: CloudLayer = CloudLayer.MIDDLE, fixedX?: number) {
        this.container = new PIXI.Container();
        this.layer = layer;
        
        
        if (fixedX !== undefined) {
            this.staticX = fixedX;
        } else {
            
            this.staticX = Math.random() * this.screenWidth;
        }
        
        this.setupLayerData();
        this.createCloud();
        
        
        this.container.x = this.staticX;
    }
    
    private setupLayerData(): void {
        
        const isMobile = this.screenWidth <= 768;
        const scaleMultiplier = isMobile ? 0.7 : 1.0; 
        
        
        const layerConfigs = {
            [CloudLayer.FAR_BACKGROUND]: {
                verticalMultiplier: 0.05,    
                scaleRange: [0.15 * scaleMultiplier, 0.25 * scaleMultiplier],    
                alphaRange: [0.2, 0.35],     
                tintRange: [0.5, 0.65],      
            },
            [CloudLayer.BACKGROUND]: {
                verticalMultiplier: 0.15,
                scaleRange: [0.25 * scaleMultiplier, 0.4 * scaleMultiplier],
                alphaRange: [0.35, 0.5],
                tintRange: [0.65, 0.75],
            },
            [CloudLayer.MIDDLE]: {
                verticalMultiplier: 0.3,
                scaleRange: [0.4 * scaleMultiplier, 0.6 * scaleMultiplier],
                alphaRange: [0.5, 0.7],
                tintRange: [0.75, 0.85],
            },
            [CloudLayer.FOREGROUND]: {
                verticalMultiplier: 0.5,
                scaleRange: [0.6 * scaleMultiplier, 0.8 * scaleMultiplier],
                alphaRange: [0.7, 0.85],
                tintRange: [0.85, 0.95],
            },
            [CloudLayer.NEAR]: {
                verticalMultiplier: 0.8,     
                scaleRange: [0.8 * scaleMultiplier, 1.2 * scaleMultiplier],      
                alphaRange: [0.8, 1.0],      
                tintRange: [0.9, 1.0],       
            }
        };
        
        this.layerData = layerConfigs[this.layer];
        
        
        const baseVerticalSpeed = Math.random() * 0.5 + 0.3; 
        this.verticalSpeed = baseVerticalSpeed * this.layerData.verticalMultiplier;
    }
    
    private createCloud(): void {
        
        const texture = PIXI.Texture.from(`${import.meta.env.BASE_URL}assets/images/cloud.webp`);
        this.cloud = new PIXI.Sprite(texture);
        
        
        this.cloud.anchor.set(0.5);
        
        
        this.applyLayerVisuals();
        
        this.container.addChild(this.cloud);
    }
    
    private applyLayerVisuals(): void {
        const { scaleRange, alphaRange, tintRange } = this.layerData;
        
        
        const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
        this.cloud.scale.set(scale);
        
        
        const alpha = alphaRange[0] + Math.random() * (alphaRange[1] - alphaRange[0]);
        this.originalAlpha = alpha; 
        this.cloud.alpha = alpha;
        
        
        const tint = tintRange[0] + Math.random() * (tintRange[1] - tintRange[0]);
        this.cloud.tint = PIXI.utils.rgb2hex([tint, tint, Math.min(tint + 0.1, 1.0)]);
    }
    
    public update(additionalVerticalSpeed: number = 0): void {
        
        this.container.x = this.staticX;
        
        
        const verticalMovement = this.verticalSpeed + (additionalVerticalSpeed * this.layerData.verticalMultiplier);
        this.container.y += verticalMovement;
        
        
        if (this.container.y > this.screenHeight + 100) {
            this.resetToTop();
        }
    }
    
    public setPosition(x: number, y: number): void {
        this.staticX = x; 
        this.container.x = x;
        this.container.y = y;
    }
    
    public updateScreenWidth(width: number): void {
        const oldWidth = this.screenWidth;
        this.screenWidth = width;
        
        
        this.staticX = (this.staticX / oldWidth) * width;
        this.container.x = this.staticX;
        
        
        this.setupLayerData();
        this.applyLayerVisuals();
    }
    
    public updateScreenHeight(height: number): void {
        this.screenHeight = height;
    }
    
    private resetToTop(): void {
        
        this.container.y = -100 - Math.random() * 200; 
        this.container.x = this.staticX; 
    }
    
    public resetPosition(): void {
        
        this.container.y = Math.random() * this.screenHeight - Math.random() * 200;
        this.container.x = this.staticX;
    }
    
    public getLayer(): CloudLayer {
        return this.layer;
    }
    
    public getLayerDepth(): number {
        
        return this.layer;
    }
    
    public setVisibility(visibility: number): void {
        
        this.cloud.alpha = this.originalAlpha * Math.max(0, Math.min(1, visibility));
        this.container.visible = visibility > 0.01;
    }
} 
