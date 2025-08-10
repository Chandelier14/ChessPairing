import React, { useMemo, useState } from 'react';
import { Crown, UserPlus, Play, RotateCw, Download, Settings, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTournament } from './hooks/useTournament';
import { CookieStorage } from './utils/cookieStorage';

function App() {
  const {
    tournament,
    addPlayer,
    removePlayer,
    startTournament,
    updateGameResult,
    startNextRound,
    resetTournament
  } = useTournament();

  const [name, setName] = useState('');
  const [rating, setRating] = useState('1200');
  const [search, setSearch] = useState('');

  const hasSavedData = CookieStorage.hasSavedTournament();

  // Computed standings
  const standings = useMemo(() => {
    const copy = tournament.players.slice();
    copy.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.tiebreak !== a.tiebreak) return b.tiebreak - a.tiebreak;
      return b.rating - a.rating;
    });
    return copy;
  }, [tournament.players]);

  const filteredStandings = standings.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentRoundGames = tournament.games.filter(game => game.round === tournament.currentRound);

  function handleAddPlayer(e) {
    e && e.preventDefault();
    if (!name.trim()) return;
    
    addPlayer({
      name: name.trim(),
      rating: parseInt(rating) || 1200,
      score: 0,
      tiebreak: 0,
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      opponents: [],
      colors: []
    });
    
    setName('');
    setRating('1200');
  }

  function handleUpdateResult(gameId, result) {
    updateGameResult(gameId, result);
  }

  function getPlayerName(playerId) {
    return tournament.players.find(p => p.id === playerId)?.name || 'Unknown';
  }

  function getPlayerRating(playerId) {
    return tournament.players.find(p => p.id === playerId)?.rating || 0;
  }

  function getRecentGames(player) {
    const recentGames = [];
    const playerGames = tournament.games.filter(g => 
      (g.whitePlayerId === player.id || g.blackPlayerId === player.id) && g.completed
    );
    
    playerGames.slice(-3).forEach(game => {
      const isWhite = game.whitePlayerId === player.id;
      const opponent = getPlayerName(isWhite ? game.blackPlayerId : game.whitePlayerId);
      
      if (game.result === 'draw') {
        recentGames.push(`Draw vs ${opponent}`);
      } else if ((game.result === 'white' && isWhite) || (game.result === 'black' && !isWhite)) {
        recentGames.push(`W vs ${opponent}`);
      } else {
        recentGames.push(`L vs ${opponent}`);
      }
    });
    
    return recentGames;
  }

  const canStartTournament = tournament.players.length >= 2 && tournament.status === 'setup';
  const canStartNextRound = tournament.status === 'ongoing' && 
    currentRoundGames.length > 0 &&
    currentRoundGames.every(g => g.completed) &&
    tournament.currentRound < tournament.totalRounds;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800">
      {/* Top navigation */}
      <header className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-slate-900 rounded-full p-2 shadow-md">
                <Crown size={20} />
              </div>
              <div>
                <h1 className="font-semibold text-lg tracking-tight">ChessPairings</h1>
                <div className="text-xs opacity-80">Tournament management — Swiss & Round Robin</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-200 mr-4">
              Swiss System • {tournament.totalRounds} Rounds
              {hasSavedData && (
                <div className="text-xs text-green-400 mt-1">Auto-saved</div>
              )}
            </div>
            <button
              onClick={() => alert("Export functionality coming soon")}
              className="flex items-center gap-2 bg-transparent hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => alert("Settings functionality coming soon")}
              className="flex items-center gap-2 bg-transparent hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Add player & Controls */}
        <section className="lg:col-span-3 space-y-6">
          <motion.div
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Add Player</h2>
              <div className="text-sm text-slate-500">
                {tournament.status === 'setup' && 'Setup Phase'}
                {tournament.status === 'ongoing' && `Round ${tournament.currentRound}`}
                {tournament.status === 'completed' && 'Completed'}
              </div>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-3">
              <label className="block text-sm text-slate-600">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="Enter player name"
              />

              <label className="block text-sm text-slate-600">Rating</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                min="800"
                max="3000"
              />

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 font-medium transition-colors"
                >
                  <UserPlus size={16} className="inline mr-2" /> Add Player
                </button>
                <button 
                  type="button" 
                  onClick={() => { setName(''); setRating('1200') }} 
                  className="flex-0 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ y: 6, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-white rounded-2xl shadow p-5"
          >
            <h3 className="font-semibold mb-3">Tournament Control</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                {tournament.status === 'setup' && (
                  <button
                    onClick={startTournament}
                    disabled={!canStartTournament}
                    className={`flex-1 rounded-lg py-2 flex items-center justify-center gap-2 font-medium transition-colors ${
                      canStartTournament
                        ? 'bg-slate-900 hover:bg-black text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={16} /> Start Tournament
                  </button>
                )}
                
                {tournament.status === 'ongoing' && (
                  <button
                    onClick={startNextRound}
                    disabled={!canStartNextRound}
                    className={`flex-1 rounded-lg py-2 flex items-center justify-center gap-2 font-medium transition-colors ${
                      canStartNextRound
                        ? 'bg-slate-900 hover:bg-black text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={16} /> Next Round
                  </button>
                )}
                
                <button 
                  onClick={resetTournament} 
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 transition-colors"
                >
                  <RotateCw size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Round</label>
                <input 
                  value={tournament.currentRound} 
                  readOnly
                  type="number" 
                  className="w-20 rounded-md border px-2 py-1 bg-slate-50" 
                />
                <label className="text-sm text-slate-600">/</label>
                <input 
                  value={tournament.totalRounds} 
                  readOnly
                  type="number" 
                  className="w-20 rounded-md border px-2 py-1 bg-slate-50" 
                />
              </div>

              <div className="text-xs text-slate-500">
                Swiss pairing system with automatic color balancing and opponent history tracking.
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 6, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-white rounded-2xl shadow p-5"
          >
            <h3 className="font-semibold mb-2">Players ({tournament.players.length})</h3>
            <div className="flex flex-col gap-2 max-h-64 overflow-auto">
              {tournament.players.map((p) => {
                const recent = getRecentGames(p);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-4 border border-slate-100 rounded-lg p-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-semibold">
                        {p.name.split(" ")[0][0] || "P"}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-500">— • {p.rating}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{p.score}</div>
                      <div className="text-xs text-slate-400">{recent[0] || "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Middle column: Standings and Pairings list */}
        <section className="lg:col-span-6 space-y-6">
          <motion.div 
            initial={{ y: 10, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-xl">Tournament Standings</h2>
                <div className="text-sm text-slate-500">Sorted by score — tiebreaks: Buchholz system</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder="Search players..." 
                    className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors" 
                  />
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
                <button 
                  onClick={() => alert('Export standings functionality coming soon')} 
                  className="px-3 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr className="text-slate-500 text-sm">
                    <th className="py-2 w-12">#</th>
                    <th className="py-2">Player</th>
                    <th className="py-2 w-24">Rating</th>
                    <th className="py-2 w-24">Score</th>
                    <th className="py-2 w-36">Recent</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStandings.map((p, i) => {
                    const recent = getRecentGames(p);
                    return (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-semibold">{i + 1}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-semibold">
                              {p.name.split(" ")[0][0]}
                            </div>
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-slate-400">—</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{p.rating}</td>
                        <td className="py-3 font-semibold">{p.score}</td>
                        <td className="py-3 text-xs text-slate-500">{recent.slice(0, 3).join(" • ") || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 10, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-white rounded-2xl shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-xl">Round {tournament.currentRound} Pairings</h2>
                <div className="text-sm text-slate-500">Swiss system pairings — update results inline</div>
              </div>
            </div>

            <div className="space-y-3">
              {currentRoundGames.length === 0 && (
                <div className="text-slate-500">No pairings yet — start the tournament to generate pairings.</div>
              )}

              {currentRoundGames.map((game, idx) => (
                <div key={game.id} className="flex items-center justify-between gap-4 border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 text-center text-slate-600">Board {idx + 1}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium">{getPlayerName(game.whitePlayerId)}</div>
                        <div className="text-xs text-slate-400">{getPlayerRating(game.whitePlayerId)}</div>
                      </div>
                      <div className="px-3">—</div>
                      <div>
                        <div className="font-medium">{getPlayerName(game.blackPlayerId)}</div>
                        <div className="text-xs text-slate-400">{getPlayerRating(game.blackPlayerId)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-500 mr-2">Result</div>
                    {game.completed ? (
                      <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {game.result === 'white' && '1-0'}
                        {game.result === 'black' && '0-1'}
                        {game.result === 'draw' && '1/2-1/2'}
                      </div>
                    ) : (
                      <select
                        value="*"
                        onChange={(e) => e.target.value !== '*' && handleUpdateResult(game.id, e.target.value)}
                        className="rounded-md border px-2 py-1 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                      >
                        <option value="*">*</option>
                        <option value="white">1-0</option>
                        <option value="black">0-1</option>
                        <option value="draw">1/2-1/2</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Right column: Extra info, quick actions, and help */}
        <aside className="lg:col-span-3 space-y-6">
          <motion.div 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-white rounded-2xl shadow p-5"
          >
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button 
                onClick={() => alert('Export pairings functionality coming soon')} 
                className="w-full py-2 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                Export Pairings (PDF)
              </button>
              <button 
                onClick={() => alert('Live pairing functionality coming soon')} 
                className="w-full py-2 rounded-lg bg-slate-900 text-white hover:bg-black transition-colors"
              >
                Start Live Pairing
              </button>
              <button 
                onClick={() => alert('Import players functionality coming soon')} 
                className="w-full py-2 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                Import Players
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-white rounded-2xl shadow p-5"
          >
            <h3 className="font-semibold">Round Summary</h3>
            <div className="mt-3 text-sm text-slate-600">
              <div>Round: <span className="font-medium">{tournament.currentRound} / {tournament.totalRounds}</span></div>
              <div className="mt-2">Players: <span className="font-medium">{tournament.players.length}</span></div>
              <div className="mt-2">Boards: <span className="font-medium">{currentRoundGames.length}</span></div>
              <div className="mt-2">Status: <span className="font-medium capitalize">{tournament.status}</span></div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-white rounded-2xl shadow p-5"
          >
            <h3 className="font-semibold">Help & Notes</h3>
            <ul className="text-sm text-slate-500 mt-3 list-disc list-inside space-y-2">
              <li>Swiss pairing system with color balancing and opponent history.</li>
              <li>Results update scores instantly — standings recalculate automatically.</li>
              <li>Tournament data is automatically saved to browser cookies.</li>
              <li>Tiebreaks calculated using Buchholz system (sum of opponents' scores).</li>
            </ul>
          </motion.div>
        </aside>
      </main>

      {/* Tournament Completed Message */}
      {tournament.status === 'completed' && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-6 text-center"
          >
            <Crown className="h-12 w-12 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold text-white mb-2">Tournament Completed!</h2>
            <p className="text-yellow-100">
              {tournament.players.length > 0 && (
                <>Congratulations to <strong>{standings[0]?.name}</strong> for winning the tournament!</>
              )}
            </p>
          </motion.div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm">
          © ChessPairings — Professional tournament management system
        </div>
      </footer>
    </div>
  );
}

export default App;