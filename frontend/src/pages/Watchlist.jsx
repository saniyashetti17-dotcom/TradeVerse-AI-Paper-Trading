import { useEffect, useState } from "react";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);

  const loadWatchlist = () => {
    fetch("http://127.0.0.1:8000/watchlist")
      .then((res) => res.json())
      .then((data) => setWatchlist(data));
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const removeStock = async (stock) => {
    const response = await fetch(
      `http://127.0.0.1:8000/watchlist/${stock}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();
    alert(data.message || data.error);

    loadWatchlist();
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">⭐ Watchlist</h1>

      <div className="bg-slate-900 rounded-2xl p-6">
        {watchlist.length === 0 ? (
          <p className="text-slate-400">No stocks in watchlist yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left pb-4">Stock</th>
                <th className="text-left pb-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {watchlist.map((item) => (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="py-4 font-semibold">{item.stock}</td>

                  <td>
                    <button
                      onClick={() => removeStock(item.stock)}
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}