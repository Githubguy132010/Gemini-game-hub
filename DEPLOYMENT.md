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

## Backend Deployment (Vercel)

To deploy the backend of the application to Vercel, follow these steps:

1.  **Install Vercel CLI:**
    *   If you don't have the Vercel CLI installed, run the command `npm i -g vercel` to install it.

2.  **Login to Vercel:**
    *   Open a terminal and run the command `vercel login`.

3.  **Configure for Vercel:**
    *   Create a `vercel.json` file in the `backend` directory with the following content:
      ```json
      {
        "version": 2,
        "builds": [
          {
            "src": "index.js",
            "use": "@vercel/node"
          }
        ],
        "routes": [
          {
            "src": "/(.*)",
            "dest": "index.js"
          }
        ]
      }
      ```

4.  **Deploy to Vercel:**
    *   Navigate to the `backend` directory.
    *   Run the command `vercel` to deploy the application.
    *   Follow the prompts to configure the deployment.

## Environment Variables

### Frontend (Vercel)

To configure the environment variables for the frontend, follow these steps:

1.  In the Vercel dashboard, go to **Project Settings > Environment Variables**.
2.  Add the following environment variables:
    *   `REACT_APP_API_URL`: The URL of the deployed backend application.

### Backend (Vercel)

To configure the environment variables for the backend, follow these steps:

1.  In the Vercel dashboard, go to **Project Settings > Environment Variables**.
2.  Add the following environment variables:
    *   `MONGODB_URI`: The connection string for the MongoDB database.
