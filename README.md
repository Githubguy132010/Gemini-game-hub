# Gemini Game Hub

## Description

The Gemini Game Hub is a web application that allows users to create, play, and modify simple HTML games using Google's Gemini AI. Users can provide a text prompt to generate a new game, play games created by others, and even iterate on existing games by providing further instructions.

## Project Structure

The project is organized into a few key areas:

-   **`server.js`**: The main backend file that runs the Express server. It handles API requests for generating, saving, loading, and iterating on games.
-   **`public/`**: This directory contains all the front-end files that are served to the user.
    -   **`index.html`**: The main landing page that displays a list of available games.
    -   **`create.html`**: The page where users can enter a prompt to create a new game.
    -   **`play.html`**: The page used to display and play a selected game.
    -   **`iterate.html`**: The page that allows users to modify an existing game with a new prompt.
    -   **`css/`**: Contains the stylesheets for the application.
    -   **`js/`**: Contains the client-side JavaScript for interacting with the backend and managing the UI.
-   **`games.json`**: A file where the created games (name and code) are stored.
-   **`package.json`**: Defines the project's dependencies and scripts.

## Installation and Usage

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google Gemini API key:
    ```
    API_KEY=your_api_key_here
    ```
    You can use the `.env.example` file as a template.

4.  **Start the server:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.
