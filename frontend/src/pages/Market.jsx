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

const API_URL = "https://tradeverse-backend-j4r0.onrender.com";

export default function Market() {
  const [stocks, setStocks] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [search, setSearch] = useState("");
  const [prices, setPrices] = useState({});
  const [signals, setSignals] = useState({});
  const [activeTab, setActiveTab] = useState("stocks");
  const [chartData, setChartData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/all-stocks`)
      .then((res) => res.json())
      .then((data) => setStocks(Array.isArray(data) ? data : []));
  }, []);

  const loadCommodities = () => {
    fetch(`${API_URL}/commodities`)
      .then((res) => res.json())
      .then((data) => setCommodities(Array.isArray(data) ? data : []));
  };

  const loadPrice = async (symbol) => {
    const res = await fetch(`${API_URL}/live-stock/${symbol}`);
    const data = await res.json();

    setPrices((prev) => ({
      ...prev,
      [symbol]: data,
    }));

    return data;
  };

  const loadSignal = async (symbol) => {
    const res = await fetch(`${API_URL}/ai-signal/${symbol}`);
    const data = await res.json();

    setSignals((prev) => ({
      ...prev,
      [symbol]: data,
    }));

    return data;
  };

  const loadChart = async (symbol) => {
    const res = await fetch(`${API_URL}/chart/${symbol}`);
    const data = await res.json();

    setChartData(Array.isArray(data) ? data : []);
    return Array.isArray(data) ? data : [];
  };

  const openDetails = async (asset) => {
    setSelectedAsset(asset);
    await loadPrice(asset.symbol);
    await loadSignal(asset.symbol);
    await loadChart(asset.symbol);
  };

  const buyStock = async (stock) => {
    const response = await fetch(`${API_URL}/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stock, quantity: 1 }),
    });

    const data = await response.json();
    alert(data.message || data.error || "Stock Purchased");
  };

  const addToWatchlist = async (stock) => {
    const response = await fetch(`${API_URL}/watchlist/${stock}`, {
      method: "POST",
    });

    const data = await response.json();
    alert(data.message || data.error);
  };

  const filteredStocks = stocks.filter(
    (item) =>
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const signalColor = (signal) => {
    if (signal === "STRONG BUY") return "text-green-400";
    if (signal === "BUY") return "text-green-400";
    if (signal === "SELL") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Market</h1>

      <p className="text-slate-400 mb-8">
        AI will help you decide what to buy, sell or hold.
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("stocks")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            activeTab === "stocks" ? "bg-green-500 text-black" : "bg-slate-800"
          }`}
        >
          Stocks
        </button>

        <button
          onClick={() => {
            setActiveTab("commodities");
            loadCommodities();
          }}
          className={`px-4 py-2 rounded-xl font-semibold ${
            activeTab === "commodities"
              ? "bg-green-500 text-black"
              : "bg-slate-800"
          }`}
        >
          Gold / Silver / Crude / Nifty
        </button>
      </div>

      {activeTab === "stocks" && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 overflow-x-auto">
          <input
            type="text"
            placeholder="Search any NSE stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-6 p-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-green-500"
          />

          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-4">Symbol</th>
                <th className="pb-4">Company</th>
                <th className="pb-4">Price</th>
                <th className="pb-4">Change</th>
                <th className="pb-4">AI Signal</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStocks.slice(0, 50).map((item) => (
                <tr key={item.symbol} className="border-t border-slate-800">
                  <td className="py-4 font-semibold">{item.symbol}</td>
                  <td>{item.name}</td>

                  <td>
                    {prices[item.symbol]
                      ? `₹${prices[item.symbol].price}`
                      : "-"}
                  </td>

                  <td
                    className={
                      prices[item.symbol]?.change?.includes("+")
                        ? "text-green-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {prices[item.symbol]?.change || "-"}
                  </td>

                  <td>
                    {signals[item.symbol] ? (
                      <div>
                        <p
                          className={`font-bold ${signalColor(
                            signals[item.symbol].signal
                          )}`}
                        >
                          {signals[item.symbol].signal}
                        </p>

                        <p className="text-xs text-slate-400">
                          {signals[item.symbol].confidence}% confidence
                        </p>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="flex gap-2 py-3 flex-wrap">
                    <button
                      onClick={() => loadPrice(item.symbol)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
                    >
                      Price
                    </button>

                    <button
                      onClick={() => loadSignal(item.symbol)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-black px-3 py-2 rounded-lg font-semibold"
                    >
                      AI
                    </button>

                    <button
                      onClick={() => buyStock(item.symbol)}
                      className="bg-green-500 hover:bg-green-600 text-black px-3 py-2 rounded-lg font-semibold"
                    >
                      Buy
                    </button>

                    <button
                      onClick={() => addToWatchlist(item.symbol)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-lg font-semibold"
                    >
                      ⭐
                    </button>

                    <button
                      onClick={() => openDetails(item)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "commodities" && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-4">Asset</th>
                <th className="pb-4">Price</th>
                <th className="pb-4">Change</th>
                <th className="pb-4">AI Signal</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {commodities.map((item) => (
                <tr key={item.symbol} className="border-t border-slate-800">
                  <td className="py-4 font-semibold">{item.symbol}</td>
                  <td>₹{item.price}</td>

                  <td
                    className={
                      item.change.includes("+")
                        ? "text-green-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {item.change}
                  </td>

                  <td>
                    {signals[item.symbol] ? (
                      <div>
                        <p
                          className={`font-bold ${signalColor(
                            signals[item.symbol].signal
                          )}`}
                        >
                          {signals[item.symbol].signal}
                        </p>

                        <p className="text-xs text-slate-400">
                          {signals[item.symbol].confidence}% confidence
                        </p>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="flex gap-2 py-3 flex-wrap">
                    <button
                      onClick={() => loadSignal(item.symbol)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-black px-3 py-2 rounded-lg font-semibold"
                    >
                      AI
                    </button>

                    <button
                      onClick={() => buyStock(item.symbol)}
                      className="bg-green-500 hover:bg-green-600 text-black px-3 py-2 rounded-lg font-semibold"
                    >
                      Buy
                    </button>

                    <button
                      onClick={() => openDetails(item)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAsset && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">{selectedAsset.symbol}</h2>
                <p className="text-slate-400">
                  {selectedAsset.name || "Market Asset"}
                </p>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400">Price</p>
                <h3 className="text-xl font-bold">
                  ₹{prices[selectedAsset.symbol]?.price || "-"}
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400">AI Signal</p>
                <h3
                  className={`text-xl font-bold ${signalColor(
                    signals[selectedAsset.symbol]?.signal
                  )}`}
                >
                  {signals[selectedAsset.symbol]?.signal || "-"}
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400">Target</p>
                <h3 className="text-xl font-bold">
                  ₹{signals[selectedAsset.symbol]?.target || "-"}
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400">Stop Loss</p>
                <h3 className="text-xl font-bold">
                  ₹{signals[selectedAsset.symbol]?.stop_loss || "-"}
                </h3>
              </div>
            </div>

            <div className="h-80 bg-slate-800 rounded-2xl p-4 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => buyStock(selectedAsset.symbol)}
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-3 rounded-xl"
              >
                Buy Now
              </button>

              <button
                onClick={() => addToWatchlist(selectedAsset.symbol)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-3 rounded-xl"
              >
                ⭐ Add Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}