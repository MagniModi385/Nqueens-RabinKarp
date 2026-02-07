import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Play from './pages/Play';
import Simulation from './pages/Simulation';
import RabinKarp from './pages/RabinKarp';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/rabinkarp" element={<RabinKarp />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
