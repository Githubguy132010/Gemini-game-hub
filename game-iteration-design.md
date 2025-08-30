# Game Iteration Feature Design

This document outlines the design for the new "iterate on game" feature in the Gemini Game Hub.

## 1. User Interface (UI) and User Experience (UX)

The primary UI changes will be in `public/play.html`.

### Changes to `public/play.html`

A new section will be added below the game display to allow users to iterate on the current game. This section will contain a form with a text area for the iteration prompt and an "Iterate" button.

The existing loading indicator, used during game generation, will be reused to provide feedback during the iteration process.

Here is the proposed HTML structure to be added to `public/play.html`:

```html
<div id="iteration-controls">
    <h2>Iterate on this Game</h2>
    <form id="iterate-form">
        <textarea id="iteration-prompt" placeholder="e.g., 'Make the player faster', 'Add a scoring system'"></textarea>
        <button type="submit">Iterate</button>
    </form>
</div>
<div id="loading-indicator" style="display: none;">
    <p>Iterating on your game...</p>
</div>
```

The `app.js` file will need to be updated to handle the form submission, call the new API endpoint, and display the updated game.

## 2. API Endpoint

A new API endpoint will be created to handle game iteration requests.

### `POST /iterate`

This endpoint will accept a `POST` request with a JSON body containing the ID of the game to be iterated and the user's prompt.

**Request Body:**

```json
{
  "gameId": "1756547926638",
  "prompt": "Make the bird fall faster."
}
```

**Success Response (200 OK):**

The endpoint will return the updated game object, including the new code.

```json
{
  "id": "1756547926638",
  "name": "Flappy Bird",
  "code": "<!DOCTYPE html>..."
}
```

## 3. Server-Side Logic

The server-side logic in `server.js` will be updated to handle the `/iterate` endpoint.

### `server.js` Logic

1.  **Read `games.json`:** When a request is received at `/iterate`, the server will read the `games.json` file.
2.  **Find the Game:** It will find the game with the matching `gameId` from the request body.
3.  **Call Gemini API:** The server will call the Gemini API with a prompt that includes the existing game code and the new iteration prompt from the user.
4.  **Update Game Code:** The new code received from the Gemini API will be used to update the game's `code` property in the `games.json` file.
5.  **Save `games.json`:** The updated `games` array will be written back to `games.json`.
6.  **Send Response:** The server will send the updated game object back to the client.

Here is a conceptual outline of the `/iterate` endpoint in `server.js`:

```javascript
app.post('/iterate', async (req, res) => {
  const { gameId, prompt } = req.body;

  // 1. Read games.json and find the game
  const games = JSON.parse(fs.readFileSync(GAMES_FILE));
  const game = games.find(g => g.id === gameId);

  if (!game) {
    return res.status(404).send({ error: 'Game not found' });
  }

  // 2. Call Gemini API with existing code and new prompt
  const iterationPrompt = `
    You are a game development expert. A user wants to modify an existing game.
    The user's instructions are: "${prompt}".

    Here is the current code of the game:
    \`\`\`html
    ${game.code}
    \`\`\`

    Please modify the game based on the user's instructions and provide the complete, updated, single-file HTML game.
  `;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  const result = await model.generateContent(iterationPrompt);
  const response = await result.response;
  const newGameCode = extractCleanCode(response.text());

  // 3. Update the game code and save back to games.json
  game.code = newGameCode;
  fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));

  // 4. Send the updated game back to the client
  res.send(game);
});