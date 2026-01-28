import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Nanti kita tambah route Dashboard di sini */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;