const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Initialize scores file if it doesn't exist
async function initScoresFile() {
    try {
        await fs.access(SCORES_FILE);
    } catch {
        await fs.writeFile(SCORES_FILE, JSON.stringify([]));
    }
}

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const data = await fs.readFile(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        // Sort by score descending and return top 10
        const topScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        res.json(topScores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// Submit new score
app.post('/api/scores', async (req, res) => {
    try {
        const { nickname, score, difficulty } = req.body;
        
        if (!nickname || score === undefined || !difficulty) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const data = await fs.readFile(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        const newScore = {
            nickname: nickname.substring(0, 20),
            score: parseInt(score),
            difficulty,
            timestamp: new Date().toISOString()
        };
        
        scores.push(newScore);
        
        // Keep only top 100 scores to prevent file from growing too large
        const topScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 100);
        
        await fs.writeFile(SCORES_FILE, JSON.stringify(topScores, null, 2));
        
        res.json({ success: true, score: newScore });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// Get stats
app.get('/api/stats', async (req, res) => {
    try {
        const data = await fs.readFile(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        const stats = {
            totalGames: scores.length,
            highestScore: scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0,
            averageScore: scores.length > 0 
                ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
                : 0
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// Serve the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index10.html'));
});

// Start server
initScoresFile().then(() => {
    app.listen(PORT, () => {
        console.log(`🎮 Simon Says Game: http://localhost:${PORT}`);
        console.log(`📊 Leaderboard API: http://localhost:${PORT}/api/leaderboard`);
        console.log(`\n✨ Open your browser and go to: http://localhost:3000\n`);
    });
});
