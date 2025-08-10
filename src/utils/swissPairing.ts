import { Player, PairingResult } from '../types';

export class SwissPairing {
  static generatePairings(players: Player[], round: number): PairingResult[] {
    // Sort players by score (descending), then by tiebreak (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.tiebreak - a.tiebreak;
    });

    const pairings: PairingResult[] = [];
    const unpaired = [...sortedPlayers];

    while (unpaired.length >= 2) {
      const player1 = unpaired.shift()!;
      let paired = false;

      // Try to find a suitable opponent
      for (let i = 0; i < unpaired.length; i++) {
        const player2 = unpaired[i];

        // Check if they haven't played before
        if (!player1.opponents.includes(player2.id)) {
          // Determine colors based on previous games and preference
          const { white, black } = this.determineColors(player1, player2, round);
          
          pairings.push({
            whitePlayerId: white.id,
            blackPlayerId: black.id
          });

          unpaired.splice(i, 1);
          paired = true;
          break;
        }
      }

      // If no suitable opponent found, pair with the next available player
      if (!paired && unpaired.length > 0) {
        const player2 = unpaired.shift()!;
        const { white, black } = this.determineColors(player1, player2, round);
        
        pairings.push({
          whitePlayerId: white.id,
          blackPlayerId: black.id
        });
      }
    }

    return pairings;
  }

  private static determineColors(player1: Player, player2: Player, round: number): { white: Player; black: Player } {
    const p1WhiteCount = player1.colors.filter(c => c === 'white').length;
    const p1BlackCount = player1.colors.filter(c => c === 'black').length;
    const p2WhiteCount = player2.colors.filter(c => c === 'white').length;
    const p2BlackCount = player2.colors.filter(c => c === 'black').length;

    const p1Preference = p1WhiteCount - p1BlackCount;
    const p2Preference = p2WhiteCount - p2BlackCount;

    // Player with stronger preference for opposite color gets it
    if (p1Preference < p2Preference) {
      return { white: player1, black: player2 };
    } else if (p2Preference < p1Preference) {
      return { white: player2, black: player1 };
    } else {
      // If equal preference, higher-rated player gets white (first round advantage)
      if (player1.rating >= player2.rating) {
        return { white: player1, black: player2 };
      } else {
        return { white: player2, black: player1 };
      }
    }
  }

  static calculateTiebreak(player: Player, allPlayers: Player[]): number {
    // Buchholz system: sum of opponents' scores
    let tiebreak = 0;
    for (const opponentId of player.opponents) {
      const opponent = allPlayers.find(p => p.id === opponentId);
      if (opponent) {
        tiebreak += opponent.score;
      }
    }
    return tiebreak;
  }
}