const state = {
    view: {
        squares: document.querySelectorAll('.square'),
        timeLeft: document.querySelector('#time-left'),
        score: document.querySelector('#score'),
        comboDisplay: document.querySelector('#comboDisplay'),
        comboCount: document.querySelector('#comboCount'),
        hearts: document.querySelectorAll('.hearts i'),
        startScreen: document.querySelector('#startScreen'),
        gameContainer: document.querySelector('#gameContainer'),
        gameOverScreen: document.querySelector('#gameOverScreen'),
        finalScore: document.querySelector('#finalScore'),
        finalHighScore: document.querySelector('#finalHighScore'),
        maxCombo: document.querySelector('#maxCombo'),
        highScore: document.querySelector('#highScore'),
        startBtn: document.querySelector('#startBtn'),
        pauseBtn: document.querySelector('#pauseBtn'),
        soundBtn: document.querySelector('#soundBtn'),
        restartBtn: document.querySelector('#restartBtn'),
        playAgainBtn: document.querySelector('#playAgainBtn'),
        menuBtn: document.querySelector('#menuBtn'),
        difficultyBtns: document.querySelectorAll('.difficulty-btn')
    },
    values: {
        gameVelocity: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 60,
        lives: 3,
        combo: 0,
        maxCombo: 0,
        highScore: localStorage.getItem('detonaRalphHighScore') || 0,
        difficulty: 'medium',
        isPaused: false,
        isGameActive: false,
        isSoundOn: true,
        missCount: 0
    },
    actions: {
        timerId: null,
        countDownTimerId: null,
        enemyMoveInterval: null
    }
};

// Configurações de dificuldade
const difficultySettings = {
    easy: { speed: 1500, time: 90, pointsMultiplier: 1 },
    medium: { speed: 1000, time: 60, pointsMultiplier: 2 },
    hard: { speed: 600, time: 45, pointsMultiplier: 3 }
};

// Inicialização
function init() {
    updateHighScoreDisplay();
    setupEventListeners();
    createParticles();
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Botões de dificuldade
    state.view.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.values.difficulty = btn.dataset.level;
            state.view.difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const settings = difficultySettings[state.values.difficulty];
            state.values.gameVelocity = settings.speed;
            state.values.currentTime = settings.time;
            state.view.timeLeft.textContent = formatTime(state.values.currentTime);
        });
    });

    // Botão iniciar
    state.view.startBtn.addEventListener('click', startGame);

    // Botões de controle
    state.view.pauseBtn.addEventListener('click', togglePause);
    state.view.soundBtn.addEventListener('click', toggleSound);
    state.view.restartBtn.addEventListener('click', restartGame);
    state.view.playAgainBtn.addEventListener('click', restartGame);
    state.view.menuBtn.addEventListener('click', showMenu);

    // Event listeners para os quadrados
    state.view.squares.forEach((square) => {
        square.addEventListener('mousedown', (e) => handleSquareClick(e, square));
        square.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleSquareClick(e, square);
        });
    });

    // Definir dificuldade média como padrão
    document.querySelector('.difficulty-btn[data-level="medium"]').click();
}

// Formatar tempo (mm:ss)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Iniciar jogo
function startGame() {
    state.view.startScreen.style.display = 'none';
    state.view.gameContainer.style.display = 'block';
    
    state.values.isGameActive = true;
    state.values.result = 0;
    state.values.combo = 0;
    state.values.missCount = 0;
    state.values.lives = 3;
    
    updateScore();
    updateLives();
    
    // Iniciar timers
    state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
    state.actions.countDownTimerId = setInterval(countDown, 1000);
    state.actions.enemyMoveInterval = setInterval(moveEnemyRandomly, 300);
    
    playSound('start');
}

// Contagem regressiva
function countDown() {
    if (state.values.isPaused || !state.values.isGameActive) return;
    
    state.values.currentTime--;
    state.view.timeLeft.textContent = formatTime(state.values.currentTime);

    // Efeito visual quando o tempo está acabando
    if (state.values.currentTime <= 10) {
        state.view.timeLeft.style.color = '#ff6b6b';
        state.view.timeLeft.style.animation = 'pulse 0.5s infinite';
        
        if (state.values.currentTime <= 5) {
            playSound('tick');
        }
    }

    if (state.values.currentTime <= 0) {
        endGame();
    }
}

// Quadrado aleatório
function randomSquare() {
    if (state.values.isPaused || !state.values.isGameActive) return;
    
    state.view.squares.forEach((square) => {
        square.classList.remove('enemy');
        square.classList.remove('about-to-appear');
    });

    let randomNumber = Math.floor(Math.random() * 9);
    let randomSquare = state.view.squares[randomNumber];
    
    // Efeito de pré-aparição
    randomSquare.classList.add('about-to-appear');
    setTimeout(() => {
        if (randomSquare.classList.contains('about-to-appear')) {
            randomSquare.classList.remove('about-to-appear');
            randomSquare.classList.add('enemy');
            createParticlesAround(randomSquare);
            
            // Adicionar temporizador para desaparecimento
            setTimeout(() => {
                if (randomSquare.classList.contains('enemy') && state.values.isGameActive) {
                    randomSquare.classList.remove('enemy');
                    handleMiss();
                }
            }, state.values.gameVelocity * 0.8);
            
            state.values.hitPosition = randomSquare.id;
        }
    }, 300);
}

// Mover inimigo aleatoriamente (efeito extra)
function moveEnemyRandomly() {
    if (state.values.isPaused || !state.values.isGameActive || Math.random() > 0.3) return;
    
    const currentEnemy = document.querySelector('.square.enemy');
    if (currentEnemy) {
        currentEnemy.classList.remove('enemy');
        randomSquare();
    }
}

// Manipular clique no quadrado
function handleSquareClick(e, square) {
    if (state.values.isPaused || !state.values.isGameActive) return;
    
    const rect = square.getBoundingClientRect();
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    
    createClickEffect(x - rect.left, y - rect.top, square);
    
    if (square.classList.contains('enemy')) {
        handleHit(square);
    } else {
        handleMiss();
    }
}

// Acerto
function handleHit(square) {
    state.values.result += difficultySettings[state.values.difficulty].pointsMultiplier;
    state.values.combo++;
    
    if (state.values.combo > state.values.maxCombo) {
        state.values.maxCombo = state.values.combo;
    }
    
    // Efeito visual de acerto
    square.style.animation = 'none';
    setTimeout(() => {
        square.style.animation = 'hit-flash 0.3s';
    }, 10);
    
    // Mostrar combo
    if (state.values.combo >= 3) {
        showCombo();
    }
    
    // Efeitos especiais
    createExplosion(square);
    square.classList.remove('enemy');
    state.values.hitPosition = null;
    
    updateScore();
    playSound('hit');
    
    // Adicionar pontos extras por combo
    if (state.values.combo >= 5) {
        const bonus = Math.floor(state.values.combo / 5) * 10;
        state.values.result += bonus;
        showBonus(bonus, square);
        updateScore();
    }
}

// Erro
function handleMiss() {
    state.values.combo = 0;
    state.values.missCount++;
    state.view.comboDisplay.style.display = 'none';
    
    // Perder vida após 3 erros consecutivos
    if (state.values.missCount >= 3) {
        state.values.lives--;
        state.values.missCount = 0;
        updateLives();
        playSound('miss');
        
        if (state.values.lives <= 0) {
            endGame();
        }
    }
    
    // Feedback visual de erro
    document.body.style.backgroundColor = '#ff6b6b';
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 100);
}

// Atualizar pontuação
function updateScore() {
    state.view.score.textContent = state.values.result;
    state.view.score.style.transform = 'scale(1.2)';
    setTimeout(() => {
        state.view.score.style.transform = 'scale(1)';
    }, 200);
}

// Atualizar vidas
function updateLives() {
    state.view.hearts.forEach((heart, index) => {
        if (index < state.values.lives) {
            heart.style.opacity = '1';
        } else {
            heart.style.opacity = '0.3';
        }
    });
}

// Mostrar combo
function showCombo() {
    state.view.comboCount.textContent = state.values.combo;
    state.view.comboDisplay.style.display = 'block';
    
    // Efeito visual baseado no tamanho do combo
    const size = Math.min(1 + (state.values.combo * 0.1), 2);
    state.view.comboDisplay.style.transform = `translateX(-50%) scale(${size})`;
    
    // Cor baseada no combo
    if (state.values.combo >= 10) {
        state.view.comboDisplay.style.background = 'linear-gradient(45deg, #ff006e, #ffbe0b)';
    } else if (state.values.combo >= 5) {
        state.view.comboDisplay.style.background = 'linear-gradient(45deg, #8338ec, #3a86ff)';
    }
}

// Mostrar bônus
function showBonus(amount, element) {
    const bonus = document.createElement('div');
    bonus.className = 'bonus-popup';
    bonus.textContent = `+${amount}!`;
    bonus.style.position = 'absolute';
    bonus.style.color = '#ffd166';
    bonus.style.fontSize = '1.5rem';
    bonus.style.fontWeight = 'bold';
    bonus.style.textShadow = '0 0 10px #000';
    bonus.style.animation = 'bonus-float 1s ease-out forwards';
    
    const rect = element.getBoundingClientRect();
    bonus.style.left = `${rect.left + rect.width / 2}px`;
    bonus.style.top = `${rect.top}px`;
    
    document.body.appendChild(bonus);
    
    setTimeout(() => {
        bonus.remove();
    }, 1000);
}

// Alternar pausa
function togglePause() {
    state.values.isPaused = !state.values.isPaused;
    
    if (state.values.isPaused) {
        clearInterval(state.actions.timerId);
        clearInterval(state.actions.countDownTimerId);
        clearInterval(state.actions.enemyMoveInterval);
        state.view.pauseBtn.innerHTML = '<i class="fas fa-play"></i> Continuar';
        showPauseOverlay();
    } else {
        state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
        state.actions.countDownTimerId = setInterval(countDown, 1000);
        state.actions.enemyMoveInterval = setInterval(moveEnemyRandomly, 300);
        state.view.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        hidePauseOverlay();
    }
}

// Alternar som
function toggleSound() {
    state.values.isSoundOn = !state.values.isSoundOn;
    state.view.soundBtn.innerHTML = state.values.isSoundOn 
        ? '<i class="fas fa-volume-up"></i> Som' 
        : '<i class="fas fa-volume-mute"></i> Som';
}

// Reiniciar jogo
function restartGame() {
    // Limpar intervalos
    clearInterval(state.actions.timerId);
    clearInterval(state.actions.countDownTimerId);
    clearInterval(state.actions.enemyMoveInterval);
    
    // Resetar estado
    state.values.result = 0;
    state.values.currentTime = difficultySettings[state.values.difficulty].time;
    state.values.lives = 3;
    state.values.combo = 0;
    state.values.missCount = 0;
    state.values.isPaused = false;
    state.values.isGameActive = true;
    
    // Resetar visual
    state.view.squares.forEach(square => {
        square.classList.remove('enemy');
        square.classList.remove('about-to-appear');
    });
    
    state.view.timeLeft.textContent = formatTime(state.values.currentTime);
    state.view.timeLeft.style.color = '';
    state.view.timeLeft.style.animation = '';
    state.view.comboDisplay.style.display = 'none';
    
    updateScore();
    updateLives();
    
    // Esconder telas
    state.view.gameOverScreen.style.display = 'none';
    state.view.gameContainer.style.display = 'block';
    
    // Iniciar timers
    state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
    state.actions.countDownTimerId = setInterval(countDown, 1000);
    state.actions.enemyMoveInterval = setInterval(moveEnemyRandomly, 300);
    
    playSound('start');
}

// Mostrar menu
function showMenu() {
    state.view.gameOverScreen.style.display = 'none';
    state.view.startScreen.style.display = 'flex';
    state.view.gameContainer.style.display = 'none';
    
    // Resetar estado
    state.values.isGameActive = false;
    clearInterval(state.actions.timerId);
    clearInterval(state.actions.countDownTimerId);
    clearInterval(state.actions.enemyMoveInterval);
}

// Finalizar jogo
function endGame() {
    state.values.isGameActive = false;
    
    clearInterval(state.actions.timerId);
    clearInterval(state.actions.countDownTimerId);
    clearInterval(state.actions.enemyMoveInterval);
    
    // Atualizar recorde
    if (state.values.result > state.values.highScore) {
        state.values.highScore = state.values.result;
        localStorage.setItem('detonaRalphHighScore', state.values.highScore);
        playSound('highscore');
    }
    
    // Atualizar tela de game over
    state.view.finalScore.textContent = state.values.result;
    state.view.finalHighScore.textContent = state.values.highScore;
    state.view.maxCombo.textContent = state.values.maxCombo;
    
    // Mostrar tela de game over
    setTimeout(() => {
        state.view.gameContainer.style.display = 'none';
        state.view.gameOverScreen.style.display = 'flex';
    }, 1000);
    
    playSound('gameover');
}

// Efeito de clique
function createClickEffect(x, y, parent) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    
    parent.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 500);
}

// Efeito de explosão
function createExplosion(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = ['#ff6b6b', '#ffd166', '#4ecdc4'][Math.floor(Math.random() * 3)];
        particle.style.borderRadius = '50%';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        document.body.appendChild(particle);
        
        // Animação
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const duration = 800 + Math.random() * 400;
        
        const animation = particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * speed * 100}px, ${Math.sin(angle) * speed * 100}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// Criar partículas de fundo
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = `rgba(78, 205, 196, ${Math.random() * 0.3 + 0.1})`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        particlesContainer.appendChild(particle);
        
        // Animação flutuante
        animateParticle(particle);
    }
}

// Animar partícula
function animateParticle(particle) {
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);
    let xSpeed = (Math.random() - 0.5) * 0.5;
    let ySpeed = (Math.random() - 0.5) * 0.5;
    
    function move() {
        x += xSpeed;
        y += ySpeed;
        
        // Rebater nas bordas
        if (x < 0 || x > 100) xSpeed *= -1;
        if (y < 0 || y > 100) ySpeed *= -1;
        
        particle.style.left = `${x}vw`;
        particle.style.top = `${y}vh`;
        
        requestAnimationFrame(move);
    }
    
    move();
}

// Criar partículas ao redor do quadrado
function createParticlesAround(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#00ffff', '#ff6b6b', '#ffd166'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        document.body.appendChild(particle);
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 40;
        
        const animation = particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// Mostrar overlay de pausa
function showPauseOverlay() {
    let overlay = document.querySelector('.pause-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'pause-overlay';
        overlay.innerHTML = '<h2>JOGO PAUSADO</h2><p>Clique em Continuar para retomar</p>';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.85)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1500';
        overlay.style.color = 'white';
        overlay.style.fontSize = '2rem';
        overlay.style.textAlign = 'center';
        
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
}

// Esconder overlay de pausa
function hidePauseOverlay() {
    const overlay = document.querySelector('.pause-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Atualizar display do recorde
function updateHighScoreDisplay() {
    state.view.highScore.textContent = state.values.highScore;
}

// Tocar som
function playSound(audioName) {
    if (!state.values.isSoundOn) return;
    
    const audio = new Audio(`./src/audios/${audioName}.m4a`);
    audio.volume = 0.3;
    
    try {
        audio.play();
    } catch (error) {
        console.log('Erro ao tocar som:', error);
    }
}

// Inicializar jogo quando o DOM carregar
document.addEventListener('DOMContentLoaded', init);

// Adicionar CSS dinâmico para animações extras
const style = document.createElement('style');
style.textContent = `
    @keyframes hit-flash {
        0%, 100% { background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); }
        50% { background: linear-gradient(135deg, #ffd166 0%, #ff9a3c 100%); }
    }
    
    @keyframes bonus-float {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-100px); opacity: 0; }
    }
    
    .square.about-to-appear {
        border-color: #ffd166;
        box-shadow: 0 0 20px #ffd166;
        animation: pulse 0.5s infinite;
    }
`;
document.head.appendChild(style);