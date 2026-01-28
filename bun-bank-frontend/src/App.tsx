import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoute />}> //setup private route
        <Route path="/dashboard" element={<div>Dashboard</div>} />
          {/* Nanti kita tambah route Dashboard di sini */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;