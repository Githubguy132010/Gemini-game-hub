# Deployment Instructions

This document provides instructions on how to deploy the "Gemini Game Hub" application.

## Frontend Deployment (Vercel)

To deploy the frontend of the application to Vercel, follow these steps:

1.  **Install Vercel CLI:**
    *   If you don't have the Vercel CLI installed, run the command `npm i -g vercel` to install it.

2.  **Login to Vercel:**
    *   Open a terminal and run the command `vercel login`.

3.  **Deploy to Vercel:**
    *   Navigate to the `client` directory.
    *   Run the command `vercel` to deploy the application.
    *   Follow the prompts to configure the deployment.

## Backend Deployment (Heroku)

To deploy the backend of the application to Heroku, follow these steps:

1.  **Install Heroku CLI:**
    *   If you don't have the Heroku CLI installed, follow the instructions [here](https://devcenter.heroku.com/articles/heroku-cli) to install it.

2.  **Login to Heroku:**
    *   Open a terminal and run the command `heroku login`.

3.  **Create a Heroku App:**
    *   Navigate to the `backend` directory.
    *   Run the command `heroku create` to create a new Heroku application.

4.  **Push to Heroku:**
    *   Run the command `git push heroku main` to deploy the application.

## Environment Variables

### Frontend (Vercel)

To configure the environment variables for the frontend, follow these steps:

1.  In the Vercel dashboard, go to **Project Settings > Environment Variables**.
2.  Add the following environment variables:
    *   `REACT_APP_API_URL`: The URL of the deployed backend application.

### Backend (Heroku)

To configure the environment variables for the backend, follow these steps:

1.  In the Heroku dashboard, go to **Settings > Config Vars**.
2.  Add the following environment variables:
    *   `MONGODB_URI`: The connection string for the MongoDB database.
    *   `PORT`: The port number for the backend application (Heroku sets this automatically).
