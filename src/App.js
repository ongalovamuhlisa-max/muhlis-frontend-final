import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel'; // ./pages/ yo'qoldi, chunki yonma-yon turibdi
import StudentPanel from './StudentPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
