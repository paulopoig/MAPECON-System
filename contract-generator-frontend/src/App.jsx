import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContractsList from './pages/ContractsList'; // NEW
import ContractDetail from './pages/ContractDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contracts" element={<ContractsList />} /> {/* NEW ROUTE */}
        <Route path="/contract/:id" element={<ContractDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;