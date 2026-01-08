# 🎮 Simon Says Game - Enhanced Edition

A modern, feature-rich version of the classic Simon Says memory game with beautiful UI/UX and backend leaderboard support.

## ✨ Features

### Frontend
- **Modern Glassmorphism Design** - Beautiful gradient backgrounds with glass effects
- **Sound Effects** - Each button plays a unique musical note
- **Difficulty Levels** - Easy, Medium, and Hard modes with different speeds
- **Score Tracking** - Local high score and streak counter
- **Smooth Animations** - Professional transitions and visual feedback
- **Responsive Design** - Works perfectly on mobile and desktop
- **Game Over Modal** - Submit your score to the leaderboard

### Backend
- **Leaderboard System** - Top 10 scores displayed in real-time
- **Anonymous Scoring** - No authentication required, just enter a nickname
- **Persistent Storage** - Scores saved to JSON file
- **RESTful API** - Clean API endpoints for scores and stats

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3000`

3. Open `index10.html` in your browser to play!

## 🎯 How to Play

1. **Choose Difficulty** - Select Easy, Medium, or Hard
2. **Click Start** - Begin the game
3. **Watch the Sequence** - Pay attention to the pattern
4. **Repeat** - Click the buttons in the same order
5. **Level Up** - Each level adds one more step to the sequence
6. **Submit Score** - When game ends, enter your name for the leaderboard

## 🎨 Difficulty Levels

- **Easy** - Normal speed, perfect for beginners
- **Medium** - 30% faster, for experienced players
- **Hard** - 50% faster, for memory masters

## 🔧 API Endpoints

- `GET /api/leaderboard` - Get top 10 scores
- `POST /api/scores` - Submit a new score
- `GET /api/stats` - Get game statistics

## 📱 Browser Support

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## 🎵 Sound

The game uses Web Audio API to generate musical notes for each button. You can toggle sound on/off using the sound button.

## 💾 Local Storage

Your personal high score is saved in browser localStorage and persists between sessions.

## 🏆 Leaderboard

The leaderboard shows the top 10 scores across all difficulty levels. Scores are stored on the server and shared between all players.

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript
- HTML5
- CSS3 (Glassmorphism, Gradients, Animations)
- Web Audio API

**Backend:**
- Node.js
- Express.js
- CORS
- File-based JSON storage

## 📝 Notes

- The game works without the backend, but leaderboard features require the server to be running
- Scores are stored in `scores.json` file
- The server keeps the top 100 scores to prevent file bloat

Enjoy playing! 🎮✨
