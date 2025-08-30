# Architecture Design: Gemini Game Hub

This document outlines the architecture for the Gemini Game Hub web application.

## 1. File Structure

We'll use a monorepo structure with separate directories for the frontend and backend code to keep them organized and decoupled.

```
/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── ...
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── GameList.js
│   │   │   ├── GameCard.js
│   │   │   ├── CreateGameForm.js
│   │   │   └── GamePlayer.js
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Displays published games
│   │   │   ├── CreateGamePage.js   # Page for creating a new game
│   │   │   └── PlayGamePage.js     # Page for playing a game
│   │   ├── services/
│   │   │   └── api.js              # Handles API requests to the backend
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── gameController.js   # Handles game-related logic
│   │   ├── models/
│   │   │   └── Game.js             # Defines the game data schema
│   │   ├── routes/
│   │   │   └── gameRoutes.js       # Defines API routes for games
│   │   ├── data/
│   │   │   └── games.json          # Simple JSON file for data storage
│   │   └── server.js               # Main backend server file
│   └── package.json
│
└── ARCHITECTURE.md
```

## 2. Page Routes

The application will have the following routes:

*   `/`: **View Published Games Page**
    *   Displays a list of all published games.
    *   Corresponds to the `HomePage.js` component.
*   `/create`: **Create New Game Page**
    *   Provides a form for users to create a new game.
    *   Corresponds to the `CreateGamePage.js` component.
*   `/play/:gameId`: **Play Game Page**
    *   Allows users to play a specific game, identified by its `gameId`.
    *   Corresponds to the `PlayGamePage.js` component.

## 3. Data Flow

The data flow will be managed through a simple REST API on the backend, with a JSON file acting as our database for now.

### Storing a New Game:

1.  **Frontend (CreateGamePage):** The user fills out the "Create Game" form and clicks "Save".
2.  **Frontend (api.js):** A `POST` request is sent to the `/api/games` endpoint with the new game's data.
3.  **Backend (gameRoutes.js):** The request is routed to the `createGame` function in `gameController.js`.
4.  **Backend (gameController.js):**
    *   The controller receives the new game data.
    *   It reads the existing `games.json` file.
    *   A new unique ID is generated for the game.
    *   The new game is added to the list of games.
    *   The updated list is written back to `games.json`.
5.  **Backend:** A success response is sent back to the frontend.

### Retrieving and Displaying Games:

1.  **Frontend (HomePage):** When the page loads, it needs to display the list of published games.
2.  **Frontend (api.js):** A `GET` request is sent to the `/api/games` endpoint.
3.  **Backend (gameRoutes.js):** The request is routed to the `getGames` function in `gameController.js`.
4.  **Backend (gameController.js):**
    *   The controller reads the `games.json` file.
    *   It returns the list of all games as a JSON response.
5.  **Frontend (HomePage):** The received game data is stored in the component's state and rendered as a list of games.

### Playing a Game:

1.  **Frontend (HomePage or direct URL):** A user clicks "Play" on a game, or navigates directly to `/play/:gameId`.
2.  **Frontend (PlayGamePage):** The component extracts the `gameId` from the URL.
3.  **Frontend (api.js):** A `GET` request is sent to the `/api/games/:gameId` endpoint.
4.  **Backend (gameRoutes.js):** The request is routed to the `getGameById` function in `gameController.js`.
5.  **Backend (gameController.js):**
    *   The controller reads `games.json`.
    *   It finds the game with the matching `gameId`.
    *   It returns the specific game's data.
6.  **Frontend (PlayGamePage):** The game data is used to load and render the game player.

### Data Flow Diagram (Mermaid)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend API
    participant Database [games.json]

    User->>Frontend: Fills out and submits create game form
    Frontend->>Backend API: POST /api/games (new game data)
    Backend API->>Database: Read games.json
    Backend API->>Database: Add new game and write to games.json
    Backend API-->>Frontend: Success response

    User->>Frontend: Navigates to home page
    Frontend->>Backend API: GET /api/games
    Backend API->>Database: Read games.json
    Backend API-->>Frontend: Returns list of games

    User->>Frontend: Clicks 'Play' on a game
    Frontend->>Backend API: GET /api/games/:gameId
    Backend API->>Database: Read games.json
    Backend API->>Database: Find game by ID
    Backend API-->>Frontend: Returns game data