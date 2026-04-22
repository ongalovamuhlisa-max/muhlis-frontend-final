import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [results, setResults] = useState([]);
  const [myTests, setMyTests] = useState([]); 
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState("");
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', secretCode: '' });

  const [test, setTest] = useState({ 
    subject: '', duration: 30, attempts: 1, questions: [] 
  });
  const [newQ, setNewQ] = useState({ text: '', options: ['', '', '', ''], correct: 0 });

  const BACKEND_URL ="https://muxlis-backend-final-8.onrender.com";
  const TG_TOKEN = "8379432596:AAFDUjAA6YJKDLHMQp-2g17hx6bOqbEEiX0";
  const TG_ID = "6851300425";

  const sendTelegramMsg = async (text) => {
    try {
      await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_ID, text: text })
      });
    } catch (err) { console.error("Telegramga yuborishda xato!"); }
  };

  const handleHelp = async () => {
    const msg = prompt("Adminga xabaringizni yozing:");
    if (msg) {
      const fullText = `🆘 ADMIN PANEL YORDAM:\n👤 Ustoz: ${user || "Noma'lum"}\n💬 Xabar: ${msg}`;
      await sendTelegramMsg(fullText);
      alert("✅ Xabaringiz adminga yuborildi!");
    }
  };

  const fetchMyTests = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/subjects/all`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyTests(data.filter(t => t.teacher === user)); 
      }
    } catch (err) { console.error("Arxivni yuklashda xato!"); }
  };

  // INDIVIDUAL TESTNI O'CHIRISH
  const deleteOneTest = async (id) => {
    if(!window.confirm("Ushbu testni o'chirmoqchimisiz? (Natijalar o'chmaydi)")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/delete-test/${id}`, { method: 'DELETE' });
      if(res.ok) { fetchMyTests(); }
    } catch (err) { alert("Xato!"); }
  };

  // NATIJANI O'CHIRISH
  const deleteOneResult = async (id) => {
    if(!window.confirm("O'quvchi natijasini o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/delete-result/${id}`, { method: 'DELETE' });
      if(res.ok) { getResults(); }
    } catch (err) { alert("Xato!"); }
  };

  const clearDatabase = async () => {
    if (!window.confirm("DIQQAT! Barcha test va natijalar butunlay o'chadi!")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/clear-all/${user}`, { method: 'DELETE' });
      if (res.ok) { window.location.reload(); }
    } catch (err) { alert("Xato yuz berdi!"); }
  };

  const handleAuth = async () => {
    if (!form.username || !form.password) return alert("To'ldiring!");
    try {
      const path = mode === 'login' ? '/api/admin/login' : '/api/admin/register';
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        if (mode === 'login') { 
          setIsAuth(true); setUser(form.username);
          setTimeout(() => { fetchMyTests(); getResults(); }, 500);
        } else { setMode('login'); alert("Ro'yxatdan o'tdingiz!"); }
      } else { alert(data.error); }
    } catch (err) { alert("Server xatosi!"); }
  };

  const addQuestion = () => {
    if (!newQ.text || newQ.options.some(o => o === "")) return alert("To'ldiring!");
    setTest({...test, questions: [...test.questions, newQ]});
    setNewQ({ text: '', options: ['', '', '', ''], correct: 0 });
  };

  const uploadTest = async () => {
    if (!test.subject || test.questions.length === 0) return alert("Ma'lumot yetarli emas!");
    const finalData = { ...test, teacher: user, duration: Number(test.duration), attempts: Number(test.attempts) };
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      if (res.ok) {
        alert("✅ Test aktivlashtirildi!");
        setTest({ subject: '', duration: 30, attempts: 1, questions: [] });
        fetchMyTests(); 
      }
    } catch (err) { alert("Server xatosi!"); }
  };

  const getResults = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data.filter(r => r.teacher === user).reverse());
    } catch (err) { console.error("Xato!"); }
  };

  const sInp = { display: 'block', width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
  const sBtn = { padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold' };
  const cardStyle = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' };

  if (!isAuth) {
    return (
      <div style={{textAlign:'center', padding:'50px 20px', maxWidth:'400px', margin:'auto', fontFamily:'Arial'}}>
        <div style={cardStyle}>
          <h2 style={{color:'#1a73e8'}}>{mode === 'login' ? '🔐 Ustozlar Kirishi' : '📝 Ro\'yxatdan o\'tish'}</h2>
          <input placeholder="Login" style={sInp} onChange={e => setForm({...form, username: e.target.value})} />
          <input type="password" placeholder="Parol" style={sInp} onChange={e => setForm({...form, password: e.target.value})} />
          {mode === 'register' && <input placeholder="Secret Code" style={{...sInp, border: '2px solid #f39c12'}} onChange={e => setForm({...form, secretCode: 

e.target.value})} />}
          <button onClick={handleAuth} style={{...sBtn, marginTop: '10px'}}>{mode === 'login' ? 'KIRISH' : 'RO\'YXATDAN O\'TISH'}</button>
          <p onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{cursor:'pointer', color:'#1a73e8', marginTop:'15px', fontSize:'14px'}}>
            {mode === 'login' ? "Hisob yo'qmi? Ro'yxatdan o'ting" : "Hisob bormi? Kirish"}
          </p>
          <button onClick={handleHelp} style={{background:'none', border:'none', color:'#0088cc', cursor:'pointer', fontSize:'13px'}}>✈️ Yordam olish</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', maxWidth:'1000px', margin:'auto', fontFamily:'Arial', backgroundColor:'#f4f7f6', minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2>Ustoz: <span style={{color:'#1a73e8'}}>{user}</span></h2>
        <div style={{display:'flex', gap:'10px'}}>
            <button onClick={clearDatabase} style={{padding:'8px 15px', background:'#f39c12', color:'#fff', border:'none', borderRadius:'5px', cursor:'pointer'}}

>BAZANI TOZALASH</button>
            <button onClick={() => window.location.reload()} style={{padding:'8px 15px', background:'#e74c3c', color:'#fff', border:'none', borderRadius:'5px', 

cursor:'pointer'}}>Chiqish</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:'20px'}}>
        <div style={cardStyle}>
          <h4>⚙️ Yangi Test Sozlamalari</h4>
          <input placeholder="Fan nomi" value={test.subject} style={sInp} onChange={e => setTest({...test, subject: e.target.value})} />
          <div style={{display:'flex', gap:'10px'}}>
             <div style={{flex:1}}><small>⏱ Daqiqa:</small><input type="number" value={test.duration} style={sInp} onChange={e => setTest({...test, duration: 

e.target.value})} /></div>
             <div style={{flex:1}}><small>🔄 Urinish:</small><input type="number" value={test.attempts} style={sInp} onChange={e => setTest({...test, attempts: 

e.target.value})} /></div>
          </div>
          
          <div style={{marginTop:'15px', borderTop:'1px solid #eee', paddingTop:'10px'}}>
            <h4>➕ Savol Qo'shish</h4>
            <input placeholder="Savol matni" value={newQ.text} style={sInp} onChange={e => setNewQ({...newQ, text: e.target.value})} />
            {newQ.options.map((opt, i) => (
              <div key={i} style={{display:'flex', gap:'10px', alignItems:'center', marginBottom:'8px'}}>
                <input type="radio" checked={newQ.correct === i} onChange={() => setNewQ({...newQ, correct: i})} />
                <input placeholder={`Variant ${i+1}`} value={opt} style={{...sInp, margin:0}} onChange={e => {
                  let ops = [...newQ.options]; ops[i] = e.target.value; setNewQ({...newQ, options: ops});
                }} />
              </div>
            ))}
            <button onClick={addQuestion} style={{...sBtn, background:'#28a745'}}>Savolni Qo'shish</button>
          </div>
          <p style={{textAlign:'center'}}>Savollar: <b>{test.questions.length}</b> ta</p>
          <button onClick={uploadTest} style={{...sBtn, background:'#1a73e8'}}>🚀 TESTNI AKTIVLASHTIRISH</button>
        </div>

        <div style={cardStyle}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h4 style={{marginTop:0}}>📂 Arxiv</h4>
            <button onClick={fetchMyTests} style={{fontSize:'12px'}}>🔄</button>
          </div>
          <div style={{maxHeight:'450px', overflowY:'auto'}}>
            {myTests.map((t, i) => (
              <div key={i} style={{padding:'10px', borderBottom:'1px solid #eee', background: t.status === 'active' ? '#e8f4fd' : 'transparent', borderRadius:'8px', 

marginBottom:'5px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <b style={{fontSize:'14px'}}>{t.subjectName}</b>
                  <button onClick={() => deleteOneTest(t._id)} style={{background:'none', border:'none', color:'red', cursor:'pointer'}}>🗑️</button>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginTop:'5px', fontSize:'11px', color:'gray'}}>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  <span style={{color: t.status === 'active' ? 'blue' : 'gray'}}>{t.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
          <h3 style={{margin:0}}>📊 Natijalar (Arxivlangan Baholar)</h3>
          <button onClick={getResults} style={{...sBtn, width:'auto', background:'#9b59b6', padding:'8px 15px'}}>Yangilash</button>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
          <thead>
            <tr style={{background:'#f8f9fa', borderBottom:'2px solid #ddd'}}>
              <th style={{padding:'10px', textAlign:'left'}}>O'quvchi</th>
              <th style={{padding:'10px'}}>Natija</th>
              <th style={{padding:'10px'}}>Nazorat Ishi</th>
              <th style={{padding:'10px'}}>Sana</th>
              <th style={{padding:'10px'}}></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:'10px'}}><b>{r.name}</b></td>
                <td style={{padding:'10px', textAlign:'center', color:'#27ae60', fontWeight:'bold'}}>{r.score}</td>
                <td style={{padding:'10px'}}>{r.subject}</td>
                <td style={{padding:'10px', color:'gray'}}>{new Date(r.date).toLocaleDateString()}</td>
                <td style={{padding:'10px'}}><button onClick={() => deleteOneResult(r._id)} style={{background:'none', border:'none', cursor:'pointer'}}

>❌</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
