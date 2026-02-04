import React, { useState } from 'react';

const AdminPanel = () => {
  const [results, setResults] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState("");
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', secretCode: '' });

  const [test, setTest] = useState({ 
    subject: '', 
    duration: 30, 
    attempts: 1, 
    questions: [] 
  });

  const [newQ, setNewQ] = useState({ text: '', options: ['', '', '', ''], correct: 0 });

  // BACKEND URL - Faqat asosiy manzil
  const BACKEND_URL = "https://muxlis-backend-final-8.onrender.com";

  // --- NATIJALARNI OLISH ---
  const getStudentResults = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results`);
      if (!res.ok) throw new Error("Ma'lumot olinmadi");
      const data = await res.json();
      const filtered = data.filter(r => r.teacher === user);
      setResults(filtered);
    } catch (err) {
      console.error(err);
      alert("Natijalarni olishda xato!");
    }
  };

  // --- LOGIN / REGISTER ---
  const handleAuth = async () => {
    if (!form.username || !form.password) return alert("Hamma maydonni to'ldiring!");
    
    try {
      const path = mode === 'login' ? '/api/admin/login' : '/api/admin/register';
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: form.username.trim(),
            password: form.password.trim(),
            secretCode: form.secretCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === 'login') { 
          setIsAuth(true); 
          setUser(form.username.trim()); 
        } else { 
          alert("Muvaffaqiyatli ro'yxatdan o'tdingiz!"); 
          setMode('login'); 
        }
      } else { 
        alert(data.message || "Xatolik yuz berdi!"); 
      }
    } catch (err) {
      console.error(err);
      alert("Serverga ulanishda xato! Backend uyg'onishini 1 daqiqa kuting.");
    }
  };

  // --- SAVOL QO'SHISH ---
  const addQuestion = () => {
    if (!newQ.text || newQ.options.some(opt => opt.trim() === "")) {
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
      
      if (res.ok) {
        alert("🚀 Imtihon muvaffaqiyatli saqlandi!");
      } else {
        const errorData = await res.json();
        alert("Xato: " + (errorData.error || "Saqlab bo'lmadi"));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Saqlashda texnik xato! Konsolni tekshiring.");
    }
  };

  // --- STYLES ---
  const sInp = { display: 'block', width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
  const sBtn = { padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' };

  if (!isAuth) {
    return (
      <div style={{textAlign:'center', padding:'50px 20px', fontFamily:'Arial', maxWidth:'400px', margin:'auto'}}>
        <h2>{mode === 'login' ? '🔐 Ustozlar Kirishi' : '📝 Ro\'yxatdan o\'tish'}</h2>
        <input placeholder="Login" style={sInp} onChange={e => setForm({...form, username: e.target.value})} />
        <input type="password" placeholder="Parol" style={sInp} onChange={e => setForm({...form, password: e.target.value})} />
        {mode === 'register' && <input placeholder="Maxfiy kod" style={sInp} onChange={e => setForm({...form, secretCode: e.target.value})} />}
        <button onClick={handleAuth} style={sBtn}>{mode === 'login' ? 'KIRISH' : 'RO\'YXATDAN O\'TISH'}</button>
        <p onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{cursor:'pointer', color:'blue', marginTop:'15px'}}>
          {mode === 'login' ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Kirish"}
        </p>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', maxWidth:'700px', margin:'auto', fontFamily:'Arial'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #3498db', marginBottom:'20px'}}>
        <h2>Ustoz: {user}</h2>
        <button onClick={() => window.location.reload()} style={{...sBtn, width:'auto', background:'#e74c3c'}}>CHIQISH</button>
      </div>
      
      <div style={{background:'#f8f9fa', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
        <h4>⚙️ Imtih


