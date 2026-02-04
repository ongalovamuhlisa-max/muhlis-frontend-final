import React, { useState } from 'react';

const AdminPanel = () => {
  const [results, setResults] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState("");
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', secretCode: '' });

  // Imtihon sozlamalari va savollar
  const [test, setTest] = useState({ 
    subject: '', 
    duration: 30, 
    attempts: 1, 
    questions: [] 
  });

  const [newQ, setNewQ] = useState({ text: '', options: ['', '', '', ''], correct: 0 });

  const BACKEND_URL = "https://muxlis-backend-final-3.onrender.com";

  // --- NATIJALARNI OLISH ---
  const getStudentResults = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results`);
      const data = await res.json();
      const filtered = data.filter(r => r.teacher === user);
      setResults(filtered);
    } catch (err) {
      alert("Natijalarni olishda xato bo'ldi!");
    }
  };

  // --- LOGIN / REGISTER ---
  const handleAuth = async () => {
    try {
      const path = mode === 'login' ? '/api/admin/login' : '/api/admin/register';
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        if (mode === 'login') { 
          setIsAuth(true); 
          setUser(form.username); 
        } else { 
          alert("Tayyor! Endi login qiling."); 
          setMode('login'); 
        }
      } else { 
        alert("Xatolik! Login yoki parol xato."); 
      }
    } catch (err) {
      alert("Serverga ulanishda xato!");
    }
  };

  // --- SAVOL QO'SHISH ---
  const addQuestion = () => {
    if (!newQ.text || newQ.options.some(opt => opt === "")) {
      return alert("Savol va hamma variantlarni to'ldiring!");
    }
    setTest({...test, questions: [...test.questions, newQ]});
    setNewQ({ text: '', options: ['', '', '', ''], correct: 0 });
  };

  // --- SERVERGA YUBORISH ---
  const uploadTest = async () => {
    if (test.questions.length === 0 || !test.subject) {
      return alert("Fan nomi va kamida bitta savol bo'lishi shart!");
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teacher: user, 
          questions: test.questions, 
          duration: Number(test.duration), 
          attempts: Number(test.attempts), 
          subjectName: test.subject 
        })
      });
      if (res.ok) alert("🚀 Imtihon muvaffaqiyatli saqlandi!");
    } catch (err) {
      alert("Saqlashda xato!");
    }
  };

  // --- STYLES ---
  const sInp = { display: 'block', width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' };
  const sBtn = { padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };

  if (!isAuth) {
    return (
      <div style={{textAlign:'center', padding:'100px', fontFamily:'Arial'}}>
        <h2>{mode === 'login' ? '🔐 Ustozlar Kirishi' : '📝 Ro\'yxatdan o\'tish'}</h2>
        <input placeholder="Login" style={sInp} onChange={e => setForm({...form, username: e.target.value})} />
        <input type="password" placeholder="Parol" style={sInp} onChange={e => setForm({...form, password: e.target.value})} />
        {mode === 'register' && <input placeholder="Maxfiy kod" style={sInp} onChange={e => setForm({...form, secretCode: e.target.value})} />}
        <button onClick={handleAuth} style={sBtn}>{mode === 'login' ? 'KIRISH' : 'SAQLASH'}</button>
        <p onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{cursor:'pointer', color:'blue', marginTop:'15px'}}>Rejimni almashtirish</p>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', maxWidth:'700px', margin:'auto', fontFamily:'Arial'}}>
      <h2 style={{borderBottom:'2px solid #3498db', paddingBottom:'10px'}}>O'qituvchi: {user}</h2>
      
      <div style={{background:'#f8f9fa', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
        <h4>⚙️ Imtihon Sozlamalari</h4>
        <input placeholder="Fan nomi" style={sInp} onChange={e => setTest({...test, subject: e.target.value})} />
        <div style={{display:'flex', gap:'20px'}}>
          <div style={{flex:1}}>
            <label>⏱ Taymer (minut):</label>
            <input type="number" value={test.duration} style={sInp} onChange={e => setTest({...test, duration: e.target.value})} />
          </div>
          <div style={{flex:1}}>
            <label>🔄 Urinishlar soni:</label>
            <input type="number" value={test.attempts} style={sInp} onChange={e => setTest({...test, attempts: e.target.value})} />
          </div>
        </div>
      </div>

      <div style={{border:'1px solid #ddd', padding:'20px', borderRadius:'10px', background:'#fff'}}>
        <h4>➕ Yangi Savol Qo'shish</h4>
        <input placeholder="Savol matni" value={newQ.text} style={sInp} onChange={e => setNewQ({...newQ, text: e.target.value})} />
        {newQ.options.map((opt, i) => (
          <div key={i} style={{display:'flex', alignItems:'center', marginBottom:'5px'}}>
            <input type="radio" checked={newQ.correct === i} onChange={() => setNewQ({...newQ, correct: i})} />
            <input placeholder={`Variant ${i+1}`} value={opt} style={{...sInp, marginLeft:'10px', flex:1}} onChange={e => {
              let ops = [...newQ.options]; ops[i] = e.target.value; setNewQ({...newQ, options: ops});
            }} />
          </div>
        ))}
        <button onClick={addQuestion} style={{...sBtn, background:'#28a745', width:'100%', marginTop:'10px'}}>SAVOLNI QO'SHISH</button>
      </div>

      <div style={{marginTop:'20px', textAlign:'center'}}>
        <p>Savollar soni: <b>{test.questions.length} ta</b></p>
        <button onClick={uploadTest} style={{...sBtn, background:'#3498db', width:'100%', padding:'15px'}}>🚀 TESTNI SAQLASH</button>
      </div>
    </div>
  );
};

export default AdminPanel;﻿
