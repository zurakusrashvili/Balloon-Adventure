import { BalloonGame } from './game/core/BalloonGame.js';

let game: BalloonGame | null = null;

function setBodyHeight(): void {
    document.body.style.height = `${window.innerHeight}px`;
}

setBodyHeight();

window.addEventListener('resize', setBodyHeight);

window.addEventListener('orientationchange', () => {
   setTimeout(setBodyHeight, 100);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Balloon Adventure - Initializing...');
    
    setBodyHeight();
    
    game = new BalloonGame();
    game.init().then(() => {
        console.log('Game initialized successfully');
    }).catch(error => {
        console.error('Game initialization failed:', error);
    });
}); 
