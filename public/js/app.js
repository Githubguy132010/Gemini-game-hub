document.addEventListener('DOMContentLoaded', () => {
    // Index page
    if (document.getElementById('game-list')) {
        initIndexPage();
    }

    // Play page
    if (document.getElementById('game-display')) {
        initPlayPage();
    }

    // Create page
    if (document.getElementById('create-game-form')) {
        const createGameForm = document.getElementById('create-game-form');
        const gameNameInput = document.getElementById('new-game-name');
        const promptInput = document.getElementById('prompt');
        const loadingIndicator = document.getElementById('loading-indicator');
        const gameContainer = document.getElementById('game-container');

        createGameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = gameNameInput.value;
            const prompt = promptInput.value;

            if (!name || !prompt) {
                alert('Please provide both a name and a description for your game.');
                return;
            }

            loadingIndicator.classList.remove('hidden');
            gameContainer.classList.add('hidden');

            try {
                // Step 1: Generate the game code
                const generateResponse = await fetch('/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt }),
                });

                if (!generateResponse.ok) {
                    throw new Error('Failed to generate game code.');
                }

                const generateData = await generateResponse.json();
                const gameCode = generateData.code;

                if (!gameCode) {
                    throw new Error('Generated code was empty.');
                }
                
                // Show preview before publishing
                const iframe = document.createElement('iframe');
                iframe.srcdoc = gameCode;
                iframe.width = '100%';
                iframe.height = '400px';
                gameContainer.innerHTML = '';
                gameContainer.appendChild(iframe);
                gameContainer.classList.remove('hidden');

                // Step 2: Publish the new game
                const publishResponse = await fetch('/api/games', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, code: gameCode }),
                });

                if (!publishResponse.ok) {
                    throw new Error('Failed to save the new game.');
                }

                const publishData = await publishResponse.json();
                
                // Step 3: Redirect to play page
                window.location.href = `/play.html?id=${publishData.id}`;

            } catch (error) {
                console.error('Error creating game:', error);
                alert(`An error occurred: ${error.message}`);
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        });
    }

    // Iterate page
    if (document.getElementById('iteration-form')) {
        const gameSelect = document.getElementById('game-select');
        const iterationPrompt = document.getElementById('iteration-prompt');
        const iterateButton = document.getElementById('iterate-button');
        const gameFrame = document.getElementById('game-frame');
        const newGameNameInput = document.getElementById('new-iterated-game-name');
        const publishButton = document.getElementById('publish-button');
        const loadingOverlay = document.getElementById('loading-overlay');
        const publishContainer = document.getElementById('publish-container');
        const gameContainer = document.getElementById('game-container');
        let iteratedGameCode = '';

        // Fetch games and populate the dropdown
        fetch('/api/games')
            .then(response => response.json())
            .then(games => {
                games.forEach(game => {
                    const option = document.createElement('option');
                    option.value = game.id;
                    option.textContent = game.name;
                    gameSelect.appendChild(option);
                });
            });

        // Enable prompt and button when a game is selected
        gameSelect.addEventListener('change', () => {
            if (gameSelect.value) {
                iterationPrompt.disabled = false;
                iterateButton.disabled = false;
                newGameNameInput.disabled = false;
            } else {
                iterationPrompt.disabled = true;
                iterateButton.disabled = true;
                newGameNameInput.disabled = true;
            }
        });

        // Handle iteration
        iterateButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const gameId = gameSelect.value;
            const prompt = iterationPrompt.value;
            const newGameName = newGameNameInput.value;
            const selectedGameName = gameSelect.options[gameSelect.selectedIndex].text;

            if (!gameId || !prompt || !newGameName) {
                alert('Please select a game, provide a name for the new game, and describe the changes.');
                return;
            }

            if(loadingOverlay) loadingOverlay.classList.remove('hidden');
            if(gameFrame) gameFrame.srcdoc = '';
            if(publishContainer) publishContainer.classList.add('hidden');

            try {
                const iterateResponse = await fetch('/api/iterate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId, prompt, newGameName }),
                });

                if (!iterateResponse.ok) {
                    const errorData = await iterateResponse.json();
                    throw new Error(errorData.error || 'Failed to iterate on the game.');
                }
                
                const data = await iterateResponse.json();
                iteratedGameCode = data.code;

                if(gameFrame) gameFrame.srcdoc = iteratedGameCode;
                if(gameContainer) gameContainer.classList.remove('hidden');
                if(publishContainer) publishContainer.classList.remove('hidden');
                if (newGameNameInput) {
                    newGameNameInput.value = `${selectedGameName} v2`;
                }
                if(publishButton) publishButton.style.display = 'block';

            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                if(loadingOverlay) loadingOverlay.classList.add('hidden');
            }
        });

        // Handle publishing the new version
        publishButton.addEventListener('click', async () => {
            const name = newGameNameInput ? newGameNameInput.value : null;
            if (!name) {
                alert('Please enter a name for your new game.');
                return;
            }

            try {
                const response = await fetch('/api/games', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, code: iteratedGameCode }),
                });

                if (!response.ok) {
                    throw new Error('Failed to publish game.');
                }

                const data = await response.json();
                if (gameFrame && data.id) {
                    gameFrame.srcdoc = ''; // Clear srcdoc before setting src
                    gameFrame.src = `play.html?id=${data.id}`;
                    if(publishContainer) publishContainer.classList.add('hidden');
                } else {
                    window.location.href = `index.html`;
                }
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    }
});

function initIndexPage() {
    const gameList = document.getElementById('game-list');
    fetch('/api/games')
        .then(response => response.json())
        .then(games => {
            games.forEach(game => {
                const listItem = document.createElement('li');
                listItem.className = 'game-item';

                const gameName = document.createElement('span');
                gameName.textContent = game.name;
                listItem.appendChild(gameName);

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const playButton = document.createElement('button');
                playButton.textContent = 'Play';
                playButton.addEventListener('click', () => {
                    window.location.href = `play.html?id=${game.id}`;
                });
                buttonContainer.appendChild(playButton);

                const iterateButton = document.createElement('button');
                iterateButton.textContent = 'Iterate';
                iterateButton.addEventListener('click', () => {
                    window.location.href = `iterate.html?id=${game.id}`;
                });
                buttonContainer.appendChild(iterateButton);

                const menuButton = document.createElement('button');
                menuButton.textContent = '...';
                menuButton.className = 'menu-button';
                buttonContainer.appendChild(menuButton);

                const flyoutMenu = document.createElement('div');
                flyoutMenu.className = 'flyout-menu hidden';

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.dataset.gameId = game.id;
                deleteButton.addEventListener('click', async (e) => {
                    const gameId = e.target.dataset.gameId;
                    if (confirm(`Are you sure you want to delete ${game.name}?`)) {
                        try {
                            const response = await fetch(`/api/games/${gameId}`, {
                                method: 'DELETE',
                            });
                            if (response.ok) {
                                e.target.closest('li').remove();
                            } else {
                                alert('Failed to delete game.');
                            }
                        } catch (error) {
                            console.error('Error deleting game:', error);
                            alert('An error occurred while deleting the game.');
                        }
                    }
                });
                flyoutMenu.appendChild(deleteButton);
                buttonContainer.appendChild(flyoutMenu);

                menuButton.addEventListener('click', () => {
                    flyoutMenu.classList.toggle('hidden');
                });

                listItem.appendChild(buttonContainer);
                gameList.appendChild(listItem);
            });
        });
}

function initPlayPage() {
    const gameDisplay = document.getElementById('game-display');
    const gameContainer = document.getElementById('game-container');
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenContainer = document.getElementById('fullscreen-container');

    if (fullscreenBtn && fullscreenContainer) {
        fullscreenBtn.addEventListener('click', () => {
            if (fullscreenContainer.requestFullscreen) {
                fullscreenContainer.requestFullscreen();
            } else if (fullscreenContainer.mozRequestFullScreen) { /* Firefox */
                fullscreenContainer.mozRequestFullScreen();
            } else if (fullscreenContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                fullscreenContainer.webkitRequestFullscreen();
            } else if (fullscreenContainer.msRequestFullscreen) { /* IE/Edge */
                fullscreenContainer.msRequestFullscreen();
            }
        });
    }

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const gameContainerWidth = gameContainer.clientWidth;
            const gameContainerHeight = gameContainer.clientHeight;

            const scaleX = screenWidth / gameContainerWidth;
            const scaleY = screenHeight / gameContainerHeight;
            const scale = Math.min(scaleX, scaleY);

            if (gameContainer) {
                gameContainer.style.transform = `scale(${scale})`;
            }
        } else {
            if (gameContainer) {
                gameContainer.style.transform = '';
            }
        }
    });

    if (gameId) {
        fetch(`/api/games/${gameId}`)
            .then(response => response.json())
            .then(game => {
                if (game && game.code) {
                    const htmlStartIndex = game.code.indexOf('<!DOCTYPE html>');
                    let gameHtml = htmlStartIndex !== -1 ? game.code.substring(htmlStartIndex) : game.code;

                    const style = `
                        <style>
                            html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
                            canvas { display: block; width: 100%; height: 100%; }
                        </style>
                    `;
                    gameHtml = style + gameHtml;
                    
                    const iframe = document.createElement('iframe');
                    iframe.srcdoc = gameHtml;
                    iframe.width = '100%';
                    iframe.height = '100%';
                    iframe.frameBorder = '0';
                    
                    gameDisplay.innerHTML = '';
                    gameDisplay.appendChild(iframe);
                } else {
                    gameDisplay.innerHTML = '<p>Could not load game. The game data is missing or invalid.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching game:', error);
                gameDisplay.innerHTML = '<p>There was an error loading the game.</p>';
            });
    }
}