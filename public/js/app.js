document.addEventListener('DOMContentLoaded', () => {
    const gameForm = document.getElementById('game-form');
    const gamePrompt = document.getElementById('game-prompt');
    const gameContainer = document.getElementById('game-container');
    const publishContainer = document.getElementById('publish-container');
    const publishForm = document.getElementById('publish-form');
    const gameNameInput = document.getElementById('game-name');
    const gameList = document.getElementById('game-list');
    const gameDisplay = document.getElementById('game-display');
    const loadingIndicator = document.getElementById('loading-indicator');
    let gameCode = '';

    // Logic for the main page (index.html)
    if (gameList) {
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

    // Logic for the play page (play.html)
    if (gameDisplay) {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('id');

        if (gameId) {
            fetch(`/api/games/${gameId}`)
                .then(response => response.json())
                .then(game => {
                    if (game && game.code) {
                        const htmlStartIndex = game.code.indexOf('<!DOCTYPE html>');
                        const gameHtml = htmlStartIndex !== -1 ? game.code.substring(htmlStartIndex) : game.code;
                        
                        // Create iframe element dynamically
                        const iframe = document.createElement('iframe');
                        iframe.srcdoc = gameHtml;
                        iframe.width = '100%';
                        iframe.height = '100vh';
                        iframe.frameBorder = '0';
                        
                        // Clear previous content and append the new iframe
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

    if (gameForm) {
        gameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const prompt = gamePrompt.value;
            if (!prompt) {
                alert('Please describe the game you want to create.');
                return;
            }

            loadingIndicator.classList.remove('hidden');

            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt }),
                });

                if (!response.ok) {
                    throw new Error('Failed to generate game.');
                }

                const data = await response.json();
                if (data && data.code) {
                    const htmlStartIndex = data.code.indexOf('<!DOCTYPE html>');
                    gameCode = htmlStartIndex !== -1 ? data.code.substring(htmlStartIndex) : data.code;

                    const iframe = document.createElement('iframe');
                    iframe.srcdoc = gameCode;
                    iframe.width = '100%';
                    iframe.height = '400px';

                    gameContainer.innerHTML = '';
                    gameContainer.appendChild(iframe);
                    publishContainer.style.display = 'block';
                } else {
                    alert('Failed to generate game code.');
                }
            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        });
    }

    if (publishForm) {
        publishForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = gameNameInput.value;
            if (!name) {
                alert('Please enter a name for your game.');
                return;
            }

            try {
                const response = await fetch('/api/games', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, code: gameCode }),
                });

                if (!response.ok) {
                    throw new Error('Failed to publish game.');
                }

                const data = await response.json();
                window.location.href = `play.html?id=${data.id}`;
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    }


    // Logic for the iterate page (iterate.html)
    const gameSelect = document.getElementById('game-select');
    const iterationPrompt = document.getElementById('iteration-prompt');
    const iterateButton = document.getElementById('iterate-button');
    const gamePreview = document.getElementById('game-preview');
    const newGameNameInput = document.getElementById('new-game-name');
    const publishButton = document.getElementById('publish-button');
    let iteratedGameCode = '';

    if (gameSelect) {
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
            } else {
                iterationPrompt.disabled = true;
                iterateButton.disabled = true;
            }
        });

        // Handle iteration
        iterateButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const gameId = gameSelect.value;
            const prompt = iterationPrompt.value;
            const selectedGameName = gameSelect.options[gameSelect.selectedIndex].text;


            if (!gameId || !prompt) {
                alert('Please select a game and provide a prompt.');
                return;
            }

            loadingIndicator.classList.remove('hidden');
            gamePreview.innerHTML = '';
            publishContainer.classList.add('hidden');

            try {
                const iterateResponse = await fetch('/api/iterate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId, prompt }),
                });

                if (!iterateResponse.ok) {
                    const errorData = await iterateResponse.json();
                    throw new Error(errorData.error || 'Failed to iterate on the game.');
                }
                
                const data = await iterateResponse.json();
                iteratedGameCode = data.code;

                const iframe = document.createElement('iframe');
                iframe.srcdoc = iteratedGameCode;
                iframe.width = '100%';
                iframe.height = '400px';

                gamePreview.innerHTML = '';
                gamePreview.appendChild(iframe);
                publishContainer.classList.remove('hidden');
                newGameNameInput.value = `${selectedGameName} v2`;
                publishButton.style.display = 'block';

            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        });


        // Handle publishing the new version
        publishButton.addEventListener('click', async () => {
            const name = newGameNameInput.value;
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
                window.location.href = `index.html`;
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    }
});