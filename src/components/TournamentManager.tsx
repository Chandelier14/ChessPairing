import React, { useRef, useState, useEffect } from 'react';
import { Tournament, Player } from '../types';
import { Play, RotateCcw, Trophy, Save, FileDown, Upload, Wifi } from 'lucide-react';
import { CookieStorage } from '../utils/cookieStorage';
import { exportToPDF } from '../utils/pdfExport';
import { importPlayers } from '../utils/importPlayers';
import { saveTournamentState, loadTournamentState, clearTournamentState } from '../utils/localStorage';

interface TournamentManagerProps {
  tournament: Tournament;
  onStartTournament: () => void;
  onNextRound: () => void;
  onResetTournament: () => void;
  onPlayersImported: (players: Player[]) => void;
}

export const TournamentManager: React.FC<TournamentManagerProps> = ({
  tournament,
  onStartTournament,
  onNextRound,
  onResetTournament,
  onPlayersImported
}) => {
  const [isLivePairing, setIsLivePairing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canStartTournament = tournament.players.length >= 2 && tournament.status === 'setup';
  const canStartNextRound = tournament.status === 'ongoing' && 
    tournament.games.filter(g => g.round === tournament.currentRound && !g.completed).length === 0 &&
    tournament.currentRound < tournament.totalRounds;
  const hasSavedData = CookieStorage.hasSavedTournament();

  // Load tournament state from local storage on component mount
  useEffect(() => {
    const savedState = loadTournamentState();
    if (savedState) {
      onPlayersImported(savedState.players);
      // You might need to add more state restoration here depending on your needs
    }
  }, []);

  // Save tournament state to local storage whenever it changes
  useEffect(() => {
    if (tournament.status !== 'setup') {
      saveTournamentState({
        players: tournament.players,
        currentRound: tournament.currentRound,
        pairings: tournament.games.map(game => [
          tournament.players.find(p => p.id === game.whitePlayerId)!,
          tournament.players.find(p => p.id === game.blackPlayerId)!
        ]) as [Player, Player][],
        status: tournament.status,
        totalRounds: tournament.totalRounds
      });
    }
  }, [tournament]);

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedPlayers = await importPlayers(file);
        onPlayersImported(importedPlayers);
      } catch (error) {
        alert('Error importing players: ' + (error as Error).message);
      }
    }
  };

  const handleResetTournament = () => {
    clearTournamentState();
    onResetTournament();
  };

  // Handle live pairing toggle
  const toggleLivePairing = () => {
    alert('Live pairing feature is currently disabled. Check back later!');
  };

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
        {/* Quick Actions */}
        <div className="w-full flex gap-3 mb-4">
          <button
            onClick={() => exportToPDF(tournament)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Players
          </button>
          
          <button
            onClick={toggleLivePairing}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:opacity-90 transition-colors"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Live Pairing (Coming Soon)
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>

        {/* Original buttons */}
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