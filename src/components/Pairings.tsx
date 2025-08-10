import React from 'react';
import { Game, Player } from '../types';
import { Swords, Clock } from 'lucide-react';

interface PairingsProps {
  games: Game[];
  players: Player[];
  currentRound: number;
  onUpdateResult: (gameId: string, result: 'white' | 'black' | 'draw') => void;
}

export const Pairings: React.FC<PairingsProps> = ({ 
  games, 
  players, 
  currentRound, 
  onUpdateResult 
}) => {
  const currentRoundGames = games.filter(game => game.round === currentRound);
  
  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  if (currentRoundGames.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No pairings for this round yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-900 px-6 py-4">
        <div className="flex items-center">
          <Swords className="h-5 w-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">
            Round {currentRound} Pairings
          </h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {currentRoundGames.map((game, index) => (
          <div key={game.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-500">
                  Board {index + 1}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {getPlayerName(game.whitePlayerId)}
                    </div>
                    <div className="text-xs text-gray-500">White</div>
                  </div>
                  
                  <div className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    vs
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">
                      {getPlayerName(game.blackPlayerId)}
                    </div>
                    <div className="text-xs text-gray-500">Black</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {game.completed ? (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {game.result === 'white' && 'White wins'}
                    {game.result === 'black' && 'Black wins'}
                    {game.result === 'draw' && 'Draw'}
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onUpdateResult(game.id, 'white')}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      White
                    </button>
                    <button
                      onClick={() => onUpdateResult(game.id, 'draw')}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Draw
                    </button>
                    <button
                      onClick={() => onUpdateResult(game.id, 'black')}
                      className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-sm font-medium"
                    >
                      Black
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};