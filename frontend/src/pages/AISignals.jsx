import { useEffect, useState } from "react";

const API_URL = "https://tradeverse-backend-j4r0.onrender.com";

export default function AISignals() {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/market-ai`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
          : [];

        setSignals(sorted);
      });
  }, []);

  const buyStock = async (stock) => {
    const res = await fetch(`${API_URL}/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock,
        quantity: 1,
      }),
    });

    const data = await res.json();

    alert(data.message || data.detail || data.error || "Stock Purchased");
  };

  const signalColor = (signal) => {
    if (signal === "STRONG BUY") return "text-green-400";
    if (signal === "BUY") return "text-green-400";
    if (signal === "SELL") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">🤖 AI Trading Signals</h1>

      <p className="text-slate-400 mb-8">
        AI generated opportunities ranked by confidence.
      </p>

{signals.length > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-900 p-6 rounded-2xl mb-8">
          <p className="text-green-100 text-sm">🚀 Best Buy Today</p>

          <h2 className="text-4xl font-bold mt-2">{signals[0].symbol}</h2>

          <div className="grid md:grid-cols-4 gap-4 mt-6">

            <div>
              <p className="text-green-100">Signal</p>
              <p className="font-bold">{signals[0].signal}</p>
            </div>

            <div>
              <p className="text-green-100">Confidence</p>
              <p className="font-bold">{signals[0].confidence}%</p>
            </div>

            <div>
              <p className="text-green-100">Target</p>
              <p className="font-bold">₹{signals[0].target}</p>
            </div>

            <div>
              <p className="text-green-100">Stop Loss</p>
              <p className="font-bold">₹{signals[0].stop_loss}</p>
            </div>

          </div>

        </div>
    
      )}

    <div className="bg-slate-900 rounded-2xl p-6 overflow-auto">

        <table className="w-full text-left">

          <thead>
            <tr className="text-slate-400">
              <th>Rank</th>
              <th>Asset</th>
              <th>Price</th>
              <th>Signal</th>
              <th>Confidence</th>
              <th>Target</th>
              <th>Stop Loss</th>
              <th>Risk</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {signals.map((item, index) => (
              <tr key={index} className="border-t border-slate-800">
                <td className="py-4">#{index + 1}</td>

                <td className="font-bold">{item.symbol}</td>

                <td>₹{item.price}</td>

                <td className={`font-bold ${signalColor(item.signal)}`}>
                  {item.signal}
                </td>

                <td>{item.confidence}%</td>

                <td>₹{item.target}</td>

                <td>₹{item.stop_loss}</td>

                <td>{item.risk}</td>

                <td>
                  <button
                    onClick={() => buyStock(item.symbol)}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg"
                  >
                    BUY
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {signals.length === 0 && (
          <p className="text-slate-400 mt-4">
            Loading AI signals from live backend...
          </p>
        )}
      </div>

    </div>
  );
}