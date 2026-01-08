// Game State
let gameSeq = [];
let userSeq = [];
let btns = ["yellow", "red", "purple", "green"];
let started = false;
let level = 0;
let highScore = localStorage.getItem('simonHighScore') || 0;
let streak = 0;
let soundEnabled = true;
let difficulty = 'easy';
let speedMultiplier = { easy: 1, medium: 0.7, hard: 0.5 };
let isPlayingSequence = false;

// Audio Context for sound effects
let audioContext;

// DOM Elements
let message, levelDisplay, highScoreDisplay, streakDisplay, startBtn, soundToggle;
let difficultyBtns, modal, finalScoreDisplay, nicknameInput, submitScoreBtn, playAgainBtn, leaderboardDiv;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Audio Context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Get DOM Elements
    message = document.getElementById('message');
    levelDisplay = document.getElementById('level-display');
    highScoreDisplay = document.getElementById('high-score');
    streakDisplay = document.getElementById('streak');
    startBtn = document.getElementById('start-btn');
    soundToggle = document.getElementById('sound-toggle');
    difficultyBtns = document.querySelectorAll('.difficulty-btn');
    modal = document.getElementById('game-over-modal');
    finalScoreDisplay = document.getElementById('final-score');
    nicknameInput = document.getElementById('nickname');
    submitScoreBtn = document.getElementById('submit-score');
    playAgainBtn = document.getElementById('play-again');
    leaderboardDiv = document.getElementById('leaderboard');
    
    // Initialize
    highScoreDisplay.textContent = highScore;
    loadLeaderboard();
    
    // Setup Event Listeners
    setupEventListeners();
});

// Sound generation
function playSound(frequency, duration = 300) {
    if (!soundEnabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Flash animations
function gameFlash(btn) {
    const frequency = parseFloat(btn.dataset.note);
    playSound(frequency, 400 * speedMultiplier[difficulty]);
    btn.classList.add("flash");
    setTimeout(() => {
        btn.classList.remove("flash");
    }, 300 * speedMultiplier[difficulty]);
}

function userFlash(btn) {
    const frequency = parseFloat(btn.dataset.note);
    playSound(frequency, 200);
    btn.classList.add("userflash");
    setTimeout(() => {
        btn.classList.remove("userflash");
    }, 200);
}

// Game Logic
async function levelUp() {
    userSeq = [];
    level++;
    streak++;
    levelDisplay.textContent = level;
    streakDisplay.textContent = streak;
    message.textContent = `Level ${level} - Watch carefully!`;
    
    const randIdx = Math.floor(Math.random() * 4);
    const randColor = btns[randIdx];
    const randBtn = document.querySelector(`[data-color="${randColor}"]`);
    gameSeq.push(randColor);
    
    await playSequence();
}

async function playSequence() {
    isPlayingSequence = true;
    disableButtons();
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    for (let i = 0; i < gameSeq.length; i++) {
        const color = gameSeq[i];
        const btn = document.querySelector(`[data-color="${color}"]`);
        gameFlash(btn);
        await new Promise(resolve => setTimeout(resolve, 600 * speedMultiplier[difficulty]));
    }
    
    isPlayingSequence = false;
    enableButtons();
    message.textContent = `Your turn! Repeat the sequence`;
}

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            message.textContent = `Correct! 🎉`;
            setTimeout(levelUp, 1000);
        }
    } else {
        gameOver();
    }
}

function gameOver() {
    playSound(100, 500);
    message.textContent = `Game Over! 💥`;
    
    if (level > highScore) {
        highScore = level;
        localStorage.setItem('simonHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    
    finalScoreDisplay.textContent = level;
    modal.classList.add('show');
    
    disableButtons();
}

function reset() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    streak = 0;
    levelDisplay.textContent = 0;
    streakDisplay.textContent = 0;
    message.textContent = 'Choose difficulty and click Start!';
    startBtn.disabled = false;
    enableButtons();
}

// Button handlers
function btnPress() {
    if (isPlayingSequence || !started) return;
    
    const btn = this;
    userFlash(btn);
    
    const userColor = btn.dataset.color;
    userSeq.push(userColor);
    checkAns(userSeq.length - 1);
}

function disableButtons() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.add('disabled');
    });
}

function enableButtons() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('disabled');
    });
}

// Setup Event Listeners
function setupEventListeners() {
    startBtn.addEventListener('click', () => {
        if (!started) {
            started = true;
            startBtn.disabled = true;
            message.textContent = 'Get ready...';
            setTimeout(levelUp, 1000);
        }
    });

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (started) return;
            
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
            message.textContent = `Difficulty: ${difficulty.toUpperCase()} - Click Start!`;
        });
    });

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', btnPress);
    });

    playAgainBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        nicknameInput.value = '';
        reset();
    });

    submitScoreBtn.addEventListener('click', async () => {
        const nickname = nicknameInput.value.trim() || 'Anonymous';
        await submitScore(nickname, level, difficulty);
        modal.classList.remove('show');
        nicknameInput.value = '';
        reset();
    });
}

// Leaderboard functions
async function loadLeaderboard() {
    try {
        const response = await fetch('http://localhost:3000/api/leaderboard');
        const data = await response.json();
        displayLeaderboard(data);
    } catch (error) {
        leaderboardDiv.innerHTML = '<div class="loading">Start the backend server to see leaderboard</div>';
    }
}

function displayLeaderboard(scores) {
    if (!scores || scores.length === 0) {
        leaderboardDiv.innerHTML = '<div class="loading">No scores yet. Be the first!</div>';
        return;
    }
    
    leaderboardDiv.innerHTML = scores.map((score, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
            <span class="leaderboard-name">${score.nickname}</span>
            <span class="leaderboard-score">${score.score}</span>
            <span style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">${score.difficulty}</span>
        </div>
    `).join('');
}

async function submitScore(nickname, score, difficulty) {
    try {
        const response = await fetch('http://localhost:3000/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, score, difficulty })
        });
        
        if (response.ok) {
            await loadLeaderboard();
        }
    } catch (error) {
        console.log('Backend not available - score not submitted');
    }
}