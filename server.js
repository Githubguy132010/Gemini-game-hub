require("dotenv").config();
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;
const GAMES_FILE = path.join(__dirname, "games.json");

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Initialize the Google Generative AI client
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function extractCleanCode(gameCode) {
  let cleanCode;
  const codeBlockMatch = gameCode.match(/```html([\s\S]*)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleanCode = codeBlockMatch[1].trim();
  } else {
    const htmlMatch = gameCode.match(/<!DOCTYPE html>[\s\S]*<\/html>/);
    if (htmlMatch && htmlMatch[0]) {
      cleanCode = htmlMatch[0];
    } else {
      cleanCode = gameCode;
    }
  }
  return cleanCode;
}

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    const gameCode = response.candidates[0].content.parts[0].text;

    const cleanCode = extractCleanCode(gameCode);

    if (!cleanCode) {
      // If after all checks, cleanCode is empty, something went wrong.
      return res
        .status(500)
        .send({ error: "Failed to extract valid game code from AI response." });
    }

    res.send({ code: cleanCode });
  } catch (error) {
    console.error(error);
    console.error("Error generating game:", error);
    res.status(500).send({ error: "Failed to generate game" });
  }
});

app.post("/api/games", (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).send({ error: "Game name and code are required" });
  }

  const newGame = {
    id: Date.now().toString(),
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
        return res.status(500).send({ error: "Failed to save game" });
      }
      res.status(201).send({ id: newGame.id });
    });
  });
});

// API endpoint to get all games
app.get("/api/games", (req, res) => {
  fs.readFile(GAMES_FILE, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.json([]);
      }
      console.error(err);
      return res.status(500).send({ error: "Failed to retrieve games" });
    }
    try {
      const games = JSON.parse(data);
      res.json(games);
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: "Failed to parse games data" });
    }
  });
});

// API endpoint to get a single game by ID
app.get("/api/games/:id", (req, res) => {
  const gameId = req.params.id;
  fs.readFile(GAMES_FILE, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Failed to retrieve games" });
    }
    try {
      const games = JSON.parse(data);
      const game = games.find((g) => g.id === gameId);
      if (game) {
        res.json(game);
      } else {
        res.status(404).send({ error: "Game not found" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: "Failed to parse games data" });
    }
  });
});

app.delete("/api/games/:id", (req, res) => {
  const gameId = req.params.id;

  fs.readFile(GAMES_FILE, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Failed to retrieve games" });
    }

    let games;
    try {
      games = JSON.parse(data);
    } catch (e) {
      console.error(e);
      return res.status(500).send({ error: "Failed to parse games data" });
    }

    const gameIndex = games.findIndex((g) => g.id === gameId);

    if (gameIndex === -1) {
      return res.status(404).send({ error: "Game not found" });
    }

    games.splice(gameIndex, 1);

    fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: "Failed to delete game" });
      }
      res.status(200).send({ message: "Game deleted successfully" });
    });
  });
});

app.post("/api/iterate", async (req, res) => {
  const { gameId, prompt, newGameName } = req.body;

  if (!gameId || !prompt || !newGameName) {
    return res
      .status(400)
      .json({ error: "Game ID, prompt, and new game name are required" });
  }

  try {

    const data = await fsp.readFile(GAMES_FILE);
    const games = JSON.parse(data);
    const game = games.find((g) => g.id === gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const iterationPrompt = `
      This is the code of the game we are iterating on:
      ${game.code}

      Iterate on this game.
      This is the user request:
      ${prompt}
    `;

    const result = await model.generateContent(iterationPrompt);
    const response = await result.response;
    const newGameCode = response.candidates[0].content.parts[0].text;

    const cleanCode = extractCleanCode(newGameCode);

    if (!cleanCode) {
      return res
        .status(500)
        .json({ error: "Failed to extract valid game code from AI response." });
    }

    res.json({
      code: cleanCode,
      newGameName: newGameName,
    });
  } catch (error) {
    console.error("Error during iteration:", error);
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "Game not found" });
    }
    res
      .status(500)
      .json({ error: "Failed to iterate on the game due to an internal error." });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
