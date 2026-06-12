import { useEffect, useState } from "react";

const API_URL = "https://tradeverse-backend-j4r0.onrender.com";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/transactions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(data.reverse());
        } else {
          setTransactions([]);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        Transactions
      </h1>

      <p className="text-slate-400 mb-8">
        Complete history of all buy and sell orders.
      </p>

      <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">

        {transactions.length === 0 ? (
          <p className="text-slate-400">
            No transactions found.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-4">Type</th>
                <th className="pb-4">Stock</th>
                <th className="pb-4">Qty</th>
                <th className="pb-4">Price</th>
                <th className="pb-4">Total</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-800"
                >
                  <td
                    className={`py-4 font-bold ${
                      item.type === "BUY"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.type}
                  </td>

                  <td>{item.stock}</td>

                  <td>{item.quantity}</td>

                  <td>₹{item.price}</td>

                  <td className="font-semibold">
                    ₹{item.total}
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