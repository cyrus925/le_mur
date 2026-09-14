import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; // Ton composant LeMur
import Mots from './Mots'; // Ton composant LeMurDesMots

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mots" element={<Mots />} />
      </Routes>
    </Router>
  );
}

export default App;