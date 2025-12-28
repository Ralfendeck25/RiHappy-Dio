// YuGiOh Duel Arena - Motor do Jogo

class YuGiOhGame {
    constructor() {
        this.player = {
            name: "Yugi Muto",
            lifePoints: 8000,
            deck: [],
            hand: [],
            field: {
                monsters: [],
                spells: [],
                traps: []
            },
            grave: [],
            deckCount: 35
        };
        
        this.opponent = {
            name: "Seto Kaiba",
            lifePoints: 8000,
            deck: [],
            hand: [],
            field: {
                monsters: [],
                spells: [],
                traps: []
            },
            grave: [],
            deckCount: 35
        };
        
        this.turn = 'player';
        this.phase = 'draw';
        this.selectedCard = null;
        this.isMusicPlaying = true;
        this.gameStarted = false;
        
        this.cardTypes = {
            monster: {
                name: "Monstro",
                color: "#e53935",
                icon: "Ì∞â"
            },
            spell: {
                name: "Magia",
                color: "#1e88e5",
                icon: "‚ú®"
            },
            trap: {
                name: "Armadilha",
                color: "#8e24aa",
                icon: "Ìµ∏Ô∏è"
            }
        };
        
        this.init();
    }
    
    init() {
        // Inicializa m√∫sica
        this.toggleMusic();
        
        // Cria decks iniciais
        this.createDecks();
        
        // Compra cartas iniciais
        this.initialDraw();
        
        // Atualiza UI
        this.updateUI();
        
        // Adiciona mensagem inicial
        this.addLog("ÌøÜ Bem-vindo ao Duelo! O destino est√° em suas m√£os!", "system");
        this.addLog("Ìæ¥ Seu turno come√ßou. Compre uma carta!", "system");
        
        this.gameStarted = true;
    }
    
    createDecks() {
        // Cartas de exemplo para o jogador
        this.player.deck = [
            { id: 1, name: "Mago Negro", type: "monster", atk: 2500, def: 2100, attribute: "DARK", level: 7 },
            { id: 2, name: "Kuriboh", type: "monster", atk: 300, def: 200, attribute: "DARK", level: 1 },
            { id: 3, name: "Gaia, o Campe√£o", type: "monster", atk: 2300, def: 2100, attribute: "EARTH", level: 7 },
            { id: 4, name: "Sangan", type: "monster", atk: 1000, def: 600, attribute: "DARK", level: 3 },
            { id: 5, name: "Witch of the Black Forest", type: "monster", atk: 1100, def: 1200, attribute: "DARK", level: 4 },
            { id: 101, name: "Raigeki", type: "spell", effect: "Destr√≥i todos os monstros do oponente." },
            { id: 102, name: "Dark Hole", type: "spell", effect: "Destr√≥i todos os monstros no campo." },
            { id: 103, name: "Monster Reborn", type: "spell", effect: "Revive 1 monstro do cemit√©rio." },
            { id: 201, name: "Mirror Force", type: "trap", effect: "Destr√≥i monstros atacantes." },
            { id: 202, name: "Magic Cylinder", type: "trap", effect: "Redireciona dano de ataque." }
        ];
        
        // Cartas de exemplo para o oponente
        this.opponent.deck = [
            { id: 11, name: "Drag√£o Branco de Olhos Azuis", type: "monster", atk: 3000, def: 2500, attribute: "LIGHT", level: 8 },
            { id: 12, name: "Drag√£o Negro de Olhos Vermelhos", type: "monster", atk: 2400, def: 2000, attribute: "DARK", level: 7 },
            { id: 13, name: "La Jinn", type: "monster", atk: 1800, def: 1000, attribute: "DARK", level: 5 },
            { id: 14, name: "Summoned Skull", type: "monster", atk: 2500, def: 1200, attribute: "DARK", level: 6 },
            { id: 15, name: "Battle Ox", type: "monster", atk: 1700, def: 1000, attribute: "EARTH", level: 4 },
            { id: 111, name: "Fissure", type: "spell", effect: "Destr√≥i 1 monstro do oponente." },
            { id: 112, name: "De-Spell", type: "spell", effect: "Destr√≥i 1 carta de Magia." },
            { id: 211, name: "Trap Hole", type: "trap", effect: "Destr√≥i monstro invocado." },
            { id: 212, name: "Waboku", type: "trap", effect: "Previne dano de batalha." }
        ];
        
        // Embaralha os decks
        this.shuffleDeck(this.player.deck);
        this.shuffleDeck(this.opponent.deck);
    }
    
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    initialDraw() {
        // Compra 5 cartas para cada jogador
        for (let i = 0; i < 5; i++) {
            this.drawCard('player');
            this.drawCard('opponent');
        }
    }
    
    drawCard(player) {
        const target = player === 'player' ? this.player : this.opponent;
        
        if (target.deck.length === 0) {
            this.addLog(`${target.name} n√£o tem mais cartas no deck!`, "system");
            return null;
        }
        
        const card = target.deck.pop();
        target.hand.push(card);
        target.deckCount--;
        
        // Toca som de compra
        this.playSound('draw');
        
        // Log
        if (player === 'player') {
            this.addLog(`Voc√™ comprou: ${card.name}`, "player");
        }
        
        this.updateUI();
        return card;
    }
    
    summonMonster() {
        if (this.turn !== 'player') {
            this.addLog("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.hand.length === 0) {
            this.addLog("Voc√™ n√£o tem cartas na m√£o!", "system");
            return;
        }
        
        // Encontra um monstro na m√£o
        const monster = this.player.hand.find(card => card.type === 'monster');
        
        if (!monster) {
            this.addLog("Nenhum monstro na m√£o para invocar!", "system");
            return;
        }
        
        if (this.player.field.monsters.length >= 3) {
            this.addLog("Zona de monstros cheia!", "system");
            return;
        }
        
        // Remove da m√£o e coloca no campo
        this.player.hand = this.player.hand.filter(c => c !== monster);
        this.player.field.monsters.push(monster);
        
        this.addLog(`Voc√™ invocou: ${monster.name} (ATK: ${monster.atk}/DEF: ${monster.def})`, "player");
        this.updateUI();
    }
    
    playSpell() {
        if (this.turn !== 'player') {
            this.addLog("N√£o √© seu turno!", "system");
            return;
        }
        
        const spell = this.player.hand.find(card => card.type === 'spell');
        
        if (!spell) {
            this.addLog("Nenhuma magia na m√£o!", "system");
            return;
        }
        
        // Remove da m√£o e aplica efeito
        this.player.hand = this.player.hand.filter(c => c !== spell);
        this.player.grave.push(spell);
        
        // Efeito da magia (exemplo)
        if (spell.name === "Raigeki") {
            this.opponent.field.monsters = [];
            this.addLog("‚ö° RAIGEKI! Todos os monstros do oponente foram destru√≠dos!", "player");
        } else if (spell.name === "Dark Hole") {
            this.player.field.monsters = [];
            this.opponent.field.monsters = [];
            this.addLog("Ìµ≥Ô∏è Buraco Negro! Todos os monstros foram destru√≠dos!", "system");
        } else if (spell.name === "Monster Reborn") {
            if (this.player.grave.some(c => c.type === 'monster')) {
                const revived = this.player.grave.find(c => c.type === 'monster');
                this.player.grave = this.player.grave.filter(c => c !== revived);
                this.player.field.monsters.push(revived);
                this.addLog(`‚ú® Monster Reborn! ${revived.name} voltou do cemit√©rio!`, "player");
            }
        }
        
        this.updateUI();
    }
    
    declareAttack() {
        if (this.turn !== 'player') {
            this.addLog("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.field.monsters.length === 0) {
            this.addLog("Voc√™ n√£o tem monstros para atacar!", "system");
            return;
        }
        
        const attacker = this.player.field.monsters[0];
        const target = this.opponent.field.monsters[0];
        
        this.playSound('attack');
        
        if (target) {
            // Batalha entre monstros
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.opponent.lifePoints -= damage;
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== target);
                this.opponent.grave.push(target);
                this.addLog(`‚öîÔ∏è ${attacker.name} destruiu ${target.name}! Dano: ${damage}`, "player");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.player.lifePoints -= damage;
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== attacker);
                this.player.grave.push(attacker);
                this.addLog(`Ìª°Ô∏è ${target.name} resistiu ao ataque! Voc√™ sofreu ${damage} de dano`, "opponent");
            } else {
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== attacker);
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== target);
                this.player.grave.push(attacker);
                this.opponent.grave.push(target);
                this.addLog("Ì≤• Ambos monstros foram destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.opponent.lifePoints -= attacker.atk;
            this.addLog(`ÌæØ Ataque direto! ${attacker.name} causou ${attacker.atk} de dano!`, "player");
        }
        
        this.updateUI();
        this.checkGameOver();
    }
    
    endTurn() {
        if (this.turn === 'player') {
            this.turn = 'opponent';
            this.addLog("Turno do oponente!", "system");
            
            // IA do oponente
            setTimeout(() => this.opponentTurn(), 1000);
        } else {
            this.turn = 'player';
            this.addLog("Seu turno!", "system");
        }
        
        this.updateTurnIndicator();
    }
    
    opponentTurn() {
        // IA simples do oponente
        
        // Compra carta
        this.drawCard('opponent');
        
        // Tenta invocar monstro
        const monster = this.opponent.hand.find(c => c.type === 'monster');
        if (monster && this.opponent.field.monsters.length < 3) {
            this.opponent.hand = this.opponent.hand.filter(c => c !== monster);
            this.opponent.field.monsters.push(monster);
            this.addLog(`Oponente invocou: ${monster.name}`, "opponent");
        }
        
        // Ataca se tiver monstros
        if (this.opponent.field.monsters.length > 0) {
            setTimeout(() => this.opponentAttack(), 1500);
        } else {
            setTimeout(() => this.endTurn(), 1000);
        }
        
        this.updateUI();
    }
    
    opponentAttack() {
        const attacker = this.opponent.field.monsters[0];
        const target = this.player.field.monsters[0];
        
        this.playSound('attack');
        
        if (target) {
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.player.lifePoints -= damage;
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== target);
                this.player.grave.push(target);
                this.addLog(`‚öîÔ∏è ${attacker.name} destruiu ${target.name}! Dano: ${damage}`, "opponent");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.opponent.lifePoints -= damage;
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== attacker);
                this.opponent.grave.push(attacker);
                this.addLog(`Ìª°Ô∏è ${target.name} resistiu ao ataque! Oponente sofreu ${damage} de dano`, "player");
            } else {
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== target);
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== attacker);
                this.player.grave.push(target);
                this.opponent.grave.push(attacker);
                this.addLog("Ì≤• Ambos monstros foram destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.player.lifePoints -= attacker.atk;
            this.addLog(`ÌæØ Ataque direto! ${attacker.name} causou ${attacker.atk} de dano!`, "opponent");
        }
        
        this.updateUI();
        this.checkGameOver();
        
        setTimeout(() => this.endTurn(), 1500);
    }
    
    checkGameOver() {
        if (this.player.lifePoints <= 0) {
            this.addLog("Ì≤Ä VOC√ä PERDEU! Kaiba venceu o duelo!", "system");
            this.playSound('lose');
            this.gameOver();
        } else if (this.opponent.lifePoints <= 0) {
            this.addLog("ÌøÜ VOC√ä VENCEU! O cora√ß√£o das cartas estava com voc√™!", "system");
            this.playSound('win');
            this.gameOver();
        }
    }
    
    gameOver() {
        // Desabilita bot√µes
        document.querySelectorAll('.rpgui-button').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        });
        
        // Adiciona bot√£o de rein√≠cio
        const restartBtn = document.createElement('div');
        restartBtn.className = 'rpgui-button golden';
        restartBtn.innerHTML = '<p><i class="fas fa-redo"></i> JOGAR NOVAMENTE</p>';
        restartBtn.onclick = () => location.reload();
        restartBtn.style.marginTop = '20px';
        document.querySelector('.controls-panel').appendChild(restartBtn);
    }
    
    updateUI() {
        // Atualiza Life Points
        document.getElementById('playerLP').textContent = this.player.lifePoints;
        document.getElementById('opponentLP').textContent = this.opponent.lifePoints;
        
        // Atualiza contadores
        document.getElementById('playerDeckCount').textContent = this.player.deckCount;
        document.getElementById('opponentDeckCount').textContent = this.opponent.deckCount;
        document.getElementById('playerGraveCount').textContent = this.player.grave.length;
        document.getElementById('opponentGraveCount').textContent = this.opponent.grave.length;
        
        // Atualiza m√£os
        this.updateHand('player');
        this.updateHand('opponent');
        
        // Atualiza campos
        this.updateField('player');
        this.updateField('opponent');
    }
    
    updateHand(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player === 'player' ? 'playerHand' : 'opponentHand');
        
        container.innerHTML = '';
        
        target.hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index, player);
            container.appendChild(cardElement);
        });
        
        // Adiciona cartas viradas para o oponente
        if (player === 'opponent') {
            for (let i = 0; i < target.hand.length; i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'yugioh-card card-back';
                container.appendChild(cardBack);
            }
        }
    }
    
    updateField(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player === 'player' ? 'playerField' : 'opponentField');
        
        container.innerHTML = '';
        
        target.field.monsters.forEach((monster, index) => {
            const slot = document.createElement('div');
            slot.className = 'field-slot occupied';
            
            const cardElement = this.createCardElement(monster, index, player);
            slot.appendChild(cardElement);
            
            container.appendChild(slot);
        });
        
        // Adiciona slots vazios
        const emptySlots = 3 - target.field.monsters.length;
        for (let i = 0; i < emptySlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'field-slot';
            emptySlot.textContent = 'VAZIO';
            container.appendChild(emptySlot);
        }
    }
    
    createCardElement(card, index, player) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `yugioh-card ${card.type}`;
        cardDiv.dataset.index = index;
        
        let content = '';
        
        if (card.type === 'monster') {
            content = `
                <div style="font-size: 0.6rem; text-align: center; padding: 5px; color: ${this.cardTypes[card.type].color};">
                    ${this.cardTypes[card.type].icon} ${card.name}
                </div>
                <div style="font-size: 0.5rem; text-align: center; padding: 0 5px; color: #ccc;">
                    ${card.attribute} ‚òÖ${card.level}
                </div>
                <div class="card-stats">
                    <span class="card-atk">ATK: ${card.atk}</span>
                    <span class="card-def">DEF: ${card.def}</span>
                </div>
            `;
        } else {
            content = `
                <div style="font-size: 0.6rem; text-align: center; padding: 5px; color: ${this.cardTypes[card.type].color};">
                    ${this.cardTypes[card.type].icon} ${card.name}
                </div>
                <div style="font-size: 0.4rem; text-align: center; padding: 0 5px; color: #aaa; margin-top: 10px;">
                    ${card.effect || 'Carta de ' + this.cardTypes[card.type].name}
                </div>
            `;
        }
        
        cardDiv.innerHTML = content;
        
        // S√≥ permite intera√ß√£o com cartas do jogador
        if (player === 'player') {
            cardDiv.onclick = () => {
                this.selectCard(card);
            };
        }
        
        return cardDiv;
    }
    
    selectCard(card) {
        this.selectedCard = card;
        this.addLog(`Carta selecionada: ${card.name}`, "system");
    }
    
    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (this.turn === 'player') {
            indicator.textContent = 'Ìæ¥ SEU TURNO Ìæ¥';
            indicator.style.background = 'linear-gradient(45deg, #1a237e, #283593)';
        } else {
            indicator.textContent = '‚ö° TURNO DO OPONENTE ‚ö°';
            indicator.style.background = 'linear-gradient(45deg, #b71c1c, #d32f2f)';
        }
    }
    
    addLog(message, type) {
        const logContainer = document.getElementById('gameLog');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString().slice(0,5)}] ${message}`;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    playSound(soundName) {
        const audio = document.getElementById(soundName + 'Sound');
        if (audio && this.isMusicPlaying) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("√Åudio:", e));
        }
    }
    
    toggleMusic() {
        const bgMusic = document.getElementById('bgMusic');
        const btn = document.querySelector('[onclick="toggleMusic()"] p');
        
        if (this.isMusicPlaying) {
            bgMusic.pause();
            this.isMusicPlaying = false;
            btn.innerHTML = '<i class="fas fa-music"></i> M√öSICA: OFF';
        } else {
            bgMusic.play().catch(e => console.log("Precisa de intera√ß√£o do usu√°rio"));
            this.isMusicPlaying = true;
            btn.innerHTML = '<i class="fas fa-music"></i> M√öSICA: ON';
        }
    }
}

// Inicializa o jogo
let game;

window.onload = function() {
    game = new YuGiOhGame();
    
    // Expor fun√ß√µes para os bot√µes HTML
    window.drawCard = () => game.drawCard('player');
    window.summonMonster = () => game.summonMonster();
    window.playSpell = () => game.playSpell();
    window.declareAttack = () => game.declareAttack();
    window.endTurn = () => game.endTurn();
    window.toggleMusic = () => game.toggleMusic();
};
JScat > scripts/engine.js << 'JS'
// YuGiOh Duel Arena - Motor do Jogo

class YuGiOhGame {
    constructor() {
        this.player = {
            name: "Yugi Muto",
            lifePoints: 8000,
            deck: [],
            hand: [],
            field: {
                monsters: [],
                spells: [],
                traps: []
            },
            grave: [],
            deckCount: 35
        };
        
        this.opponent = {
            name: "Seto Kaiba",
            lifePoints: 8000,
            deck: [],
            hand: [],
            field: {
                monsters: [],
                spells: [],
                traps: []
            },
            grave: [],
            deckCount: 35
        };
        
        this.turn = 'player';
        this.phase = 'draw';
        this.selectedCard = null;
        this.isMusicPlaying = true;
        this.gameStarted = false;
        
        this.cardTypes = {
            monster: {
                name: "Monstro",
                color: "#e53935",
                icon: "Ì∞â"
            },
            spell: {
                name: "Magia",
                color: "#1e88e5",
                icon: "‚ú®"
            },
            trap: {
                name: "Armadilha",
                color: "#8e24aa",
                icon: "Ìµ∏Ô∏è"
            }
        };
        
        this.init();
    }
    
    init() {
        // Inicializa m√∫sica
        this.toggleMusic();
        
        // Cria decks iniciais
        this.createDecks();
        
        // Compra cartas iniciais
        this.initialDraw();
        
        // Atualiza UI
        this.updateUI();
        
        // Adiciona mensagem inicial
        this.addLog("ÌøÜ Bem-vindo ao Duelo! O destino est√° em suas m√£os!", "system");
        this.addLog("Ìæ¥ Seu turno come√ßou. Compre uma carta!", "system");
        
        this.gameStarted = true;
    }
    
    createDecks() {
        // Cartas de exemplo para o jogador
        this.player.deck = [
            { id: 1, name: "Mago Negro", type: "monster", atk: 2500, def: 2100, attribute: "DARK", level: 7 },
            { id: 2, name: "Kuriboh", type: "monster", atk: 300, def: 200, attribute: "DARK", level: 1 },
            { id: 3, name: "Gaia, o Campe√£o", type: "monster", atk: 2300, def: 2100, attribute: "EARTH", level: 7 },
            { id: 4, name: "Sangan", type: "monster", atk: 1000, def: 600, attribute: "DARK", level: 3 },
            { id: 5, name: "Witch of the Black Forest", type: "monster", atk: 1100, def: 1200, attribute: "DARK", level: 4 },
            { id: 101, name: "Raigeki", type: "spell", effect: "Destr√≥i todos os monstros do oponente." },
            { id: 102, name: "Dark Hole", type: "spell", effect: "Destr√≥i todos os monstros no campo." },
            { id: 103, name: "Monster Reborn", type: "spell", effect: "Revive 1 monstro do cemit√©rio." },
            { id: 201, name: "Mirror Force", type: "trap", effect: "Destr√≥i monstros atacantes." },
            { id: 202, name: "Magic Cylinder", type: "trap", effect: "Redireciona dano de ataque." }
        ];
        
        // Cartas de exemplo para o oponente
        this.opponent.deck = [
            { id: 11, name: "Drag√£o Branco de Olhos Azuis", type: "monster", atk: 3000, def: 2500, attribute: "LIGHT", level: 8 },
            { id: 12, name: "Drag√£o Negro de Olhos Vermelhos", type: "monster", atk: 2400, def: 2000, attribute: "DARK", level: 7 },
            { id: 13, name: "La Jinn", type: "monster", atk: 1800, def: 1000, attribute: "DARK", level: 5 },
            { id: 14, name: "Summoned Skull", type: "monster", atk: 2500, def: 1200, attribute: "DARK", level: 6 },
            { id: 15, name: "Battle Ox", type: "monster", atk: 1700, def: 1000, attribute: "EARTH", level: 4 },
            { id: 111, name: "Fissure", type: "spell", effect: "Destr√≥i 1 monstro do oponente." },
            { id: 112, name: "De-Spell", type: "spell", effect: "Destr√≥i 1 carta de Magia." },
            { id: 211, name: "Trap Hole", type: "trap", effect: "Destr√≥i monstro invocado." },
            { id: 212, name: "Waboku", type: "trap", effect: "Previne dano de batalha." }
        ];
        
        // Embaralha os decks
        this.shuffleDeck(this.player.deck);
        this.shuffleDeck(this.opponent.deck);
    }
    
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    initialDraw() {
        // Compra 5 cartas para cada jogador
        for (let i = 0; i < 5; i++) {
            this.drawCard('player');
            this.drawCard('opponent');
        }
    }
    
    drawCard(player) {
        const target = player === 'player' ? this.player : this.opponent;
        
        if (target.deck.length === 0) {
            this.addLog(`${target.name} n√£o tem mais cartas no deck!`, "system");
            return null;
        }
        
        const card = target.deck.pop();
        target.hand.push(card);
        target.deckCount--;
        
        // Toca som de compra
        this.playSound('draw');
        
        // Log
        if (player === 'player') {
            this.addLog(`Voc√™ comprou: ${card.name}`, "player");
        }
        
        this.updateUI();
        return card;
    }
    
    summonMonster() {
        if (this.turn !== 'player') {
            this.addLog("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.hand.length === 0) {
            this.addLog("Voc√™ n√£o tem cartas na m√£o!", "system");
            return;
        }
        
        // Encontra um monstro na m√£o
        const monster = this.player.hand.find(card => card.type === 'monster');
        
        if (!monster) {
            this.addLog("Nenhum monstro na m√£o para invocar!", "system");
            return;
        }
        
        if (this.player.field.monsters.length >= 3) {
            this.addLog("Zona de monstros cheia!", "system");
            return;
        }
        
        // Remove da m√£o e coloca no campo
        this.player.hand = this.player.hand.filter(c => c !== monster);
        this.player.field.monsters.push(monster);
        
        this.addLog(`Voc√™ invocou: ${monster.name} (ATK: ${monster.atk}/DEF: ${monster.def})`, "player");
        this.updateUI();
    }
    
    playSpell() {
        if (this.turn !== 'player') {
            this.addLog("N√£o √© seu turno!", "system");
            return;
        }
        
        const spell = this.player.hand.find(card => card.type === 'spell');
        
        if (!spell) {
            this.addLog("Nenhuma magia na m√£o!", "system");
            return;
        }
        
        // Remove da m√£o e aplica efeito
        this.player.hand = this.player.hand.filter(c => c !== spell);
        this.player.grave.push(spell);
        
        // Efeito da magia (exemplo)
        if (spell.name === "Raigeki") {
            this.opponent.field.monsters = [];
            this.addLog("‚ö° RAIGEKI! Todos os monstros do oponente foram destru√≠dos!", "player");
        } else if (spell.name === "Dark Hole") {
            this.player.field.monsters = [];
            this.opponent.field.monsters = [];
            this.addLog("Ìµ≥Ô∏è Buraco Negro! Todos os monstros foram destru√≠dos!", "system");
        } else if (spell.name === "Monster Reborn") {
            if (this.player.grave.some(c => c.type === 'monster')) {
                const revived = this.player.grave.find(c => c.type === 'monster');
                this.player.grave = this.player.grave.filter(c => c !== revived);
                this.player.field.monsters.push(revived);
                this.addLog(`‚ú® Monster Reborn! ${revived.name} voltou do cemit√©rio!`, "player");
            }
        }
        
        this.updateUI();
    }
    
    declareAttack() {
        if (this.turn !== 'player') {
            this.addLog("N√£o √© seu turno!", "system");
            return;
        }
        
        if (this.player.field.monsters.length === 0) {
            this.addLog("Voc√™ n√£o tem monstros para atacar!", "system");
            return;
        }
        
        const attacker = this.player.field.monsters[0];
        const target = this.opponent.field.monsters[0];
        
        this.playSound('attack');
        
        if (target) {
            // Batalha entre monstros
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.opponent.lifePoints -= damage;
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== target);
                this.opponent.grave.push(target);
                this.addLog(`‚öîÔ∏è ${attacker.name} destruiu ${target.name}! Dano: ${damage}`, "player");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.player.lifePoints -= damage;
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== attacker);
                this.player.grave.push(attacker);
                this.addLog(`Ìª°Ô∏è ${target.name} resistiu ao ataque! Voc√™ sofreu ${damage} de dano`, "opponent");
            } else {
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== attacker);
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== target);
                this.player.grave.push(attacker);
                this.opponent.grave.push(target);
                this.addLog("Ì≤• Ambos monstros foram destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.opponent.lifePoints -= attacker.atk;
            this.addLog(`ÌæØ Ataque direto! ${attacker.name} causou ${attacker.atk} de dano!`, "player");
        }
        
        this.updateUI();
        this.checkGameOver();
    }
    
    endTurn() {
        if (this.turn === 'player') {
            this.turn = 'opponent';
            this.addLog("Turno do oponente!", "system");
            
            // IA do oponente
            setTimeout(() => this.opponentTurn(), 1000);
        } else {
            this.turn = 'player';
            this.addLog("Seu turno!", "system");
        }
        
        this.updateTurnIndicator();
    }
    
    opponentTurn() {
        // IA simples do oponente
        
        // Compra carta
        this.drawCard('opponent');
        
        // Tenta invocar monstro
        const monster = this.opponent.hand.find(c => c.type === 'monster');
        if (monster && this.opponent.field.monsters.length < 3) {
            this.opponent.hand = this.opponent.hand.filter(c => c !== monster);
            this.opponent.field.monsters.push(monster);
            this.addLog(`Oponente invocou: ${monster.name}`, "opponent");
        }
        
        // Ataca se tiver monstros
        if (this.opponent.field.monsters.length > 0) {
            setTimeout(() => this.opponentAttack(), 1500);
        } else {
            setTimeout(() => this.endTurn(), 1000);
        }
        
        this.updateUI();
    }
    
    opponentAttack() {
        const attacker = this.opponent.field.monsters[0];
        const target = this.player.field.monsters[0];
        
        this.playSound('attack');
        
        if (target) {
            if (attacker.atk > target.def) {
                const damage = attacker.atk - target.def;
                this.player.lifePoints -= damage;
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== target);
                this.player.grave.push(target);
                this.addLog(`‚öîÔ∏è ${attacker.name} destruiu ${target.name}! Dano: ${damage}`, "opponent");
            } else if (attacker.atk < target.def) {
                const damage = target.def - attacker.atk;
                this.opponent.lifePoints -= damage;
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== attacker);
                this.opponent.grave.push(attacker);
                this.addLog(`Ìª°Ô∏è ${target.name} resistiu ao ataque! Oponente sofreu ${damage} de dano`, "player");
            } else {
                this.player.field.monsters = this.player.field.monsters.filter(m => m !== target);
                this.opponent.field.monsters = this.opponent.field.monsters.filter(m => m !== attacker);
                this.player.grave.push(target);
                this.opponent.grave.push(attacker);
                this.addLog("Ì≤• Ambos monstros foram destru√≠dos!", "system");
            }
        } else {
            // Ataque direto
            this.player.lifePoints -= attacker.atk;
            this.addLog(`ÌæØ Ataque direto! ${attacker.name} causou ${attacker.atk} de dano!`, "opponent");
        }
        
        this.updateUI();
        this.checkGameOver();
        
        setTimeout(() => this.endTurn(), 1500);
    }
    
    checkGameOver() {
        if (this.player.lifePoints <= 0) {
            this.addLog("Ì≤Ä VOC√ä PERDEU! Kaiba venceu o duelo!", "system");
            this.playSound('lose');
            this.gameOver();
        } else if (this.opponent.lifePoints <= 0) {
            this.addLog("ÌøÜ VOC√ä VENCEU! O cora√ß√£o das cartas estava com voc√™!", "system");
            this.playSound('win');
            this.gameOver();
        }
    }
    
    gameOver() {
        // Desabilita bot√µes
        document.querySelectorAll('.rpgui-button').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        });
        
        // Adiciona bot√£o de rein√≠cio
        const restartBtn = document.createElement('div');
        restartBtn.className = 'rpgui-button golden';
        restartBtn.innerHTML = '<p><i class="fas fa-redo"></i> JOGAR NOVAMENTE</p>';
        restartBtn.onclick = () => location.reload();
        restartBtn.style.marginTop = '20px';
        document.querySelector('.controls-panel').appendChild(restartBtn);
    }
    
    updateUI() {
        // Atualiza Life Points
        document.getElementById('playerLP').textContent = this.player.lifePoints;
        document.getElementById('opponentLP').textContent = this.opponent.lifePoints;
        
        // Atualiza contadores
        document.getElementById('playerDeckCount').textContent = this.player.deckCount;
        document.getElementById('opponentDeckCount').textContent = this.opponent.deckCount;
        document.getElementById('playerGraveCount').textContent = this.player.grave.length;
        document.getElementById('opponentGraveCount').textContent = this.opponent.grave.length;
        
        // Atualiza m√£os
        this.updateHand('player');
        this.updateHand('opponent');
        
        // Atualiza campos
        this.updateField('player');
        this.updateField('opponent');
    }
    
    updateHand(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player === 'player' ? 'playerHand' : 'opponentHand');
        
        container.innerHTML = '';
        
        target.hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index, player);
            container.appendChild(cardElement);
        });
        
        // Adiciona cartas viradas para o oponente
        if (player === 'opponent') {
            for (let i = 0; i < target.hand.length; i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'yugioh-card card-back';
                container.appendChild(cardBack);
            }
        }
    }
    
    updateField(player) {
        const target = player === 'player' ? this.player : this.opponent;
        const container = document.getElementById(player === 'player' ? 'playerField' : 'opponentField');
        
        container.innerHTML = '';
        
        target.field.monsters.forEach((monster, index) => {
            const slot = document.createElement('div');
            slot.className = 'field-slot occupied';
            
            const cardElement = this.createCardElement(monster, index, player);
            slot.appendChild(cardElement);
            
            container.appendChild(slot);
        });
        
        // Adiciona slots vazios
        const emptySlots = 3 - target.field.monsters.length;
        for (let i = 0; i < emptySlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'field-slot';
            emptySlot.textContent = 'VAZIO';
            container.appendChild(emptySlot);
        }
    }
    
    createCardElement(card, index, player) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `yugioh-card ${card.type}`;
        cardDiv.dataset.index = index;
        
        let content = '';
        
        if (card.type === 'monster') {
            content = `
                <div style="font-size: 0.6rem; text-align: center; padding: 5px; color: ${this.cardTypes[card.type].color};">
                    ${this.cardTypes[card.type].icon} ${card.name}
                </div>
                <div style="font-size: 0.5rem; text-align: center; padding: 0 5px; color: #ccc;">
                    ${card.attribute} ‚òÖ${card.level}
                </div>
                <div class="card-stats">
                    <span class="card-atk">ATK: ${card.atk}</span>
                    <span class="card-def">DEF: ${card.def}</span>
                </div>
            `;
        } else {
            content = `
                <div style="font-size: 0.6rem; text-align: center; padding: 5px; color: ${this.cardTypes[card.type].color};">
                    ${this.cardTypes[card.type].icon} ${card.name}
                </div>
                <div style="font-size: 0.4rem; text-align: center; padding: 0 5px; color: #aaa; margin-top: 10px;">
                    ${card.effect || 'Carta de ' + this.cardTypes[card.type].name}
                </div>
            `;
        }
        
        cardDiv.innerHTML = content;
        
        // S√≥ permite intera√ß√£o com cartas do jogador
        if (player === 'player') {
            cardDiv.onclick = () => {
                this.selectCard(card);
            };
        }
        
        return cardDiv;
    }
    
    selectCard(card) {
        this.selectedCard = card;
        this.addLog(`Carta selecionada: ${card.name}`, "system");
    }
    
    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (this.turn === 'player') {
            indicator.textContent = 'Ìæ¥ SEU TURNO Ìæ¥';
            indicator.style.background = 'linear-gradient(45deg, #1a237e, #283593)';
        } else {
            indicator.textContent = '‚ö° TURNO DO OPONENTE ‚ö°';
            indicator.style.background = 'linear-gradient(45deg, #b71c1c, #d32f2f)';
        }
    }
    
    addLog(message, type) {
        const logContainer = document.getElementById('gameLog');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString().slice(0,5)}] ${message}`;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    playSound(soundName) {
        const audio = document.getElementById(soundName + 'Sound');
        if (audio && this.isMusicPlaying) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("√Åudio:", e));
        }
    }
    
    toggleMusic() {
        const bgMusic = document.getElementById('bgMusic');
        const btn = document.querySelector('[onclick="toggleMusic()"] p');
        
        if (this.isMusicPlaying) {
            bgMusic.pause();
            this.isMusicPlaying = false;
            btn.innerHTML = '<i class="fas fa-music"></i> M√öSICA: OFF';
        } else {
            bgMusic.play().catch(e => console.log("Precisa de intera√ß√£o do usu√°rio"));
            this.isMusicPlaying = true;
            btn.innerHTML = '<i class="fas fa-music"></i> M√öSICA: ON';
        }
    }
}

// Inicializa o jogo
let game;

window.onload = function() {
    game = new YuGiOhGame();
    
    // Expor fun√ß√µes para os bot√µes HTML
    window.drawCard = () => game.drawCard('player');
    window.summonMonster = () => game.summonMonster();
    window.playSpell = () => game.playSpell();
    window.declareAttack = () => game.declareAttack();
    window.endTurn = () => game.endTurn();
    window.toggleMusic = () => game.toggleMusic();
};
