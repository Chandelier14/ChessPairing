import { Tournament, Game } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (tournament: Tournament) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Tournament Pairings', 14, 15);

  // Add tournament info
  doc.setFontSize(12);
  doc.text(`Round ${tournament.currentRound} of ${tournament.totalRounds}`, 14, 25);

  // Create the data for the table
  const tableData = tournament.games
    .filter(game => game.round === tournament.currentRound)
    .map(game => {
      const white = tournament.players.find(p => p.id === game.whiteId)?.name || '';
      const black = tournament.players.find(p => p.id === game.blackId)?.name || '';
      const result = game.completed ? game.result : 'Ongoing';
      return [white, black, result];
    });

  // Add the table
  (doc as any).autoTable({
    startY: 30,
    head: [['White', 'Black', 'Result']],
    body: tableData,
  });

  // Save the PDF
  doc.save('tournament-pairings.pdf');
};
