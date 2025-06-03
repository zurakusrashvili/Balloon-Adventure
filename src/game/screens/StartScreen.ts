import * as PIXI from 'pixi.js';

export class StartScreen extends PIXI.Container {
    private startButton!: PIXI.Container;
    private onStartCallback: () => void;
    
    private title!: PIXI.Text;
    private canvasWidth: number = 800;
    private canvasHeight: number = 600;

    constructor(onStart: () => void) {
        super();
        this.onStartCallback = onStart;
        this.createStartScreen();
    }

    public updateDimensions(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
        
        
        this.removeChildren();
        this.createStartScreen();
    }

    private createStartScreen(): void {
        
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: Math.min(48, this.canvasWidth * 0.06),
            fontWeight: 'bold',
            fill: '#FFFFFF',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });

        this.title = new PIXI.Text('🎈 Balloon Adventure', titleStyle);
        this.title.anchor.set(0.5);
        this.title.x = this.canvasWidth / 2;
        this.title.y = this.canvasHeight * 0.35;
        this.addChild(this.title);

        
        this.createStartButton();
    }

    private createStartButton(): void {
        this.startButton = new PIXI.Container();

        
        const buttonWidth = Math.min(200, this.canvasWidth * 0.25);
        const buttonHeight = Math.min(60, this.canvasHeight * 0.1);

        
        const buttonBg = new PIXI.Graphics();
        buttonBg.beginFill(0xFF6B6B);
        buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 30);
        buttonBg.endFill();
        this.startButton.addChild(buttonBg);

        
        const buttonTextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: Math.min(20, buttonWidth * 0.1),
            fontWeight: 'bold',
            fill: '#FFFFFF',
        });

        const buttonText = new PIXI.Text('Start Adventure', buttonTextStyle);
        buttonText.anchor.set(0.5);
        buttonText.x = buttonWidth / 2;
        buttonText.y = buttonHeight / 2;
        this.startButton.addChild(buttonText);

        
        this.startButton.x = (this.canvasWidth - buttonWidth) / 2;
        this.startButton.y = this.canvasHeight * 0.55;

        
        this.startButton.interactive = true;
        this.startButton.cursor = 'pointer';

        
        this.startButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.beginFill(0xFF5252);
            buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 30);
            buttonBg.endFill();
            this.startButton.scale.set(1.05);
        });

        this.startButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.beginFill(0xFF6B6B);
            buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 30);
            buttonBg.endFill();
            this.startButton.scale.set(1.0);
        });

        
        this.startButton.on('pointerdown', () => {
            this.startButton.scale.set(0.95);
        });

        this.startButton.on('pointerup', () => {
            this.startButton.scale.set(1.05);
            this.onStartCallback();
        });

        this.addChild(this.startButton);
    }

    public show(): void {
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }
} 
