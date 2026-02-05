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

  const BACKEND_URL = "https://muxlis-backend-final-8.onrender.com";

  // --- 🔔 TELEGRAM SO'ROV (FAQAT TUGMA BOSILGANDA) ---
  const requestSecretCode = () => {
    const name = prompt("Ism va familiyangizni kiriting:");
    const phone = prompt("Telefon raqamingiz:");
    
    if (name && phone) {
      const botToken = "8334455010:AAEmM9zYsPzqxEPgG08wzqEMD0tneVIgWXA"; 
      const chatId = "6851300425"; 
      const message = `🚀 YANGI SO'ROV:\n👤 Ustoz: ${name}\n📞 Tel: ${phone}\n🔑 Kod so'ralmoqda!`;

      fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
        .then(() => alert("So'rov yuborildi! ✅"))
        .catch(() => alert("Xatolik yuz berdi."));
    }
  };

  // --- QALAN QISMLAR (LOGIN VA TEST YARATISH) ---
  const handleAuth = async () => {
    try {
      const path = mode === 'login' ? '/api/admin/login' : '/api/admin/register';
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        if (mode === 'login') { setIsAuth(true); setUser(form.username); }
        else { alert("Muvaffaqiyatli! Endi login qiling."); setMode('login'); }
      } else { alert("Ma'lumotlar xato!"); }
    } catch (err) { alert("Server bilan aloqa yo'q."); }
  };

  const addQuestion = () => {
    if (!newQ.text || newQ.options.some(o => o === "")) return alert("To'ldiring!");
    setTest({...test, questions: [...test.questions, newQ]});
    setNewQ({ text: '', options: ['', '', '', ''], correct: 0 });
  };

  const uploadTest = async () => {
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
      if (res.ok) alert("Saqlandi! 🚀");
    } catch (err) { alert("Xato!"); }
  };

  // --- DIZAYN (STYLE) ---
  const sInp = { display: 'block', width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
  const sBtn = { padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' };

  if (!isAuth) {
    return (
      <div style={{textAlign:'center', padding:'50px 20px', maxWidth:'400px', margin:'auto', fontFamily: 'Arial'}}>
        <h2>{mode === 'login' ? '🔐 Ustozlar Kirishi' : '📝 Ro\'yxatdan o\'tish'}</h2>
        <input placeholder="Login" style={sInp} onChange={e => setForm({...form, username: e.target.value})} />
        <input type="password" placeholder="Parol" style={sInp} onChange={e => setForm({...form, password: e.target.value})} />
        {mode === 'register' && <input placeholder="Maxfiy kod" style={sInp} onChange={e => setForm({...form, secretCode: e.target.value})} />}
        <button onClick={handleAuth} style={sBtn}>{mode === 'login' ? 'KIRISH' : 'SAQLASH'}</button>
        <button onClick={requestSecretCode} style={{...sBtn, background:'#f39c12', marginTop:'10px'}}>🔑 KOD OLISH UCHUN SO'ROV</button>
        <p onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{cursor:'pointer', color:'blue', marginTop:'15px'}}>
          {mode === 'login' ? "Hisob ochish" : "Kirish"}
        </p>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', maxWidth:'700px', margin:'auto', fontFamily:'Arial'}}>
      <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #3498db', marginBottom:'20px'}}>
        <h2>Ustoz: {user}</h2>
        <button onClick={() => window.location.reload()} style={{...sBtn, width:'auto', background:'#e74c3c'}}>CHIQISH</button>
      </div>
      <button onClick={uploadTest} style={sBtn}>🚀 TESTNI SAQLASH ({test.questions.length})</button>
    </div>
  );
};

export default AdminPanel;

