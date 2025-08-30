# Iterate Feature Design

This document outlines the design for the new "Iterate" feature in the Gemini Game Hub.

## 1. User Workflow

The user workflow for iterating on a game is as follows:

1.  **Navigate to Iterate Page:** The user accesses the "Iterate" page from the main navigation.
2.  **Select a Game:** The page loads and displays a list of all previously published games. The user selects one game from this list.
3.  **Enter Iteration Prompt:** Once a game is selected, an input area becomes available. The user types a text prompt describing the changes they want to make (e.g., "Change the player character to a cat," "make the game easier by increasing the space between obstacles").
4.  **Initiate Iteration:** The user clicks the "Iterate" button.
5.  **Review New Version:** The system processes the request and generates a new version of the game's code. This new code is then displayed in a preview panel on the page.
6.  **Test the Game:** The user can click a "Test" button to open the game in a modal window for interactive testing.
7.  **Publish the Game:** If the user is satisfied with the new version, they click the "Publish" button.
8.  **Name the New Game:** A dialog prompts the user to enter a name for this new, iterated version of the game.
9.  **Confirm and Finish:** After entering a name and confirming, the new game is saved to the server and added to the list of published games. The user is then redirected to the home page, where the new game will be visible.


## 2. UI Layout

The `public/iterate.html` page will have a clean and intuitive layout.

### Wireframe

```mermaid
graph TD
    A[Start] --> B{Select a Game};
    B --> C[Game List: Dropdown or Radio Buttons];
    C --> D{Enter Iteration Prompt};
    D --> E[Text Area for Prompt];
    E --> F[Button: "Iterate"];
    F --> G{Processing...};
    G --> H[Game Preview Panel];
    H --> I{Test or Publish?};
    I -- Test --> J[Button: "Test"];
    J --> K[Modal Window with Game];
    K --> I;
    I -- Publish --> L[Button: "Publish"];
    L --> M{Enter New Game Name};
    M --> N[Text Input for Name];
    N --> O[Button: "Confirm Publish"];
    O --> P[End: Redirect to Home];

    subgraph "Iterate Page"
        B
        C
        D
        E
        F
        H
        I
        J
        L
    end

    subgraph "Publish Dialog"
        M
        N
        O
    end
```

### Component Breakdown

*   **Header:** A main heading, `<h1>Iterate on a Game</h1>`.
*   **Game Selector:** A `<select>` dropdown menu labeled "Choose a game to iterate on:". This will be populated dynamically with the list of published games.
*   **Prompt Input:** A `<textarea>` for the user to enter their iteration prompt. This will be disabled until a game is selected.
*   **Iterate Button:** A `<button>` labeled "Iterate". This will also be disabled until a game is selected.
*   **Loading Indicator:** A hidden `<div>` that shows a loading animation while the new game version is being generated.
*   **Game Preview:** A `<div>` or `<iframe>` where the newly generated game code will be rendered for the user to test. This will be hidden by default.
*   **Test Button:** A `<button>` labeled "Test" that appears after a game has been successfully iterated.
*   **Publish Button:** A `<button>` labeled "Publish" that appears after a game has been successfully iterated.
*   **Publish Modal:** A modal dialog that appears when the "Publish" button is clicked. It will contain:
    *   A text input for the new game's name.
    *   A "Confirm Publish" button.
    *   A "Cancel" button.
*   **Test Modal:** A modal dialog that appears when the "Test" button is clicked. It will contain an `<iframe>` with the game.
*   **Navigation:** A link to go back to the home page, `<a href="index.html">Back to Home</a>`.


## 3. API Endpoints

The following API endpoints will be required to support the iterate feature.

### 3.1. Fetch Published Games

*   **Endpoint:** `GET /api/games`
*   **Description:** Retrieves a list of all published games. This is an existing endpoint and can be reused.
*   **Response Body (Success):**
    ```json
    [
      {
        "id": "1756547926638",
        "name": "Flappy Bird"
      },
      {
        "id": "1756548701542",
        "name": "Flappy Google"
      }
    ]
    ```

### 3.2. Get a Single Game's Code

*   **Endpoint:** `GET /api/games/:id`
*   **Description:** Retrieves the full details of a single game, including its code. This is an existing endpoint that will be used to fetch the code of the selected game to display in the editor before iteration.
*   **Response Body (Success):**
    ```json
    {
      "id": "1756547926638",
      "name": "Flappy Bird",
      "code": "<!DOCTYPE html>..."
    }
    ```

### 3.3. Iterate on a Game

*   **Endpoint:** `POST /iterate`
*   **Description:** Initiates the iteration process for a selected game. It takes the game's ID and a user prompt, and returns the newly generated game code.
*   **Request Body:**
    ```json
    {
      "gameId": "1756547926638",
      "prompt": "Change the background to a space theme."
    }
    ```
*   **Response Body (Success):**
    ```json
    {
      "code": "<!DOCTYPE html>..."
    }
    ```

### 3.4. Publish a New Game Version

*   **Endpoint:** `POST /api/games`
*   **Description:** Publishes a new game. This is an existing endpoint and can be reused to save the iterated game.
*   **Request Body:**
    ```json
    {
      "name": "Flappy Bird in Space",
      "code": "<!DOCTYPE html>..."
    }
    ```
*   **Response Body (Success):**
    ```json
    {
      "id": "1756551647237"
    }
