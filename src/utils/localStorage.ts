import { Player } from '../types';

interface TournamentState {
    players: Player[];
    currentRound: number;
    pairings: [Player, Player][];
    status: 'setup' | 'ongoing' | 'completed';
    totalRounds: number;
}

const STORAGE_KEY = 'chessTournament';

export const saveTournamentState = (state: TournamentState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('Tournament state saved successfully');
    } catch (error) {
        console.error('Failed to save tournament state:', error);
    }
};

export const loadTournamentState = (): TournamentState | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;
        
        const state = JSON.parse(saved);
        console.log('Tournament state loaded successfully');
        return state;
    } catch (error) {
        console.error('Failed to load tournament state:', error);
        return null;
    }
};

export const clearTournamentState = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Tournament state cleared successfully');
    } catch (error) {
        console.error('Failed to clear tournament state:', error);
    }
};
