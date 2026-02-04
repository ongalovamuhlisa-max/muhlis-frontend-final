import React, { useState } from 'react';
import AdminPanel from './pages/AdminPanel';
import StudentPanel from './pages/StudentPanel';

function App() {
  const [role, setRole] = useState('guest'); // guest, admin, student
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');

  const adminParol = "admin777"; // Buni o'zingizga moslang

  const adminKirish = () => {
    if (passInput === adminParol) {
      setRole('admin');
    } else {
      alert("Admin paroli noto'g'ri!");
    }
  };

  const studentKirish = () => {
    if (loginInput.trim().length > 3) {
      // O'quvchi ID-sini saqlaymiz, shunda testni uning nomidan yozamiz
      localStorage.setItem('current_student', loginInput);
      setRole('student');
    } else {
      alert("Iltimos, ismingizni yoki ID raqamingizni to'liq kiriting!");
    }
  };

  if (role === 'admin') return <AdminPanel setRole={setRole} />;
  if (role === 'student') return <StudentPanel setRole={setRole} />;

  return (
    <div style={st.container}>
      <h1 style={{color: '#1a73e8'}}>📚 Online Imtihon Tizimi</h1>
      
      <div style={st.card}>
        <h3>👨‍🎓 O'quvchi bo'lib kirish</h3>
        <input 
          placeholder="Ismingiz yoki ID raqamingiz" 
          value={loginInput}
          onChange={(e) => setLoginInput(e.target.value)}
          style={st.input}
        />
        <button onClick={studentKirish} style={st.btnBlue}>Testni boshlash</button>
      </div>

      <div style={{...st.card, marginTop: '20px', backgroundColor: '#fff3e0'}}>
        <h3>🔐 Admin kirish</h3>
        <input 
          type="password"
          placeholder="Admin paroli" 
          value={passInput}
          onChange={(e) => setPassInput(e.target.value)}
          style={st.input}
        />
        <button onClick={adminKirish} style={st.btnBlack}>Panelga kirish</button>
      </div>
    </div>
  );
}

const st = {
  container: { textAlign: 'center', padding: '50px', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh' },
  card: { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'inline-block', width: '350px' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
  btnBlue: { width: '100%', padding: '12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnBlack: { width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default App;