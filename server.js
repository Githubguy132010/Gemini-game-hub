require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;
const GAMES_FILE = path.join(__dirname, 'games.json');

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

// Initialize the Google Generative AI client
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // A specific prompt to guide the AI to create a complete, runnable game
    const fullPrompt = `
      You are a game development expert. Create a complete, single-file HTML game based on the following description.
      The game must be self-contained in a single HTML file with all necessary HTML, CSS, and JavaScript.
      Do not use any external libraries or assets.
      The game should be playable and functional.

      Game Description: "${prompt}"
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const gameCode = response.text();
    
    // Clean up the response to ensure it's valid HTML
    let cleanCode;
    const codeBlockMatch = gameCode.match(/```html([\s\S]*)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
        cleanCode = codeBlockMatch[1].trim();
    } else {
        // If no markdown block, try to find the HTML document directly
        const htmlMatch = gameCode.match(/<!DOCTYPE html>[\s\S]*<\/html>/);
        if (htmlMatch && htmlMatch[0]) {
            cleanCode = htmlMatch[0];
        } else {
            // As a last resort, use the original text but this might contain conversational text
            cleanCode = gameCode;
        }
    }

    if (!cleanCode) {
        // If after all checks, cleanCode is empty, something went wrong.
        return res.status(500).send({ error: 'Failed to extract valid game code from AI response.' });
    }

    res.send({ code: cleanCode });
  } catch (error) {
    console.error(error);
    console.error('Error generating game:', error);
    res.status(500).send({ error: 'Failed to generate game' });
  }
});

app.post('/publish', (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).send({ error: 'Game name and code are required' });
  }

  const newGame = {
    id: Date.now().toString(), // Simple unique ID
    name,
    code,
  };

  fs.readFile(GAMES_FILE, (err, data) => {
    let games = [];
    if (!err) {
      try {
        games = JSON.parse(data);
      } catch (e) {
        // Ignore parsing errors, start with a fresh array
      }
    }

    games.push(newGame);

    fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: 'Failed to save game' });
      }
      res.status(201).send({ id: newGame.id });
    });
  });
});

// Add this new endpoint to get all games
app.get('/games', (req, res) => {
  fs.readFile(GAMES_FILE, (err, data) => {
    if (err) {
      // If the file doesn't exist, return an empty gallery
      if (err.code === 'ENOENT') {
        return res.json([]);
      }
      console.error(err);
      return res.status(500).send({ error: 'Failed to retrieve games' });
    }
    try {
      const games = JSON.parse(data);
      res.json(games);
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: 'Failed to parse games data' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});