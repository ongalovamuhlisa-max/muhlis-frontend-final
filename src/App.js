import React, { useState } from 'react';
// Fayllar 'src' ichida bo'lgani uchun './pages/' qismi olib tashlandi
import AdminPanel from './AdminPanel';
import StudentPanel from './StudentPanel';

const App = () => {
  const [role, setRole] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');

  const adminParol = "1234"; // Xohlasangiz o'zgartiring

  const adminKirish = () => {
    if (passInput === adminParol) {
      setRole('admin');
    } else {
      alert("Admin paroli noto'g'ri!");
    }
  };

  const studentKirish = () => {
    if (loginInput.trim().length > 3) {
      localStorage.setItem('current_student', loginInput);
      setRole('student');
    } else {
      alert("Iltimos, ismingizni yoki ID raqamingizni to'liq kiriting!");
    }
  };

  // Panellarga o'tish
  if (role === 'admin') return <AdminPanel setRole={setRole} />;
  if (role === 'student') return <StudentPanel setRole={setRole} />;

  return (
    <div style={st.container}>
      <h1 style={{ color: '#1a73e8', marginBottom: '30px' }}>📚 Online Imtihon Tizimi</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* O'quvchi kartasi */}
        <div style={st.card}>
          <h3 style={{ marginTop: 0 }}>👨‍🎓 O'quvchi bo'lib kirish</h3>
          <input
            placeholder="Ismingiz yoki ID raqamingiz"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            style={st.input}
          />
          <button onClick={studentKirish} style={st.btnBlue}>
            Testni boshlash
          </button>
        </div>

        {/* Admin kartasi */}
        <div style={{ ...st.card, backgroundColor: '#fff3e0' }}>
          <h3 style={{ marginTop: 0 }}>🔐 Admin kirish</h3>
          <input
            type="password"
            placeholder="Admin paroli"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            style={st.input}
          />
          <button onClick={adminKirish} style={st.btnBlack}>
            Panelga kirish
          </button>
        </div>

      </div>
    </div>
  );
};

const st = {
  container: {
    textAlign: 'center',
    padding: '50px 20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh'
  },
  card: {
    background: 'white',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    width: '350px',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: '16px'
  },
  btnBlue: {
    width: '100%',
    padding: '12px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  btnBlack: {
    width: '100%',
    padding: '12px',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  }
};

export default App;
