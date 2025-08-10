import React from 'react';
import { Tournament } from '../types';
import { Play, RotateCcw, Trophy, Save } from 'lucide-react';
import { CookieStorage } from '../utils/cookieStorage';

interface TournamentManagerProps {
  tournament: Tournament;
  onStartTournament: () => void;
  onNextRound: () => void;
  onResetTournament: () => void;
}

export const TournamentManager: React.FC<TournamentManagerProps> = ({
  tournament,
  onStartTournament,
  onNextRound,
  onResetTournament
}) => {
  const canStartTournament = tournament.players.length >= 2 && tournament.status === 'setup';
  const canStartNextRound = tournament.status === 'ongoing' && 
    tournament.games.filter(g => g.round === tournament.currentRound && !g.completed).length === 0 &&
    tournament.currentRound < tournament.totalRounds;
  const hasSavedData = CookieStorage.hasSavedTournament();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Tournament Control</h3>
        </div>
        <div className="text-sm text-gray-500">
          {tournament.status === 'setup' && 'Setup Phase'}
          {tournament.status === 'ongoing' && `Round ${tournament.currentRound} of ${tournament.totalRounds}`}
          {tournament.status === 'completed' && 'Tournament Complete'}
          {hasSavedData && (
            <div className="flex items-center mt-1 text-green-600">
              <Save className="h-3 w-3 mr-1" />
              Auto-saved
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {tournament.status === 'setup' && (
          <button
            onClick={onStartTournament}
            disabled={!canStartTournament}
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
              canStartTournament
                ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Tournament
          </button>
        )}
        
        {tournament.status === 'ongoing' && (
          <button
            onClick={onNextRound}
            disabled={!canStartNextRound}
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
              canStartNextRound
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Next Round
          </button>
        )}
        
        <button
          onClick={onResetTournament}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Tournament
        </button>
      </div>
    </div>
  );
};