import { useState, useCallback } from 'react';
import { Tournament, Player, Game } from '../types';
import { SwissPairing } from '../utils/swissPairing';
import { CookieStorage } from '../utils/cookieStorage';

export const useTournament = () => {
  const getInitialTournament = (): Tournament => {
    const savedTournament = CookieStorage.loadTournament();
    if (savedTournament) {
      return savedTournament;
    }
    return {
      id: '1',
      name: 'Chess Tournament',
      players: [],
      games: [],
      currentRound: 0,
      totalRounds: 5,
      pairingSystem: 'swiss',
      status: 'setup'
    };
  };

  const [tournament, setTournament] = useState<Tournament>(getInitialTournament);

  // Save tournament to cookies whenever it changes
  const updateTournament = useCallback((updater: (prev: Tournament) => Tournament) => {
    setTournament(prev => {
      const updated = updater(prev);
      CookieStorage.saveTournament(updated);
      return updated;
    });
  }, []);

  const addPlayer = useCallback((playerData: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: Date.now().toString()
    };
    
    updateTournament(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    updateTournament(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  }, []);

  const startTournament = useCallback(() => {
    if (tournament.players.length < 2) return;
    
    updateTournament(prev => ({
      ...prev,
      status: 'ongoing',
      currentRound: 1
    }));
    
    // Generate first round pairings
    const pairings = SwissPairing.generatePairings(tournament.players, 1);
    const newGames: Game[] = pairings.map((pairing, index) => ({
      id: `${Date.now()}-${index}`,
      round: 1,
      whitePlayerId: pairing.whitePlayerId,
      blackPlayerId: pairing.blackPlayerId,
      result: null,
      completed: false
    }));
    
    updateTournament(prev => ({
      ...prev,
      games: newGames
    }));
  }, [tournament.players]);

  const updateGameResult = useCallback((gameId: string, result: 'white' | 'black' | 'draw') => {
    updateTournament(prev => {
      const updatedGames = prev.games.map(game => 
        game.id === gameId ? { ...game, result, completed: true } : game
      );
      
      // Update player statistics
      const updatedPlayers = prev.players.map(player => {
        const game = updatedGames.find(g => g.id === gameId);
        if (!game) return player;
        
        const isWhite = game.whitePlayerId === player.id;
        const isBlack = game.blackPlayerId === player.id;
        
        if (!isWhite && !isBlack) return player;
        
        // Add opponent to history if not already there
        const opponentId = isWhite ? game.blackPlayerId : game.whitePlayerId;
        const opponents = player.opponents.includes(opponentId) 
          ? player.opponents 
          : [...player.opponents, opponentId];
        
        // Add color to history
        const colors = [...player.colors, isWhite ? 'white' : 'black'] as ('white' | 'black')[];
        
        let score = player.score;
        let wins = player.wins;
        let draws = player.draws;
        let losses = player.losses;
        
        if (result === 'draw') {
          score += 0.5;
          draws++;
        } else if ((result === 'white' && isWhite) || (result === 'black' && isBlack)) {
          score += 1;
          wins++;
        } else {
          losses++;
        }
        
        return {
          ...player,
          score,
          wins,
          draws,
          losses,
          opponents,
          colors,
          gamesPlayed: player.gamesPlayed + 1
        };
      });
      
      // Recalculate tiebreaks
      const playersWithTiebreaks = updatedPlayers.map(player => ({
        ...player,
        tiebreak: SwissPairing.calculateTiebreak(player, updatedPlayers)
      }));
      
      return {
        ...prev,
        games: updatedGames,
        players: playersWithTiebreaks
      };
    });
  }, [updateTournament]);

  const startNextRound = useCallback(() => {
    const nextRound = tournament.currentRound + 1;
    if (nextRound > tournament.totalRounds) {
      updateTournament(prev => ({ ...prev, status: 'completed' }));
      return;
    }
    
    const pairings = SwissPairing.generatePairings(tournament.players, nextRound);
    const newGames: Game[] = pairings.map((pairing, index) => ({
      id: `${Date.now()}-${index}`,
      round: nextRound,
      whitePlayerId: pairing.whitePlayerId,
      blackPlayerId: pairing.blackPlayerId,
      result: null,
      completed: false
    }));
    
    updateTournament(prev => ({
      ...prev,
      currentRound: nextRound,
      games: [...prev.games, ...newGames]
    }));
  }, [tournament, updateTournament]);

  const resetTournament = useCallback(() => {
    const freshTournament = {
      id: '1',
      name: 'Chess Tournament',
      players: [],
      games: [],
      currentRound: 0,
      totalRounds: 5,
      pairingSystem: 'swiss',
      status: 'setup'
    };
    setTournament(freshTournament);
    CookieStorage.clearTournament();
  }, []);

  return {
    tournament,
    addPlayer,
    removePlayer,
    startTournament,
    updateGameResult,
    startNextRound,
    resetTournament
  };
};