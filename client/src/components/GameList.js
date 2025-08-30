import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Game from './Game';

const GameList = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get('/api/games');
        setGames(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGames();
  }, []);

  return (
    <div>
      <h3>Games</h3>
      <div className="game-list">
        {games.map(game => (
          <Game key={game._id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameList;