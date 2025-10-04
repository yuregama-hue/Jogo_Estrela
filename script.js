// ====================================================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÃO DE ÁUDIO
// ====================================================================
let score = 0;
let player;
let gameContainer;
let gameInterval;
let stars = [];
let enemies = [];
const playerSpeed = 20;

let starSpeed = 5; 
let enemySpeed = 5;

const baseStarSpeed = 5;
const baseEnemySpeed = 5;

// Busca os elementos de áudio que estão no HTML
const backgroundMusic = document.getElementById('background-music');
const muteBtn = document.getElementById('mute-btn');

// AJUSTE: O elemento com o ID 'collect-sound' no HTML é, na verdade, o som de Game Over.
const gameOverSoundElement = document.getElementById('collect-sound'); // Busca o ID ATUAL do Game Over

// NOVO: Cria objetos de áudio para sons que não estão no HTML
// ATENÇÃO: Você precisa ter um arquivo 'collect-star.mp3' e 'hit.wav' na pasta raiz do jogo.
const collectSound = new Audio('/collect-star.mp3'); 
const hitSound = new Audio('/hit.wav'); 

let musicStarted = false; // Variável para controlar se a música já começou


// ====================================================================
// INICIALIZAÇÃO DO JOGO
// ====================================================================
window.onload = function() {
    player = document.getElementById('player');
    gameContainer = document.getElementById('game-container');
    
    // Configura controles
    setupControls();
    
    // Inicia o loop do jogo
    gameInterval = setInterval(gameLoop, 50);
    
    // Cria estrelas e inimigos...
    setInterval(createStar, 1500);
    setInterval(createEnemy, 3000);

    // Lógica do botão de mudo
    muteBtn.addEventListener('click', function() {
        // Inverte o estado 'muted' da música e dos outros sons
        backgroundMusic.muted = !backgroundMusic.muted;
        collectSound.muted = !collectSound.muted;
        hitSound.muted = !hitSound.muted;
        if (gameOverSoundElement) {
            gameOverSoundElement.muted = !gameOverSoundElement.muted;
        }

        // Atualiza o texto do botão
        muteBtn.textContent = backgroundMusic.muted ? 'Som' : 'Mudo';
    });
};


// ====================================================================
// FUNÇÕES DE CONTROLE E JOGABILIDADE
// ====================================================================
function setupControls() {
    document.addEventListener('keydown', function(e) {
        // Lógica para iniciar a música
        if (!musicStarted && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            backgroundMusic.volume = 0.3; // Define um volume mais baixo (30%)
            backgroundMusic.play();
            musicStarted = true;
        }

        let left = parseInt(player.style.left, 10) || 0;
        const playerWidth = player.clientWidth;
        const containerWidth = gameContainer.clientWidth;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (left - playerSpeed >= 0) {
                    player.style.left = (left - playerSpeed) + 'px';
                }
                break;
            case 'ArrowRight':
                if (left + playerSpeed + playerWidth <= containerWidth) {
                    player.style.left = (left + playerSpeed) + 'px';
                }
                break;
        }
    });
}

function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    const randomX = Math.random() * (gameContainer.clientWidth - 30);
    star.style.left = randomX + 'px';
    star.style.top = '0px';
    gameContainer.appendChild(star);
    stars.push(star);
}

function createEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    const randomX = Math.random() * (gameContainer.clientWidth - 30);
    enemy.style.left = randomX + 'px';
    enemy.style.top = '0px';
    gameContainer.appendChild(enemy);
    enemies.push(enemy);
}

function updateDifficulty() {
    starSpeed = baseStarSpeed + Math.floor(score / 5);
    enemySpeed = baseEnemySpeed + Math.floor(score / 10);
}


// ====================================================================
// LOOP PRINCIPAL DO JOGO
// ====================================================================
function gameLoop() {
    const playerRect = player.getBoundingClientRect();
    
    // Move as estrelas
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        let top = parseInt(star.style.top, 10) || 0;
        top += starSpeed;
        star.style.top = top + 'px';
        
        const starRect = star.getBoundingClientRect();
        
        if (starRect.top > window.innerHeight) {
            star.remove();
            stars.splice(i, 1);
            continue;
        }
        
        // Colisão com estrela
        if (
            playerRect.left < starRect.right &&
            playerRect.right > starRect.left &&
            playerRect.top < starRect.bottom &&
            playerRect.bottom > starRect.top
        ) {
            star.remove();
            stars.splice(i, 1);
            score++;
            document.getElementById('score').innerText = `Pontos: ${score}`;
            updateDifficulty(); 

            // Toca o som de coleta (usando o objeto new Audio)
            collectSound.currentTime = 0; // Reinicia o som
            collectSound.play();
        }
    }
    
    // Move os inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        let top = parseInt(enemy.style.top, 10) || 0;
        top += enemySpeed;
        enemy.style.top = top + 'px';
        
        const enemyRect = enemy.getBoundingClientRect();
        
        if (enemyRect.top > window.innerHeight) {
            enemy.remove();
            enemies.splice(i, 1);
            continue;
        }
        
        // Colisão com inimigo
        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            enemy.remove();
            enemies.splice(i, 1);
            score -= 1;

            // Toca o som de colisão (usando o objeto new Audio)
            hitSound.currentTime = 0; // Reinicia o som
            hitSound.play();
            
            if (score < 0) {
                resetGame();
            } else {
                document.getElementById('score').innerText = `Pontos: ${score}`;
            }
        }
    }
}

// ====================================================================
// FUNÇÃO GAME OVER
// ====================================================================
function resetGame() {
    // Para o loop principal do jogo
    clearInterval(gameInterval);
    
    // Pausa a música de fundo
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    // Toca o som de game over (usando o elemento do HTML 'collect-sound')
    if (gameOverSoundElement) {
        gameOverSoundElement.currentTime = 0; // Garante que o som comece do início
        gameOverSoundElement.play();
    }
    
    alert(`Game Over! Pontuação final: ${score}`);
    
    // Reinicializa o jogo
    score = 0;
    document.getElementById('score').innerText = `Pontos: ${score}`;

    starSpeed = baseStarSpeed;
    enemySpeed = baseEnemySpeed;
    
    stars.forEach(star => star.remove());
    stars = [];
    
    enemies.forEach(enemy => enemy.remove());
    enemies = [];
    
    // Reinicia o loop do jogo e a criação de objetos
    gameInterval = setInterval(gameLoop, 50);
    
    // Reinicia o controle de música para que ela possa tocar novamente
    musicStarted = false; 
}