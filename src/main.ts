import { BalloonGame } from './game/core/BalloonGame.js';

let game: BalloonGame | null = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Balloon Adventure - Initializing...');
    
    game = new BalloonGame();
    game.init().then(() => {
        console.log('Game initialized successfully');
    }).catch(error => {
        console.error('Game initialization failed:', error);
    });
}); 
