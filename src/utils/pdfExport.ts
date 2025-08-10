import { Tournament, Game } from '../types';
import jsPDF from 'jspdf';

export const exportToPDF = (tournament: Tournament) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add title with tournament name
  doc.setFontSize(20);
  doc.text('Chess Tournament Pairings', pageWidth / 2, 20, { align: 'center' });

  // Add round information
  doc.setFontSize(16);
  doc.text(`Round ${tournament.currentRound} of ${tournament.totalRounds}`, pageWidth / 2, 30, { align: 'center' });

  // Add current date
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`Generated on ${currentDate}`, pageWidth / 2, 40, { align: 'center' });

  // Add pairings
  doc.setFontSize(14);
  let yPosition = 60;

  // Filter games for current round and sort by board number
  const currentRoundGames = tournament.games
    .filter(game => game.round === tournament.currentRound)
    .sort((a, b) => a.id.localeCompare(b.id));

  currentRoundGames.forEach((game, index) => {
    const white = tournament.players.find(p => p.id === game.whitePlayerId);
    const black = tournament.players.find(p => p.id === game.blackPlayerId);
    
    if (!white || !black) return;

    const boardNumber = index + 1;
    const whiteText = `${white.name} (${white.rating})`;
    const blackText = `${black.name} (${black.rating})`;
    const resultText = game.completed ? 
      (game.result === 'white' ? '1-0' : 
       game.result === 'black' ? '0-1' : 
       '½-½') : 
      '*';

    const pairingText = `Board ${boardNumber}: ${whiteText} vs ${blackText} ${resultText}`;

    // Add new page if we're running out of space
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    // Add the pairing text
    doc.text(pairingText, 20, yPosition);
    yPosition += 10;
  });

  // Add standings if tournament has started
  if (tournament.status !== 'setup' && tournament.players.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Current Standings', pageWidth / 2, 20, { align: 'center' });

    // Sort players by score
    const sortedPlayers = [...tournament.players]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.rating - a.rating;
      });

    yPosition = 40;
    doc.setFontSize(12);

    sortedPlayers.forEach((player, index) => {
      const playerText = `${index + 1}. ${player.name} - ${player.score} points (Rating: ${player.rating})`;
      
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(playerText, 20, yPosition);
      yPosition += 8;
    });
  }

  // Save the PDF with a descriptive name
  const fileName = `Chess_Tournament_Round_${tournament.currentRound}.pdf`;
  doc.save(fileName);
};
