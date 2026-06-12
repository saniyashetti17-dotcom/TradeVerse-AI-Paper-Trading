import { useEffect, useState } from "react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data));
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Transactions</h1>

      <div className="bg-slate-900 rounded-2xl p-6">
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
              <tr key={index} className="border-t border-slate-800">
                <td className="py-4 font-bold text-green-400">
                  {item.type}
                </td>
                <td>{item.stock}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
                <td>₹{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}