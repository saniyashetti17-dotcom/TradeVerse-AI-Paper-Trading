import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [aiPicks, setAiPicks] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [movers, setMovers] = useState({
    gainers: [],
    losers: [],
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/balance")
      .then((res) => res.json())
      .then((data) => setBalance(data.balance || 0));

    fetch("http://127.0.0.1:8000/portfolio-summary")
      .then((res) => res.json())
      .then((data) => setPortfolio(Array.isArray(data) ? data : []));

    fetch("http://127.0.0.1:8000/watchlist")
      .then((res) => res.json())
      .then((data) => setWatchlist(Array.isArray(data) ? data : []));

    fetch("http://127.0.0.1:8000/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(Array.isArray(data) ? data : []));

    fetch("http://127.0.0.1:8000/market-ai")
      .then((res) => res.json())
      .then((data) => {
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
          : [];
        setAiPicks(sorted.slice(0, 5));
      });

    fetch("http://127.0.0.1:8000/commodities")
      .then((res) => res.json())
      .then((data) => setCommodities(Array.isArray(data) ? data : []));

    fetch("http://127.0.0.1:8000/top-movers")
      .then((res) => res.json())
      .then((data) =>
        setMovers({
          gainers: Array.isArray(data.gainers) ? data.gainers : [],
          losers: Array.isArray(data.losers) ? data.losers : [],
        })
      );
  }, []);

  const invested = portfolio.reduce(
    (sum, item) => sum + (item.invested || 0),
    0
  );

  const currentValue = portfolio.reduce(
    (sum, item) => sum + (item.current_value || 0),
    0
  );

  const totalPL = portfolio.reduce(
    (sum, item) => sum + (item.profit_loss || 0),
    0
  );

  const bestSignal = aiPicks.length > 0 ? aiPicks[0] : null;

  const chartData = [
    { name: "Invested", value: invested },
    { name: "Current Value", value: currentValue },
    { name: "Profit/Loss", value: totalPL },
  ];

  const signalColor = (signal) => {
    if (signal === "STRONG BUY") return "text-green-400";
    if (signal === "BUY") return "text-green-400";
    if (signal === "SELL") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">AI Trading Dashboard</h1>

      <p className="text-slate-400 mb-8">
        Track portfolio, market assets and AI-powered opportunities.
      </p>

      {bestSignal && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-900 p-6 rounded-2xl mb-8">
          <p className="text-sm text-green-100">🚀 Best Buy Today</p>

          <h2 className="text-4xl font-bold mt-2">{bestSignal.symbol}</h2>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-green-100">Signal</p>
              <p className="font-bold">{bestSignal.signal}</p>
            </div>

            <div>
              <p className="text-green-100">Confidence</p>
              <p className="font-bold">{bestSignal.confidence}%</p>
            </div>

            <div>
              <p className="text-green-100">Target</p>
              <p className="font-bold">₹{bestSignal.target}</p>
            </div>

            <div>
              <p className="text-green-100">Stop Loss</p>
              <p className="font-bold">₹{bestSignal.stop_loss}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Available Cash</p>
          <h2 className="text-3xl font-bold mt-2">
            ₹{balance.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Invested</p>
          <h2 className="text-3xl font-bold mt-2">
            ₹{invested.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Current Value</p>
          <h2 className="text-3xl font-bold mt-2">
            ₹{currentValue.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Total P&L</p>
          <h2
            className={`text-3xl font-bold mt-2 ${
              totalPL >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ₹{totalPL.toLocaleString("en-IN")}
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Holdings</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">
            {portfolio.length}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Watchlist</p>
          <h2 className="text-4xl font-bold text-yellow-400 mt-2">
            {watchlist.length}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Transactions</p>
          <h2 className="text-4xl font-bold text-blue-400 mt-2">
            {transactions.length}
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-5">🔥 Top AI Picks</h2>

          <div className="space-y-4">
            {aiPicks.map((item) => (
              <div
                key={item.symbol}
                className="flex justify-between border-b border-slate-800 pb-3"
              >
                <div>
                  <p className="font-bold">{item.symbol}</p>
                  <p className="text-sm text-slate-400">
                    Target ₹{item.target || "-"} | SL ₹
                    {item.stop_loss || "-"}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${signalColor(item.signal)}`}>
                    {item.signal || "HOLD"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {item.confidence || 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-5">🥇 Market Assets</h2>

          <div className="space-y-4">
            {commodities.map((item) => (
              <div
                key={item.symbol}
                className="flex justify-between border-b border-slate-800 pb-3"
              >
                <div>
                  <p className="font-bold">{item.symbol}</p>
                  <p className="text-sm text-slate-400">₹{item.price}</p>
                </div>

                <p
                  className={
                    item.change.includes("+")
                      ? "text-green-400 font-bold"
                      : "text-red-400 font-bold"
                  }
                >
                  {item.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-5">📈 Top Gainers</h2>

          {movers.gainers.map((item) => (
            <div
              key={item.symbol}
              className="flex justify-between border-b border-slate-800 py-3"
            >
              <span className="font-bold">{item.symbol}</span>
              <span>₹{item.price}</span>
              <span className="text-green-400 font-bold">{item.change}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-5">📉 Top Losers</h2>

          {movers.losers.map((item) => (
            <div
              key={item.symbol}
              className="flex justify-between border-b border-slate-800 py-3"
            >
              <span className="font-bold">{item.symbol}</span>
              <span>₹{item.price}</span>
              <span className="text-red-400 font-bold">{item.change}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-6">Portfolio Overview</h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}