import * as PIXI from 'pixi.js';

export class GameOverScreen extends PIXI.Container {
    private restartButton!: PIXI.Container;
    private onRestartCallback: () => void;
    private scoreText!: PIXI.Text;
    
    private title!: PIXI.Text;
    private canvasWidth: number = 800;
    private canvasHeight: number = 600;
    private isSuccess: boolean = false;
    private currentScore: number = 0; 

    constructor(onRestart: () => void) {
        super();
        this.onRestartCallback = onRestart;
        this.createGameOverScreen();
        this.visible = false;
    }

    public updateDimensions(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
        
        
        this.removeChildren();
        this.createGameOverScreen();
    }

    private createGameOverScreen(): void {
        
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: Math.min(48, this.canvasWidth * 0.06),
            fontWeight: 'bold',
            fill: this.isSuccess ? '#4CAF50' : '#FF6B6B', 
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });

        this.title = new PIXI.Text(this.isSuccess ? 'Mission Success!' : 'Game Over!', titleStyle);
        this.title.anchor.set(0.5);
        this.title.x = this.canvasWidth / 2;
        this.title.y = this.canvasHeight * 0.3;
        this.addChild(this.title);

        
        const scoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: this.isSuccess ? Math.min(36, this.canvasWidth * 0.045) : Math.min(24, this.canvasWidth * 0.03), 
            fontWeight: this.isSuccess ? 'bold' : 'normal', 
            fill: this.isSuccess ? '#FFD700' : '#FFFFFF', 
            align: 'center',
            dropShadow: this.isSuccess, 
            dropShadowColor: '#000000',
            dropShadowBlur: 2,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 3,
        });

        this.scoreText = new PIXI.Text(`Score: ${this.currentScore}`, scoreStyle);
        this.scoreText.anchor.set(0.5);
        this.scoreText.x = this.canvasWidth / 2;
        this.scoreText.y = this.canvasHeight * 0.45;
        this.addChild(this.scoreText);

        
        this.createRestartButton();
    }

    private createRestartButton(): void {
        this.restartButton = new PIXI.Container();

        
        const buttonWidth = Math.min(200, this.canvasWidth * 0.25);
        const buttonHeight = Math.min(60, this.canvasHeight * 0.1);

        
        const buttonBg = new PIXI.Graphics();
        const buttonColor = this.isSuccess ? 0x4CAF50 : 0x4CAF50; 
        buttonBg.beginFill(buttonColor);
        buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 30);
        buttonBg.endFill();
        this.restartButton.addChild(buttonBg);

        
        const buttonTextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: Math.min(20, buttonWidth * 0.1),
            fontWeight: 'bold',
            fill: '#FFFFFF',
        });

        const buttonText = new PIXI.Text('Play Again', buttonTextStyle);
        buttonText.anchor.set(0.5);
        buttonText.x = buttonWidth / 2;
        buttonText.y = buttonHeight / 2;
        this.restartButton.addChild(buttonText);

        
        this.restartButton.x = (this.canvasWidth - buttonWidth) / 2;
        this.restartButton.y = this.canvasHeight * 0.6;

        
        this.restartButton.interactive = true;
        this.restartButton.cursor = 'pointer';

        
        this.restartButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.beginFill(0x45A049);
            buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 30);
            buttonBg.endFill();
            this.restartButton.scale.set(1.05);
        });

        this.restartButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.beginFill(buttonColor);
            buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 30);
            buttonBg.endFill();
            this.restartButton.scale.set(1.0);
        });

        
        this.restartButton.on('pointerdown', () => {
            this.restartButton.scale.set(0.95);
        });

        this.restartButton.on('pointerup', () => {
            this.restartButton.scale.set(1.05);
            this.onRestartCallback();
        });

        this.addChild(this.restartButton);
    }

    public show(score: number, isSuccess: boolean = false): void {
        this.isSuccess = isSuccess;
        this.currentScore = score; 
        
        
        this.removeChildren();
        this.createGameOverScreen();
        
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }
} 
