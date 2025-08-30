const gameForm = document.getElementById('game-form');
const gamePrompt = document.getElementById('game-prompt');
const gameContainer = document.getElementById('game-container');
const publishContainer = document.getElementById('publish-container');
const publishForm = document.getElementById('publish-form');
const gameNameInput = document.getElementById('game-name');
const gameList = document.getElementById('game-list');
const iterateButton = document.getElementById('iterate-button');
const iterationContainer = document.getElementById('iteration-container');
const iterationForm = document.getElementById('iteration-form');
const iterationPrompt = document.getElementById('iteration-prompt');

let lastGeneratedCode = '';

gameForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = gamePrompt.value;
    gameContainer.innerHTML = '<p>Generating your game...</p>';
    publishContainer.style.display = 'none'; // Hide publish form on new generation
    iterationContainer.style.display = 'none';

    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate game');
        }

        const data = await response.json();
        lastGeneratedCode = data.code; // Save the generated code

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        
        gameContainer.innerHTML = '';
        gameContainer.appendChild(iframe);
        
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(data.code);
        iframe.contentWindow.document.close();

        publishContainer.style.display = 'block'; // Show the publish form
        
    } catch (error) {
        console.error(error);
        gameContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});

publishForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const gameName = gameNameInput.value;

    if (!gameName || !lastGeneratedCode) {
        alert('No game to publish or name is missing.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: gameName, code: lastGeneratedCode }),
        });

        if (!response.ok) {
            throw new Error('Failed to publish game');
        }

        const result = await response.json();
        alert(`Game published successfully with ID: ${result.id}`);
        publishForm.reset();
        publishContainer.style.display = 'none';
        loadGames();

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
    }
});

iterateButton.addEventListener('click', () => {
    iterationContainer.style.display = 'block';
});

iterationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = iterationPrompt.value;
    gameContainer.innerHTML = '<p>Iterating on your game...</p>';
    iterationContainer.style.display = 'none';

    try {
        const response = await fetch('http://localhost:3000/iterate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: lastGeneratedCode, prompt }),
        });

        if (!response.ok) {
            throw new Error('Failed to iterate on game');
        }

        const data = await response.json();
        lastGeneratedCode = data.code; // Save the generated code

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        
        gameContainer.innerHTML = '';
        gameContainer.appendChild(iframe);
        
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(data.code);
        iframe.contentWindow.document.close();

        publishContainer.style.display = 'block'; // Show the publish form again
        iterationForm.reset();
        
    } catch (error) {
        console.error(error);
        gameContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});

async function loadGames() {
    try {
        const response = await fetch('http://localhost:3000/games');
        if (!response.ok) {
            throw new Error('Failed to load games');
        }
        const games = await response.json();

        gameList.innerHTML = ''; // Clear existing list

        if (games.length === 0) {
            gameList.innerHTML = '<p>No games have been published yet.</p>';
            return;
        }

        games.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('game-item');
            gameElement.textContent = game.name;
            gameElement.addEventListener('click', () => {
                gameContainer.innerHTML = ''; // Clear current content
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '500px';
                iframe.style.border = 'none';
                gameContainer.appendChild(iframe);
                
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(game.code);
                iframe.contentWindow.document.close();
                
                // Also show the publish container in case they want to re-publish
                lastGeneratedCode = game.code;
                publishContainer.style.display = 'block';
                iterationContainer.style.display = 'none';
            });
            gameList.appendChild(gameElement);
        });

    } catch (error) {
        console.error(error);
        gameList.innerHTML = `<p>Error loading games: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadGames);