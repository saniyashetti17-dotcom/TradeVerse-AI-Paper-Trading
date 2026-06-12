import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-10">
        TradeVerse
      </h1>

      <div className="flex flex-col gap-4">
        <Link to="/" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl">
          📊 Dashboard
        </Link>

        <Link to="/portfolio" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl">
          💼 Portfolio
        </Link>

        <Link to="/market" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl">
          📈 Market
        </Link>

        <Link to="/watchlist" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl">
          ⭐ Watchlist
        </Link>

        <Link to="/transactions" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl">
          📜 Transactions
        </Link>

        <Link to="/ai-signals" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl">
          🤖 AI Signals
        </Link>
      </div>
    </div>
  );
}