import React from 'react';
import { Player } from '../types';
import { Trophy, Target, Users } from 'lucide-react';

interface PlayersListProps {
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
}

export const PlayersList: React.FC<PlayersListProps> = ({ players, onRemovePlayer }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.tiebreak !== a.tiebreak) return b.tiebreak - a.tiebreak;
    return b.rating - a.rating;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-900 px-6 py-4">
        <div className="flex items-center">
          <Users className="h-5 w-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Tournament Standings</h3>
          <span className="ml-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
            {players.length} players
          </span>
        </div>
      </div>
      
      {players.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No players registered yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{player.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {player.rating}
                      </span>
                      <span>W: {player.wins}</span>
                      <span>D: {player.draws}</span>
                      <span>L: {player.losses}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{player.score} pts</div>
                  <div className="text-sm text-gray-500">TB: {player.tiebreak.toFixed(1)}</div>
                </div>
                
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};