export interface Player {
  id: string;
  name: string;
  rating: number;
  score: number;
  tiebreak: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  opponents: string[];
  colors: ('white' | 'black')[];
}

export interface Game {
  id: string;
  round: number;
  whitePlayerId: string;
  blackPlayerId: string;
  result: 'white' | 'black' | 'draw' | null;
  completed: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  players: Player[];
  games: Game[];
  currentRound: number;
  totalRounds: number;
  pairingSystem: 'swiss' | 'roundRobin';
  status: 'setup' | 'ongoing' | 'completed';
}

export interface PairingResult {
  whitePlayerId: string;
  blackPlayerId: string;
}