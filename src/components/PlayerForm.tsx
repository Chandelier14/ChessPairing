import React, { useState } from 'react';
import { Player } from '../types';
import { UserPlus } from 'lucide-react';

interface PlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id'>) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onAddPlayer }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('1200');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPlayer({
        name: name.trim(),
        rating: parseInt(rating) || 1200,
        score: 0,
        tiebreak: 0,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        opponents: [],
        colors: []
      });
      setName('');
      setRating('1200');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <UserPlus className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Add Player</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
            Player Name
          </label>
          <input
            type="text"
            id="playerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
            placeholder="Enter player name"
            required
          />
        </div>
        
        <div className="w-32">
          <label htmlFor="playerRating" className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <input
            type="number"
            id="playerRating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
            min="800"
            max="3000"
          />
        </div>
        
        <button
          type="submit"
          className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Add Player
        </button>
      </div>
    </form>
  );
};