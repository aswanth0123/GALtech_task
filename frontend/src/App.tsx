import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
