import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './login'; // Adjust path if needed
import SignUp from './signup'; // Adjust path if needed
import Dashboard from './dashboard'; // Adjust path if needed

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<SignUp setToken={setToken} />} />
        <Route path="/dashboard" element={<Dashboard token={token} />} />
      </Routes>
    </div>
  );
}

export default App;