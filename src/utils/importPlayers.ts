import { Tournament, Player } from '../types';

export const importPlayers = (file: File): Promise<Player[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const players: Player[] = lines
          .filter(line => line.trim())
          .map((line, index) => {
            const [name, rating = '1500'] = line.split(',').map(s => s.trim());
            return {
              id: `imported-${index}`,
              name: name,
              rating: parseInt(rating, 10),
              score: 0,
              opponents: [],
              colors: { white: 0, black: 0 },
            };
          });
        resolve(players);
      } catch (error) {
        reject(new Error('Failed to parse player data. Please ensure the file is in the correct format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};
