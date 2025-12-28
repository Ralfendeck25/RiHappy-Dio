// YuGiOh Duel Arena - Motor do Jogo Simples

const game = {
    // Estado do jogo
    player: {
        name: "Yugi Muto",
        lifePoints: 8000,
        hand: [],
        field: [],
        deck: [],
        grave: [],
        deckCount: 35
    },
    
    opponent: {
        name: "Seto Kaiba",
        lifePoints: 8000,
        hand: [],
        field: [],
        deck: [],
        grave: [],
        deckCount: 35
    },
    
    turn: 'player',
    isMusicPlaying: true,
    gameStarted: false,
    
    // Cartas dispon√≠veis
    cards: [
        // Monstros
        { id: 1, name: "Mago Negro", type: "monster", atk: 2500, def: 2100, attribute: "DARK", level: 7 },
        { id: 2, name: "Kuriboh", type: "monster", atk: 300, def: 200, attribute: "DARK", level: 1 },
        { id: 3, name: "Gaia", type: "monster", atk: 2300, def: 2100, attribute: "EARTH", level: 6 },
        { id: 4, name: "Sangan", type: "monster", atk: 1000, def: 600, attribute: "DARK", level: 3 },
        { id: 5, name: "Drag√£o Branco", type: "monster", atk: 3000, def: 2500, attribute: "LIGHT", level: 8 },
        { id: 6, name: "Drag√£o Negro", type: "monster", atk: 2400, def: 2000, attribute: "DARK", level: 7 },
        
        // Magias
        { id: 101, name: "Raigeki", type: "spell", effect: "Destr√≥i todos monstros do oponente" },
        { id: 102, name: "Dark Hole", type: "spell", effect: "Destr√≥i todos monstros no campo" },
        { id: 103, name: "Monster Reborn", type: "spell", effect: "Revive 1 monstro do cemit√©rio" },
        
        // Armadilhas
        { id: 201, name: "Mirror Force", type: "trap", effect: "Destr√≥i monstros atacantes" },
        { id: 202, name: "Magic Cylinder", type: "trap", effect: "Redireciona dano de ataque" }
    ],
    
    // Inicializa√ß√£o do jogo
    init() {
        if (this.gameStarted) return;
        
        this.log("ÌæÆ Inicializando duelo...", "system");
        
        // Configura decks
        this.setupDecks();
        
        // Compra cartas iniciais
        for (let i = 0; i < 5; i++) {
            this.drawCard('player');
            this.drawCard('opponent');
        }
        
        // Inicia m√∫sica
        this.playMusic();
        
        // Atualiza interface
        this.updateUI();
        
        this.gameStarted = true;
        this.log("ÌøÜ DUELO INICIADO! Boa sorte, " + this.player.name + "!", "system");
        this.log("Ìæ¥ Seu turno come√ßou. Use 'Comprar Carta' para come√ßar!", "system");
    },
    
    // Configura os decks
    setupDecks() {
        // Cria c√≥pias das cartas para formar decks
        let playerDeck = [];
        let opponentDeck = [];
        
        // Adiciona m√∫ltiplas c√≥pias de cada carta
        for (let i = 0; i < 4; i++) {
            this.cards.forEach(card => {
                const cardCopy = { ...card };
                playerDeck.push(cardCopy);
                opponentDeck.push({ ...card });
            });
        }
        
        // Embaralha
        this.shuffle(playerDeck);
        this.shuffle(opponentDeck);
        
        // Atribui aos jogadores
        this.player.deck = playerDeck.slice(0, 35);
        this.opponent.deck = opponentDeck.slice(0, 35);
        
        this.player.deckCount = this.player.deck.length;
        this.opponent.deckCount = this.opponent.deck.length;
    },
    
    // Embaralha array
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    // Compra uma carta
    drawCard(player) {
        if (this.turn !== 'player' && player === 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        const target = player === 'player' ? this.player : this.opponent;
        
        if (target.deck.length === 0) {
            this.log((player === 'player' ? "Voc√™" : "Oponente") + " n√£o tem mais cartas!", "system");
            return null;
        }
        
        const card = target.deck.pop();
        target.hand.push(card);
        target.deckCount--;
        
        // Toca som
        this.playSound('draw');
        
        // Log
        if (player === 'player') {
            this.log("Voc√™ comprou: " + card.name, "player");
        }
        
        this.updateUI();
        return card;
    },
    
    // Invoca um monstro
    summonMonster() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.hand.length === 0) {
            this.log("Voc√™ n√£o tem cartas na m√£o!", "system");
            return;
        }
        
        // Encontra um monstro na m√£o
        const monster = this.player.hand.find(card => card.type === 'monster');
        
        if (!monster) {
            this.log("Nenhum monstro na m√£o para invocar!", "system");
            return;
        }
        
        if (this.player.field.length >= 3) {
            this.log("Seu campo est√° cheio (m√°x. 3 monstros)!", "system");
            return;
        }
        
        // Remove da m√£o e coloca no campo
        this.player.hand = this.player.hand.filter(c => c !== monster);
        this.player.field.push(monster);
        
        this.log("Voc√™ invocou: " + monster.name + " (ATK: " + monster.atk + ")", "player");
        this.updateUI();
    },
    
    // Ativa uma magia
    playSpell() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        const spell = this.player.hand.find(card => card.type === 'spell');
        
        if (!spell) {
            this.log("Nenhuma magia na m√£o!", "system");
            return;
        }
        
        // Remove da m√£o
        this.player.hand = this.player.hand.filter(c => c !== spell);
        this.player.grave.push(spell);
        
        // Aplica efeito baseado no nome
        if (spell.name === "Raigeki") {
            if (this.opponent.field.length > 0) {
                this.opponent.grave.push(...this.opponent.field);
                this.opponent.field = [];
                this.log("‚ö° RAIGEKI! Todos monstros do oponente destru√≠dos!", "player");
            }
        } else if (spell.name === "Dark Hole") {
            if (this.player.field.length > 0 || this.opponent.field.length > 0) {
                this.player.grave.push(...this.player.field);
                this.opponent.grave.push(...this.opponent.field);
                this.player.field = [];
                this.opponent.field = [];
                this.log("Ìµ≥Ô∏è DARK HOLE! Todos monstros destru√≠dos!", "system");
            }
        } else {
            this.log("Voc√™ ativou: " + spell.name, "player");
        }
        
        this.updateUI();
    },
    
    // Declara ataque
    declareAttack() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.field.length === 0) {
            this.log("Voc√™ n√£o tem monstros para atacar!", "system");
            return;
        }
        
        const attacker = this.player.field[0]; // Primeiro monstro
        const target = this.opponent.field[0]; // Primeiro monstro do oponente
        
        this.playSound('attack');
        
        if (target) {
            // Batalha entre monstros
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.opponent.lifePoints -= damage;
                this.opponent.field.shift(); // Remove primeiro monstro
                this.opponent.grave.push(target);
                this.log("‚öîÔ∏è " + attacker.name + " destruiu " + target.name + "! Dano: " + damage, "player");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.player.lifePoints -= damage;
                this.player.field.shift();
                this.player.grave.push(attacker);
                this.log("Ìª°Ô∏è " + target.name + " defendeu! Voc√™ sofreu " + damage + " de dano", "opponent");
            } else {
                this.player.field.shift();
                this.opponent.field.shift();
                this.player.grave.push(attacker);
                this.opponent.grave.push(target);
                this.log("ÔøΩÔøΩ Empate! Ambos monstros destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.opponent.lifePoints -= attacker.atk;
            this.log("ÌæØ Ataque direto! " + attacker.name + " causou " + attacker.atk + " de dano!", "player");
        }
        
        this.updateUI();
        this.checkGameOver();
    },
    
    // Finaliza turno
    endTurn() {
        this.turn = this.turn === 'player' ? 'opponent' : 'player';
        
        if (this.turn === 'opponent') {
            this.log("‚ö° Turno do oponente (Kaiba)!", "system");
            setTimeout(() => this.opponentAI(), 1000);
        } else {
            this.log("Ì±ë Seu turno (Yugi)!", "system");
        }
        
        this.updateTurnIndicator();
    },
    
    // IA do oponente
    opponentAI() {
        // Compra carta
        this.drawCard('opponent');
        
        // Tenta invocar monstro
        const monster = this.opponent.hand.find(c => c.type === 'monster');
        if (monster && this.opponent.field.length < 3) {
            this.opponent.hand = this.opponent.hand.filter(c => c !== monster);
            this.opponent.field.push(monster);
            this.log("Oponente invocou: " + monster.name, "opponent");
        }
        
        // Ataca se tiver monstros
        if (this.opponent.field.length > 0) {
            setTimeout(() => this.opponentAttack(), 1500);
        } else {
            setTimeout(() => this.endTurn(), 1000);
        }
        
        this.updateUI();
    },
    
    // Ataque do oponente
    opponentAttack() {
        const attacker = this.opponent.field[0];
        const target = this.player.field[0];
        
        this.playSound('attack');
        
        if (target) {
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.player.lifePoints -= damage;
                this.player.field.shift();
                this.player.grave.push(target);
                this.log("‚öîÔ∏è " + attacker.name + " destruiu " + target.name + "! Dano: " + damage, "opponent");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.opponent.lifePoints -= damage;
                this.opponent.field.shift();
                this.opponent.grave.push(attacker);
                this.log("Ìª°Ô∏è " + target.name + " defendeu! Oponente sofreu " + damage + " de dano", "player");
            } else {
                this.player.field.shift();
                this.opponent.field.shift();
                this.player.grave.push(target);
                this.opponent.grave.push(attacker);
                this.log("Ì≤• Empate! Ambos monstros destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.player.lifePoints -= attacker.atk;
            this.log("ÌæØ Ataque direto do oponente! " + attacker.atk + " de dano!", "opponent");
        }
        
        this.updateUI();
        this.checkGameOver();
        setTimeout(() => this.endTurn(), 1500);
    },
    
    // Verifica fim de jogo
    checkGameOver() {
        if (this.player.lifePoints <= 0) {
            this.log("Ì≤Ä VOC√ä PERDEU! Kaiba venceu o duelo!", "system");
            this.playSound('lose');
            this.gameOver();
        } else if (this.opponent.lifePoints <= 0) {
            this.log("ÌøÜ VOC√ä VENCEU! O cora√ß√£o das cartas estava com voc√™!", "system");
            this.playSound('win');
            this.gameOver();
        }
    },
    
    // Fim de jogo
    gameOver() {
        // Desabilita bot√µes
        document.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        
        // Adiciona bot√£o de rein√≠cio
        const restartBtn = document.createElement('button');
        restartBtn.className = 'rpgui-button golden';
        restartBtn.innerHTML = '<p><i class="fas fa-redo"></i> JOGAR NOVAMENTE</p>';
        restartBtn.onclick = () => location.reload();
        restartBtn.style.marginTop = '20px';
        document.querySelector('.controls-panel').appendChild(restartBtn);
    },
    
    // Atualiza interface
    updateUI() {
        // Life Points
        document.getElementById('playerLP').textContent = this.player.lifePoints;
        document.getElementById('opponentLP').textContent = this.opponent.lifePoints;
        
        // Contadores
        document.getElementById('playerDeckCount').textContent = this.player.deckCount;
        document.getElementById('opponentDeckCount').textContent = this.opponent.deckCount;
        document.getElementById('playerGraveCount').textContent = this.player.grave.length;
        document.getElementById('opponentGraveCount').textContent = this.opponent.grave.length;
        
        // Atualiza m√£os e campos
        this.updateHand('player');
        this.updateHand('opponent');
        this.updateField('player');
        this.updateField('opponent');
    },
    
    // Atualiza m√£o de um jogador
    updateHand(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player + 'Hand');
        container.innerHTML = '';
        
        if (player === 'player') {
            // Mostra cartas do jogador
            target.hand.forEach(card => {
                container.appendChild(this.createCardElement(card, player));
            });
        } else {
            // Mostra cartas viradas para oponente
            for (let i = 0; i < target.hand.length; i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'yugioh-card card-back';
                container.appendChild(cardBack);
            }
        }
    },
    
    // Atualiza campo de um jogador
    updateField(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player + 'Field');
        container.innerHTML = '';
        
        target.field.forEach(card => {
            container.appendChild(this.createCardElement(card, player));
        });
    },
    
    // Cria elemento de carta
    createCardElement(card, player) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `yugioh-card ${card.type}`;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'card-stats';
        
        if (card.type === 'monster') {
            statsDiv.innerHTML = `<span class="card-atk">ATK:${card.atk}</span> / <span class="card-def">DEF:${card.def}</span>`;
        } else {
            statsDiv.textContent = card.type.toUpperCase();
            statsDiv.style.color = card.type === 'spell' ? '#1e88e5' : '#8e24aa';
        }
        
        cardDiv.appendChild(nameDiv);
        cardDiv.appendChild(statsDiv);
        
        // Adiciona evento de clique apenas para cartas do jogador
        if (player === 'player') {
            cardDiv.onclick = () => {
                this.selectCard(card);
            };
        }
        
        return cardDiv;
    },
    
    // Seleciona carta (para futuras expans√µes)
    selectCard(card) {
        console.log("Carta selecionada:", card.name);
        // Pode expandir para permitir sele√ß√£o de alvos, etc.
    },
    
    // Atualiza indicador de turno
    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (this.turn === 'player') {
            indicator.textContent = 'Ìæ¥ SEU TURNO Ìæ¥';
            indicator.style.background = 'linear-gradient(45deg, #1a237e, #0d47a1)';
        } else {
            indicator.textContent = '‚ö° TURNO DO OPONENTE ‚ö°';
            indicator.style.background = 'linear-gradient(45deg, #b71c1c, #d32f2f)';
        }
    },
    
    // Adiciona mensagem ao log
    log(message, type = 'system') {
        const logContainer = document.getElementById('gameLog');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString().slice(0,5)}] ${message}`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    },
    
    // Toca som
    playSound(sound) {
        const audio = document.getElementById(sound + 'Sound');
        if (audio && this.isMusicPlaying) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("√Åudio n√£o pode tocar:", e));
        }
    },
    
    // Toca m√∫sica de fundo
    playMusic() {
        const music = document.getElementById('bgMusic');
        if (music) {
            music.volume = 0.3;
            music.play().catch(e => {
                console.log("M√∫sica precisa de intera√ß√£o do usu√°rio");
            });
        }
    },
    
    // Alterna m√∫sica
    toggleMusic() {
        const music = document.getElementById('bgMusic');
        const btn = document.querySelector('[onclick="toggleMusic()"] p');
        
        if (music.paused) {
            music.play();
            this.isMusicPlaying = true;
            btn.innerHTML = '<i class="fas fa-music"></i> M√öSICA: LIGADA';
            this.log("M√∫sica ligada", "system");
        } else {
            music.pause();
            this.isMusicPlaying = false;
            btn.innerHTML = '<i class="fas fa-volume-mute"></i> M√öSICA: DESLIGADA';
            this.log("M√∫sica desligada", "system");
        }
    }
};

// Inicializa quando a p√°gina carrega
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => game.init(), 1000);
    });
} else {
    setTimeout(() => game.init(), 1000);
}
JScat > scripts/engine.js << 'JS'
// YuGiOh Duel Arena - Motor do Jogo Simples

const game = {
    // Estado do jogo
    player: {
        name: "Yugi Muto",
        lifePoints: 8000,
        hand: [],
        field: [],
        deck: [],
        grave: [],
        deckCount: 35
    },
    
    opponent: {
        name: "Seto Kaiba",
        lifePoints: 8000,
        hand: [],
        field: [],
        deck: [],
        grave: [],
        deckCount: 35
    },
    
    turn: 'player',
    isMusicPlaying: true,
    gameStarted: false,
    
    // Cartas dispon√≠veis
    cards: [
        // Monstros
        { id: 1, name: "Mago Negro", type: "monster", atk: 2500, def: 2100, attribute: "DARK", level: 7 },
        { id: 2, name: "Kuriboh", type: "monster", atk: 300, def: 200, attribute: "DARK", level: 1 },
        { id: 3, name: "Gaia", type: "monster", atk: 2300, def: 2100, attribute: "EARTH", level: 6 },
        { id: 4, name: "Sangan", type: "monster", atk: 1000, def: 600, attribute: "DARK", level: 3 },
        { id: 5, name: "Drag√£o Branco", type: "monster", atk: 3000, def: 2500, attribute: "LIGHT", level: 8 },
        { id: 6, name: "Drag√£o Negro", type: "monster", atk: 2400, def: 2000, attribute: "DARK", level: 7 },
        
        // Magias
        { id: 101, name: "Raigeki", type: "spell", effect: "Destr√≥i todos monstros do oponente" },
        { id: 102, name: "Dark Hole", type: "spell", effect: "Destr√≥i todos monstros no campo" },
        { id: 103, name: "Monster Reborn", type: "spell", effect: "Revive 1 monstro do cemit√©rio" },
        
        // Armadilhas
        { id: 201, name: "Mirror Force", type: "trap", effect: "Destr√≥i monstros atacantes" },
        { id: 202, name: "Magic Cylinder", type: "trap", effect: "Redireciona dano de ataque" }
    ],
    
    // Inicializa√ß√£o do jogo
    init() {
        if (this.gameStarted) return;
        
        this.log("ÌæÆ Inicializando duelo...", "system");
        
        // Configura decks
        this.setupDecks();
        
        // Compra cartas iniciais
        for (let i = 0; i < 5; i++) {
            this.drawCard('player');
            this.drawCard('opponent');
        }
        
        // Inicia m√∫sica
        this.playMusic();
        
        // Atualiza interface
        this.updateUI();
        
        this.gameStarted = true;
        this.log("ÌøÜ DUELO INICIADO! Boa sorte, " + this.player.name + "!", "system");
        this.log("Ìæ¥ Seu turno come√ßou. Use 'Comprar Carta' para come√ßar!", "system");
    },
    
    // Configura os decks
    setupDecks() {
        // Cria c√≥pias das cartas para formar decks
        let playerDeck = [];
        let opponentDeck = [];
        
        // Adiciona m√∫ltiplas c√≥pias de cada carta
        for (let i = 0; i < 4; i++) {
            this.cards.forEach(card => {
                const cardCopy = { ...card };
                playerDeck.push(cardCopy);
                opponentDeck.push({ ...card });
            });
        }
        
        // Embaralha
        this.shuffle(playerDeck);
        this.shuffle(opponentDeck);
        
        // Atribui aos jogadores
        this.player.deck = playerDeck.slice(0, 35);
        this.opponent.deck = opponentDeck.slice(0, 35);
        
        this.player.deckCount = this.player.deck.length;
        this.opponent.deckCount = this.opponent.deck.length;
    },
    
    // Embaralha array
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    // Compra uma carta
    drawCard(player) {
        if (this.turn !== 'player' && player === 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        const target = player === 'player' ? this.player : this.opponent;
        
        if (target.deck.length === 0) {
            this.log((player === 'player' ? "Voc√™" : "Oponente") + " n√£o tem mais cartas!", "system");
            return null;
        }
        
        const card = target.deck.pop();
        target.hand.push(card);
        target.deckCount--;
        
        // Toca som
        this.playSound('draw');
        
        // Log
        if (player === 'player') {
            this.log("Voc√™ comprou: " + card.name, "player");
        }
        
        this.updateUI();
        return card;
    },
    
    // Invoca um monstro
    summonMonster() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.hand.length === 0) {
            this.log("Voc√™ n√£o tem cartas na m√£o!", "system");
            return;
        }
        
        // Encontra um monstro na m√£o
        const monster = this.player.hand.find(card => card.type === 'monster');
        
        if (!monster) {
            this.log("Nenhum monstro na m√£o para invocar!", "system");
            return;
        }
        
        if (this.player.field.length >= 3) {
            this.log("Seu campo est√° cheio (m√°x. 3 monstros)!", "system");
            return;
        }
        
        // Remove da m√£o e coloca no campo
        this.player.hand = this.player.hand.filter(c => c !== monster);
        this.player.field.push(monster);
        
        this.log("Voc√™ invocou: " + monster.name + " (ATK: " + monster.atk + ")", "player");
        this.updateUI();
    },
    
    // Ativa uma magia
    playSpell() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        const spell = this.player.hand.find(card => card.type === 'spell');
        
        if (!spell) {
            this.log("Nenhuma magia na m√£o!", "system");
            return;
        }
        
        // Remove da m√£o
        this.player.hand = this.player.hand.filter(c => c !== spell);
        this.player.grave.push(spell);
        
        // Aplica efeito baseado no nome
        if (spell.name === "Raigeki") {
            if (this.opponent.field.length > 0) {
                this.opponent.grave.push(...this.opponent.field);
                this.opponent.field = [];
                this.log("‚ö° RAIGEKI! Todos monstros do oponente destru√≠dos!", "player");
            }
        } else if (spell.name === "Dark Hole") {
            if (this.player.field.length > 0 || this.opponent.field.length > 0) {
                this.player.grave.push(...this.player.field);
                this.opponent.grave.push(...this.opponent.field);
                this.player.field = [];
                this.opponent.field = [];
                this.log("Ìµ≥Ô∏è DARK HOLE! Todos monstros destru√≠dos!", "system");
            }
        } else {
            this.log("Voc√™ ativou: " + spell.name, "player");
        }
        
        this.updateUI();
    },
    
    // Declara ataque
    declareAttack() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.field.length === 0) {
            this.log("Voc√™ n√£o tem monstros para atacar!", "system");
            return;
        }
        
        const attacker = this.player.field[0]; // Primeiro monstro
        const target = this.opponent.field[0]; // Primeiro monstro do oponente
        
        this.playSound('attack');
        
        if (target) {
            // Batalha entre monstros
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.opponent.lifePoints -= damage;
                this.opponent.field.shift(); // Remove primeiro monstro
                this.opponent.grave.push(target);
                this.log("‚öîÔ∏è " + attacker.name + " destruiu " + target.name + "! Dano: " + damage, "player");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.player.lifePoints -= damage;
                this.player.field.shift();
                this.player.grave.push(attacker);
                this.log("Ìª°Ô∏è " + target.name + " defendeu! Voc√™ sofreu " + damage + " de dano", "opponent");
            } else {
                this.player.field.shift();
                this.opponent.field.shift();
                this.player.grave.push(attacker);
                this.opponent.grave.push(target);
                this.log("ÔøΩÔøΩ Empate! Ambos monstros destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.opponent.lifePoints -= attacker.atk;
            this.log("ÌæØ Ataque direto! " + attacker.name + " causou " + attacker.atk + " de dano!", "player");
        }
        
        this.updateUI();
        this.checkGameOver();
    },
    
    // Finaliza turno
    endTurn() {
        this.turn = this.turn === 'player' ? 'opponent' : 'player';
        
        if (this.turn === 'opponent') {
            this.log("‚ö° Turno do oponente (Kaiba)!", "system");
            setTimeout(() => this.opponentAI(), 1000);
        } else {
            this.log("Ì±ë Seu turno (Yugi)!", "system");
        }
        
        this.updateTurnIndicator();
    },
    
    // IA do oponente
    opponentAI() {
        // Compra carta
        this.drawCard('opponent');
        
        // Tenta invocar monstro
        const monster = this.opponent.hand.find(c => c.type === 'monster');
        if (monster && this.opponent.field.length < 3) {
            this.opponent.hand = this.opponent.hand.filter(c => c !== monster);
            this.opponent.field.push(monster);
            this.log("Oponente invocou: " + monster.name, "opponent");
        }
        
        // Ataca se tiver monstros
        if (this.opponent.field.length > 0) {
            setTimeout(() => this.opponentAttack(), 1500);
        } else {
            setTimeout(() => this.endTurn(), 1000);
        }
        
        this.updateUI();
    },
    
    // Ataque do oponente
    opponentAttack() {
        const attacker = this.opponent.field[0];
        const target = this.player.field[0];
        
        this.playSound('attack');
        
        if (target) {
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.player.lifePoints -= damage;
                this.player.field.shift();
                this.player.grave.push(target);
                this.log("‚öîÔ∏è " + attacker.name + " destruiu " + target.name + "! Dano: " + damage, "opponent");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.opponent.lifePoints -= damage;
                this.opponent.field.shift();
                this.opponent.grave.push(attacker);
                this.log("Ìª°Ô∏è " + target.name + " defendeu! Oponente sofreu " + damage + " de dano", "player");
            } else {
                this.player.field.shift();
                this.opponent.field.shift();
                this.player.grave.push(target);
                this.opponent.grave.push(attacker);
                this.log("Ì≤• Empate! Ambos monstros destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.player.lifePoints -= attacker.atk;
            this.log("ÌæØ Ataque direto do oponente! " + attacker.atk + " de dano!", "opponent");
        }
        
        this.updateUI();
        this.checkGameOver();
        setTimeout(() => this.endTurn(), 1500);
    },
    
    // Verifica fim de jogo
    checkGameOver() {
        if (this.player.lifePoints <= 0) {
            this.log("Ì≤Ä VOC√ä PERDEU! Kaiba venceu o duelo!", "system");
            this.playSound('lose');
            this.gameOver();
        } else if (this.opponent.lifePoints <= 0) {
            this.log("ÌøÜ VOC√ä VENCEU! O cora√ß√£o das cartas estava com voc√™!", "system");
            this.playSound('win');
            this.gameOver();
        }
    },
    
    // Fim de jogo
    gameOver() {
        // Desabilita bot√µes
        document.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        
        // Adiciona bot√£o de rein√≠cio
        const restartBtn = document.createElement('button');
        restartBtn.className = 'rpgui-button golden';
        restartBtn.innerHTML = '<p><i class="fas fa-redo"></i> JOGAR NOVAMENTE</p>';
        restartBtn.onclick = () => location.reload();
        restartBtn.style.marginTop = '20px';
        document.querySelector('.controls-panel').appendChild(restartBtn);
    },
    
    // Atualiza interface
    updateUI() {
        // Life Points
        document.getElementById('playerLP').textContent = this.player.lifePoints;
        document.getElementById('opponentLP').textContent = this.opponent.lifePoints;
        
        // Contadores
        document.getElementById('playerDeckCount').textContent = this.player.deckCount;
        document.getElementById('opponentDeckCount').textContent = this.opponent.deckCount;
        document.getElementById('playerGraveCount').textContent = this.player.grave.length;
        document.getElementById('opponentGraveCount').textContent = this.opponent.grave.length;
        
        // Atualiza m√£os e campos
        this.updateHand('player');
        this.updateHand('opponent');
        this.updateField('player');
        this.updateField('opponent');
    },
    
    // Atualiza m√£o de um jogador
    updateHand(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player + 'Hand');
        container.innerHTML = '';
        
        if (player === 'player') {
            // Mostra cartas do jogador
            target.hand.forEach(card => {
                container.appendChild(this.createCardElement(card, player));
            });
        } else {
            // Mostra cartas viradas para oponente
            for (let i = 0; i < target.hand.length; i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'yugioh-card card-back';
                container.appendChild(cardBack);
            }
        }
    },
    
    // Atualiza campo de um jogador
    updateField(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player + 'Field');
        container.innerHTML = '';
        
        target.field.forEach(card => {
            container.appendChild(this.createCardElement(card, player));
        });
    },
    
    // Cria elemento de carta
    createCardElement(card, player) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `yugioh-card ${card.type}`;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'card-stats';
        
        if (card.type === 'monster') {
            statsDiv.innerHTML = `<span class="card-atk">ATK:${card.atk}</span> / <span class="card-def">DEF:${card.def}</span>`;
        } else {
            statsDiv.textContent = card.type.toUpperCase();
            statsDiv.style.color = card.type === 'spell' ? '#1e88e5' : '#8e24aa';
        }
        
        cardDiv.appendChild(nameDiv);
        cardDiv.appendChild(statsDiv);
        
        // Adiciona evento de clique apenas para cartas do jogador
        if (player === 'player') {
            cardDiv.onclick = () => {
                this.selectCard(card);
            };
        }
        
        return cardDiv;
    },
    
    // Seleciona carta (para futuras expans√µes)
    selectCard(card) {
        console.log("Carta selecionada:", card.name);
        // Pode expandir para permitir sele√ß√£o de alvos, etc.
    },
    
    // Atualiza indicador de turno
    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (this.turn === 'player') {
            indicator.textContent = 'Ìæ¥ SEU TURNO Ìæ¥';
            indicator.style.background = 'linear-gradient(45deg, #1a237e, #0d47a1)';
        } else {
            indicator.textContent = '‚ö° TURNO DO OPONENTE ‚ö°';
            indicator.style.background = 'linear-gradient(45deg, #b71c1c, #d32f2f)';
        }
    },
    
    // Adiciona mensagem ao log
    log(message, type = 'system') {
        const logContainer = document.getElementById('gameLog');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString().slice(0,5)}] ${message}`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    },
    
    // Toca som
    playSound(sound) {
        const audio = document.getElementById(sound + 'Sound');
        if (audio && this.isMusicPlaying) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("√Åudio n√£o pode tocar:", e));
        }
    },
    
    // Toca m√∫sica de fundo
    playMusic() {
        const music = document.getElementById('bgMusic');
        if (music) {
            music.volume = 0.3;
            music.play().catch(e => {
                console.log("M√∫sica precisa de intera√ß√£o do usu√°rio");
            });
        }
    },
    
    // Alterna m√∫sica
    toggleMusic() {
        const music = document.getElementById('bgMusic');
        const btn = document.querySelector('[onclick="toggleMusic()"] p');
        
        if (music.paused) {
            music.play();
            this.isMusicPlaying = true;
            btn.innerHTML = '<i class="fas fa-music"></i> M√öSICA: LIGADA';
            this.log("M√∫sica ligada", "system");
        } else {
            music.pause();
            this.isMusicPlaying = false;
            btn.innerHTML = '<i class="fas fa-volume-mute"></i> M√öSICA: DESLIGADA';
            this.log("M√∫sica desligada", "system");
        }
    }
};

// Inicializa quando a p√°gina carrega
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => game.init(), 1000);
    });
} else {
    setTimeout(() => game.init(), 1000);
}
JScat > scripts/engine.js << 'JS'
// YuGiOh Duel Arena - Motor do Jogo Simples

const game = {
    // Estado do jogo
    player: {
        name: "Yugi Muto",
        lifePoints: 8000,
        hand: [],
        field: [],
        deck: [],
        grave: [],
        deckCount: 35
    },
    
    opponent: {
        name: "Seto Kaiba",
        lifePoints: 8000,
        hand: [],
        field: [],
        deck: [],
        grave: [],
        deckCount: 35
    },
    
    turn: 'player',
    isMusicPlaying: true,
    gameStarted: false,
    
    // Cartas dispon√≠veis
    cards: [
        // Monstros
        { id: 1, name: "Mago Negro", type: "monster", atk: 2500, def: 2100, attribute: "DARK", level: 7 },
        { id: 2, name: "Kuriboh", type: "monster", atk: 300, def: 200, attribute: "DARK", level: 1 },
        { id: 3, name: "Gaia", type: "monster", atk: 2300, def: 2100, attribute: "EARTH", level: 6 },
        { id: 4, name: "Sangan", type: "monster", atk: 1000, def: 600, attribute: "DARK", level: 3 },
        { id: 5, name: "Drag√£o Branco", type: "monster", atk: 3000, def: 2500, attribute: "LIGHT", level: 8 },
        { id: 6, name: "Drag√£o Negro", type: "monster", atk: 2400, def: 2000, attribute: "DARK", level: 7 },
        
        // Magias
        { id: 101, name: "Raigeki", type: "spell", effect: "Destr√≥i todos monstros do oponente" },
        { id: 102, name: "Dark Hole", type: "spell", effect: "Destr√≥i todos monstros no campo" },
        { id: 103, name: "Monster Reborn", type: "spell", effect: "Revive 1 monstro do cemit√©rio" },
        
        // Armadilhas
        { id: 201, name: "Mirror Force", type: "trap", effect: "Destr√≥i monstros atacantes" },
        { id: 202, name: "Magic Cylinder", type: "trap", effect: "Redireciona dano de ataque" }
    ],
    
    // Inicializa√ß√£o do jogo
    init() {
        if (this.gameStarted) return;
        
        this.log("ÌæÆ Inicializando duelo...", "system");
        
        // Configura decks
        this.setupDecks();
        
        // Compra cartas iniciais
        for (let i = 0; i < 5; i++) {
            this.drawCard('player');
            this.drawCard('opponent');
        }
        
        // Inicia m√∫sica
        this.playMusic();
        
        // Atualiza interface
        this.updateUI();
        
        this.gameStarted = true;
        this.log("ÌøÜ DUELO INICIADO! Boa sorte, " + this.player.name + "!", "system");
        this.log("Ìæ¥ Seu turno come√ßou. Use 'Comprar Carta' para come√ßar!", "system");
    },
    
    // Configura os decks
    setupDecks() {
        // Cria c√≥pias das cartas para formar decks
        let playerDeck = [];
        let opponentDeck = [];
        
        // Adiciona m√∫ltiplas c√≥pias de cada carta
        for (let i = 0; i < 4; i++) {
            this.cards.forEach(card => {
                const cardCopy = { ...card };
                playerDeck.push(cardCopy);
                opponentDeck.push({ ...card });
            });
        }
        
        // Embaralha
        this.shuffle(playerDeck);
        this.shuffle(opponentDeck);
        
        // Atribui aos jogadores
        this.player.deck = playerDeck.slice(0, 35);
        this.opponent.deck = opponentDeck.slice(0, 35);
        
        this.player.deckCount = this.player.deck.length;
        this.opponent.deckCount = this.opponent.deck.length;
    },
    
    // Embaralha array
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    // Compra uma carta
    drawCard(player) {
        if (this.turn !== 'player' && player === 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        const target = player === 'player' ? this.player : this.opponent;
        
        if (target.deck.length === 0) {
            this.log((player === 'player' ? "Voc√™" : "Oponente") + " n√£o tem mais cartas!", "system");
            return null;
        }
        
        const card = target.deck.pop();
        target.hand.push(card);
        target.deckCount--;
        
        // Toca som
        this.playSound('draw');
        
        // Log
        if (player === 'player') {
            this.log("Voc√™ comprou: " + card.name, "player");
        }
        
        this.updateUI();
        return card;
    },
    
    // Invoca um monstro
    summonMonster() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.hand.length === 0) {
            this.log("Voc√™ n√£o tem cartas na m√£o!", "system");
            return;
        }
        
        // Encontra um monstro na m√£o
        const monster = this.player.hand.find(card => card.type === 'monster');
        
        if (!monster) {
            this.log("Nenhum monstro na m√£o para invocar!", "system");
            return;
        }
        
        if (this.player.field.length >= 3) {
            this.log("Seu campo est√° cheio (m√°x. 3 monstros)!", "system");
            return;
        }
        
        // Remove da m√£o e coloca no campo
        this.player.hand = this.player.hand.filter(c => c !== monster);
        this.player.field.push(monster);
        
        this.log("Voc√™ invocou: " + monster.name + " (ATK: " + monster.atk + ")", "player");
        this.updateUI();
    },
    
    // Ativa uma magia
    playSpell() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        const spell = this.player.hand.find(card => card.type === 'spell');
        
        if (!spell) {
            this.log("Nenhuma magia na m√£o!", "system");
            return;
        }
        
        // Remove da m√£o
        this.player.hand = this.player.hand.filter(c => c !== spell);
        this.player.grave.push(spell);
        
        // Aplica efeito baseado no nome
        if (spell.name === "Raigeki") {
            if (this.opponent.field.length > 0) {
                this.opponent.grave.push(...this.opponent.field);
                this.opponent.field = [];
                this.log("‚ö° RAIGEKI! Todos monstros do oponente destru√≠dos!", "player");
            }
        } else if (spell.name === "Dark Hole") {
            if (this.player.field.length > 0 || this.opponent.field.length > 0) {
                this.player.grave.push(...this.player.field);
                this.opponent.grave.push(...this.opponent.field);
                this.player.field = [];
                this.opponent.field = [];
                this.log("Ìµ≥Ô∏è DARK HOLE! Todos monstros destru√≠dos!", "system");
            }
        } else {
            this.log("Voc√™ ativou: " + spell.name, "player");
        }
        
        this.updateUI();
    },
    
    // Declara ataque
    declareAttack() {
        if (this.turn !== 'player') {
            this.log("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.field.length === 0) {
            this.log("Voc√™ n√£o tem monstros para atacar!", "system");
            return;
        }
        
        const attacker = this.player.field[0]; // Primeiro monstro
        const target = this.opponent.field[0]; // Primeiro monstro do oponente
        
        this.playSound('attack');
        
        if (target) {
            // Batalha entre monstros
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.opponent.lifePoints -= damage;
                this.opponent.field.shift(); // Remove primeiro monstro
                this.opponent.grave.push(target);
                this.log("‚öîÔ∏è " + attacker.name + " destruiu " + target.name + "! Dano: " + damage, "player");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.player.lifePoints -= damage;
                this.player.field.shift();
                this.player.grave.push(attacker);
                this.log("Ìª°Ô∏è " + target.name + " defendeu! Voc√™ sofreu " + damage + " de dano", "opponent");
            } else {
                this.player.field.shift();
                this.opponent.field.shift();
                this.player.grave.push(attacker);
                this.opponent.grave.push(target);
                this.log("ÔøΩÔøΩ Empate! Ambos monstros destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.opponent.lifePoints -= attacker.atk;
            this.log("ÌæØ Ataque direto! " + attacker.name + " causou " + attacker.atk + " de dano!", "player");
        }
        
        this.updateUI();
        this.checkGameOver();
    },
    
    // Finaliza turno
    endTurn() {
        this.turn = this.turn === 'player' ? 'opponent' : 'player';
        
        if (this.turn === 'opponent') {
            this.log("‚ö° Turno do oponente (Kaiba)!", "system");
            setTimeout(() => this.opponentAI(), 1000);
        } else {
            this.log("Ì±ë Seu turno (Yugi)!", "system");
        }
        
        this.updateTurnIndicator();
    },
    
    // IA do oponente
    opponentAI() {
        // Compra carta
        this.drawCard('opponent');
        
        // Tenta invocar monstro
        const monster = this.opponent.hand.find(c => c.type === 'monster');
        if (monster && this.opponent.field.length < 3) {
            this.opponent.hand = this.opponent.hand.filter(c => c !== monster);
            this.opponent.field.push(monster);
            this.log("Oponente invocou: " + monster.name, "opponent");
        }
        
        // Ataca se tiver monstros
        if (this.opponent.field.length > 0) {
            setTimeout(() => this.opponentAttack(), 1500);
        } else {
            setTimeout(() => this.endTurn(), 1000);
        }
        
        this.updateUI();
    },
    
    // Ataque do oponente
    opponentAttack() {
        const attacker = this.opponent.field[0];
        const target = this.player.field[0];
        
        this.playSound('attack');
        
        if (target) {
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.player.lifePoints -= damage;
                this.player.field.shift();
                this.player.grave.push(target);
                this.log("‚öîÔ∏è " + attacker.name + " destruiu " + target.name + "! Dano: " + damage, "opponent");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.opponent.lifePoints -= damage;
                this.opponent.field.shift();
                this.opponent.grave.push(attacker);
                this.log("Ìª°Ô∏è " + target.name + " defendeu! Oponente sofreu " + damage + " de dano", "player");
            } else {
                this.player.field.shift();
                this.opponent.field.shift();
                this.player.grave.push(target);
                this.opponent.grave.push(attacker);
                this.log("Ì≤• Empate! Ambos monstros destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.player.lifePoints -= attacker.atk;
            this.log("ÌæØ Ataque direto do oponente! " + attacker.atk + " de dano!", "opponent");
        }
        
        this.updateUI();
        this.checkGameOver();
        setTimeout(() => this.endTurn(), 1500);
    },
    
    // Verifica fim de jogo
    checkGameOver() {
        if (this.player.lifePoints <= 0) {
            this.log("Ì≤Ä VOC√ä PERDEU! Kaiba venceu o duelo!", "system");
            this.playSound('lose');
            this.gameOver();
        } else if (this.opponent.lifePoints <= 0) {
            this.log("ÌøÜ VOC√ä VENCEU! O cora√ß√£o das cartas estava com voc√™!", "system");
            this.playSound('win');
            this.gameOver();
        }
    },
    
    // Fim de jogo
    gameOver() {
        // Desabilita bot√µes
        document.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        
        // Adiciona bot√£o de rein√≠cio
        const restartBtn = document.createElement('button');
        restartBtn.className = 'rpgui-button golden';
        restartBtn.innerHTML = '<p><i class="fas fa-redo"></i> JOGAR NOVAMENTE</p>';
        restartBtn.onclick = () => location.reload();
        restartBtn.style.marginTop = '20px';
        document.querySelector('.controls-panel').appendChild(restartBtn);
    },
    
    // Atualiza interface
    updateUI() {
        // Life Points
        document.getElementById('playerLP').textContent = this.player.lifePoints;
        document.getElementById('opponentLP').textContent = this.opponent.lifePoints;
        
        // Contadores
        document.getElementById('playerDeckCount').textContent = this.player.deckCount;
        document.getElementById('opponentDeckCount').textContent = this.opponent.deckCount;
        document.getElementById('playerGraveCount').textContent = this.player.grave.length;
        document.getElementById('opponentGraveCount').textContent = this.opponent.grave.length;
        
        // Atualiza m√£os e campos
        this.updateHand('player');
        this.updateHand('opponent');
        this.updateField('player');
        this.updateField('opponent');
    },
    
    // Atualiza m√£o de um jogador
    updateHand(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player + 'Hand');
        container.innerHTML = '';
        
        if (player === 'player') {
            // Mostra cartas do jogador
            target.hand.forEach(card => {
                container.appendChild(this.createCardElement(card, player));
            });
        } else {
            // Mostra cartas viradas para oponente
            for (let i = 0; i < target.hand.length; i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'yugioh-card card-back';
                container.appendChild(cardBack);
            }
        }
    },
    
    // Atualiza campo de um jogador
    updateField(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player + 'Field');
        container.innerHTML = '';
        
        target.field.forEach(card => {
            container.appendChild(this.createCardElement(card, player));
        });
    },
    
    // Cria elemento de carta
    createCardElement(card, player) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `yugioh-card ${card.type}`;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'card-stats';
        
        if (card.type === 'monster') {
            statsDiv.innerHTML = `<span class="card-atk">ATK:${card.atk}</span> / <span class="card-def">DEF:${card.def}</span>`;
        } else {
            statsDiv.textContent = card.type.toUpperCase();
            statsDiv.style.color = card.type === 'spell' ? '#1e88e5' : '#8e24aa';
        }
        
        cardDiv.appendChild(nameDiv);
        cardDiv.appendChild(statsDiv);
        
        // Adiciona evento de clique apenas para cartas do jogador
        if (player === 'player') {
            cardDiv.onclick = () => {
                this.selectCard(card);
            };
        }
        
        return cardDiv;
    },
    
    // Seleciona carta (para futuras expans√µes)
    selectCard(card) {
        console.log("Carta selecionada:", card.name);
        // Pode expandir para permitir sele√ß√£o de alvos, etc.
    },
    
    // Atualiza indicador de turno
    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (this.turn === 'player') {
            indicator.textContent = 'Ìæ¥ SEU TURNO Ìæ¥';
            indicator.style.background = 'linear-gradient(45deg, #1a237e, #0d47a1)';
        } else {
            indicator.textContent = '‚ö° TURNO DO OPONENTE ‚ö°';
            indicator.style.background = 'linear-gradient(45deg, #b71c1c, #d32f2f)';
        }
    },
    
    // Adiciona mensagem ao log
    log(message, type = 'system') {
        const logContainer = document.getElementById('gameLog');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString().slice(0,5)}] ${message}`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    },
    
    // Toca som
    playSound(sound) {
        const audio = document.getElementById(sound + 'Sound');
        if (audio && this.isMusicPlaying) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("√Åudio n√£o pode tocar:", e));
        }
    },
    
    // Toca m√∫sica de fundo
    playMusic() {
        const music = document.getElementById('bgMusic');
        if (music) {
            music.volume = 0.3;
            music.play().catch(e => {
                console.log("M√∫sica precisa de intera√ß√£o do usu√°rio");
            });
        }
    },
    
    // Alterna m√∫sica
    toggleMusic() {
        const music = document.getElementById('bgMusic');
        const btn = document.querySelector('[onclick="toggleMusic()"] p');
        
        if (music.paused) {
            music.play();
            this.isMusicPlaying = true;
            btn.innerHTML = '<i class="fas fa-music"></i> M√öSICA: LIGADA';
            this.log("M√∫sica ligada", "system");
        } else {
            music.pause();
            this.isMusicPlaying = false;
            btn.innerHTML = '<i class="fas fa-volume-mute"></i> M√öSICA: DESLIGADA';
            this.log("M√∫sica desligada", "system");
        }
    }
};

// Inicializa quando a p√°gina carrega
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => game.init(), 1000);
    });
} else {
    setTimeout(() => game.init(), 1000);
}
