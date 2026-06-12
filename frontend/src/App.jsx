import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Market from "./pages/Market";
import Watchlist from "./pages/Watchlist";
import Transactions from "./pages/Transactions";
import AISignals from "./pages/AISignals";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/market" element={<Market />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/ai-signals" element={<AISignals />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;