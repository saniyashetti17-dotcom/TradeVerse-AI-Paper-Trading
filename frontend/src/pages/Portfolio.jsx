import { useEffect, useState } from "react";

const API_URL = "https://tradeverse-backend-j4r0.onrender.com";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [advisor, setAdvisor] = useState([]);

  const fetchPortfolio = async () => {
    const res = await fetch(`${API_URL}/portfolio-summary`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setPortfolio(data);
    } else {
      setPortfolio([]);
    }
  };

  const fetchLivePortfolio = async () => {
    const res = await fetch(`${API_URL}/portfolio-live-summary`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setPortfolio(data);
    }
  };

  const fetchAdvisor = async () => {
    const res = await fetch(`${API_URL}/portfolio-advisor`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setAdvisor(data);
    } else {
      setAdvisor([]);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchAdvisor();

    const interval = setInterval(() => {
      fetchLivePortfolio();
      fetchAdvisor();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const sellStock = async (stock) => {
    const res = await fetch(`${API_URL}/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stock, quantity: 1 }),
    });

    const data = await res.json();
    alert(data.message || data.error || "Stock Sold");

    fetchPortfolio();
    fetchAdvisor();
  };

  const getAdvisorForStock = (stock) => {
    return advisor.find((item) => item.stock === stock);
  };

  const recommendationColor = (recommendation) => {
    if (recommendation === "SELL") return "text-red-400";
    if (recommendation === "BUY MORE") return "text-green-400";
    return "text-yellow-400";
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Portfolio</h1>

      <p className="text-slate-400 mb-6">
        Track holdings, profit/loss and AI recommendation.
      </p>

      <button
        onClick={() => {
          fetchLivePortfolio();
          fetchAdvisor();
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-6"
      >
        🔄 Refresh Live Prices & AI
      </button>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 overflow-x-auto">
        {portfolio.length === 0 ? (
          <p className="text-slate-400">
            No holdings yet. Go to Market and buy a stock.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-4">Stock</th>
                <th className="pb-4">Qty</th>
                <th className="pb-4">Buy Price</th>
                <th className="pb-4">Current Price</th>
                <th className="pb-4">Invested</th>
                <th className="pb-4">Current Value</th>
                <th className="pb-4">P&L</th>
                <th className="pb-4">AI Signal</th>
                <th className="pb-4">AI Advice</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {portfolio.map((item, index) => {
                const advice = getAdvisorForStock(item.stock);

                return (
                  <tr key={index} className="border-t border-slate-800">
                    <td className="py-4 font-semibold">{item.stock}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.buy_price}</td>
                    <td>₹{item.current_price}</td>
                    <td>₹{item.invested}</td>
                    <td>₹{item.current_value}</td>

                    <td
                      className={
                        item.profit_loss >= 0
                          ? "text-green-400 font-bold"
                          : "text-red-400 font-bold"
                      }
                    >
                      ₹{item.profit_loss}
                    </td>

                    <td className="text-yellow-400 font-bold">
                      {advice?.signal || item.ai_signal || "HOLD"} (
                      {advice?.confidence || item.confidence || 0}%)
                    </td>

                    <td
                      className={`font-bold ${recommendationColor(
                        advice?.recommendation
                      )}`}
                    >
                      {advice?.recommendation || "HOLD"}
                    </td>

                    <td>
                      <button
                        onClick={() => sellStock(item.stock)}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                      >
                        Sell 1
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-4">
          🤖 AI Portfolio Advisor
        </h2>

        {advisor.length === 0 ? (
          <p className="text-slate-400">No AI advice yet.</p>
        ) : (
          <div className="space-y-3">
            {advisor.map((item, index) => (
              <div
                key={index}
                className="flex justify-between border-b border-slate-800 py-3"
              >
                <div className="font-semibold">{item.stock}</div>

                <div className="text-slate-300">{item.signal}</div>

                <div
                  className={`font-bold ${recommendationColor(
                    item.recommendation
                  )}`}
                >
                  {item.recommendation}
                </div>

                <div className="text-slate-400">{item.confidence}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}