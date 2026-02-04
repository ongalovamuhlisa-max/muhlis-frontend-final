import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel'; // ./pages/ olib tashlandi
import StudentPanel from './StudentPanel'; // ./pages/ olib tashlandi

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
