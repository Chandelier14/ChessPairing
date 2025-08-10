import Cookies from 'js-cookie';
import { Tournament } from '../types';

const TOURNAMENT_COOKIE_KEY = 'chess_tournament_data';
const COOKIE_EXPIRY_DAYS = 30;

export class CookieStorage {
  static saveTournament(tournament: Tournament): void {
    try {
      const tournamentData = JSON.stringify(tournament);
      Cookies.set(TOURNAMENT_COOKIE_KEY, tournamentData, { 
        expires: COOKIE_EXPIRY_DAYS,
        sameSite: 'strict'
      });
    } catch (error) {
      console.warn('Failed to save tournament data to cookies:', error);
    }
  }

  static loadTournament(): Tournament | null {
    try {
      const tournamentData = Cookies.get(TOURNAMENT_COOKIE_KEY);
      if (tournamentData) {
        return JSON.parse(tournamentData);
      }
    } catch (error) {
      console.warn('Failed to load tournament data from cookies:', error);
      // Clear corrupted cookie
      Cookies.remove(TOURNAMENT_COOKIE_KEY);
    }
    return null;
  }

  static clearTournament(): void {
    Cookies.remove(TOURNAMENT_COOKIE_KEY);
  }

  static hasSavedTournament(): boolean {
    return !!Cookies.get(TOURNAMENT_COOKIE_KEY);
  }
}