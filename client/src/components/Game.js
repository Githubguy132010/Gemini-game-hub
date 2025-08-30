import React from 'react';

const Game = ({ game }) => {
  return (
    <div className="game">
      <h3>{game.name}</h3>
      <p>Genre: {game.genre}</p>
      <p>Release Year: {game.releaseYear}</p>
      <button>Delete</button>
    </div>
  );
};

export default Game;