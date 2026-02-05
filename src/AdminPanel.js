import React, { useState, useEffect } from 'react';

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

  // --- TELEGRAM SO'ROV ---
  const requestSecretCode = () => {
    const name = prompt("Ismingizni kiriting:");
    const phone = prompt("Telefon raqamingiz:");
    
    if (name && phone) {
      // O'zingizning TOKEN va ID raqamingizni yozing
      const botToken = "74839...:AAH_..."; 
      const chatId = "123456789"; 
      const message = `🚀 SO'ROV:\n👤 Ustoz: ${name}\n📞 Tel: ${phone}\n🔑 Kod so'ralmoqda!`;

      fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
        .then(() => alert("So'rov yuborildi!"))
        .catch(() => alert("Xatolik bo'ldi."));
    }
  };

  // --- NATIJALAR ---
  const getStudentResults = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results`);
      const data = await res.json();
      const filtered = data.filter(r => r.teacher === user);
      setResults(filtered);
    } catch (err) {
      console.log("Natijalarda xato");
    }
  };

  // --- AUTH ---
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
          alert("Muvaffaqiyatli! Endi kirish qiling."); 
          setMode('login'); 
        }
      } else { 
        alert("Xatolik! Ma'lumotlarni tekshiring."); 
      }
    } catch (err) {
      alert("Server bilan aloqa yo'q.");
    }
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

  const sInp = { display: 'block', width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
  const sBtn = { padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' };

  if (!isAuth) {
    return (
      <div style={{textAlign:'center', padding:'50px 20px', maxWidth:'400px', margin:'auto'}}>
        <h2>{mode === 'login' ? '🔐 Kirish' : '📝 Ro\'yxatdan o\'tish'}</h2>
        <input placeholder="Login" style={sInp} onChange={e => setForm({...form, username: e.target.value})} />
        <input type="password" placeholder="Parol" style={sInp} onChange={e => setForm({...form, password: e.target.value})} />
        {mode === 'register' && <input placeholder="Maxfiy kod" style={sInp} onChange={e => setForm({...form, secretCode: e.target.value})} />}
        <button onClick={handleAuth} style={sBtn}>{mode === 'login' ? 'KIRISH' : 'RO\'YXATDAN O\'TISH'}</button>
        
        <button onClick={requestSecretCode} style={{...sBtn, background:'#f39c12', marginTop:'10px'}}>🔑 KOD SO'RASH</button>
        
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

      <div style={{background:'#f8f9fa', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
        <input placeholder="Fan nomi" style={sInp} onChange={e => setTest({...test, subject: e.target.value})} />
        <div style={{display:'flex', gap:'10px'}}>
          <input type="number" placeholder="Vaqt" style={sInp} onChange={e => setTest({...test, duration: e.target.value})} />
          <input type="number" placeholder="Urinishlar" style={sInp} onChange={e => setTest({...test, attempts: e.target.value})} />
        </div>
      </div>

      <div style={{border:'1px solid #ddd', padding:'15px', borderRadius:'10px'}}>
        <input placeholder="Savol" value={newQ.text} style={sInp} onChange={e => setNewQ({...newQ, text: e.target.value})} />
        {newQ.options.map((opt, i) => (
          <div key={i} style={{display:'flex', marginBottom:'5px'}}>
            <input type="radio" checked={newQ.correct === i} onChange={() => setNewQ({...newQ, correct: i})} />
            <input placeholder={`Variant ${i+1}`} value={opt} style={{...sInp, marginLeft:'5px'}} onChange={e => {
              let ops = [...newQ.options]; ops[i] = e.target.value; setNewQ({...newQ, options: ops});
            }} />
          </div>
        ))}
        <button onClick={addQuestion} style={{...sBtn, background:'#28a745'}}>+ SAVOL</button>
      </div>

      <button onClick={uploadTest} style={{...sBtn, marginTop:'20px', padding:'15px'}}>🚀 TESTNI SAQLASH ({test.questions.length})</button>
      
      <div style={{marginTop:'30px'}}>
         <button onClick={getStudentResults} style={{...sBtn, background:'#9b59b6'}}>📊 NATIJALAR</button>
         {results.length > 0 && (
           <table style={{width:'100%', marginTop:'10px'}} border="1">
             <thead><tr><th>O'quvchi</th><th>Ball</th></tr></thead>
             <tbody>
               {results.map((r, i) => <tr key={i}><td>{r.name}</td><td>{r.score}</td></tr>)}
             </tbody>
           </table>
         )}
      </div>
    </div>
  );
};

export default AdminPanel;
