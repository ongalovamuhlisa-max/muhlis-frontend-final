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

  // --- NATIJALARNI OLISH (useEffect bilan avtomatlashtirildi) ---
  useEffect(() => {
    if (isAuth) {
      getStudentResults();
    }
  }, [isAuth]);

  const getStudentResults = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results`);
      if (!res.ok) throw new Error("Ma'lumot olinmadi");
      const data = await res.json();
      // Faqat shu ustozga tegishli natijalarni filtrlash
      const filtered = data.filter(r => r.teacher === user);
      setResults(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  // --- NATIJANI O'CHIRISH (Qayta topshirishga ruxsat berish) ---
  const deleteResult = async (id) => {
    if (!window.confirm("Ushbu o'quvchi natijasini o'chirmoqchimisiz? Bu unga qayta topshirish imkonini beradi.")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert("Natija o'chirildi. O'quvchi endi qayta topshira oladi.");
        getStudentResults(); // Jadvalni yangilash
      } else {
        alert("O'chirishda xato yuz berdi");
      }
    } catch (err) {
      alert("Server bilan ulanishda xato");
    }
  };

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
      alert("Serverga ulanishda xato!");
    }
  };

  const addQuestion = () => {
    if (!newQ.text || newQ.options.some(opt => opt.trim() === "")) {
      return alert("Savol va hamma variantlarni to'ldiring!");
    }
    setTest({...test, questions: [...test.questions, newQ]});
    setNewQ({ text: '', options: ['', '', '', ''], correct: 0 });
  };

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
      alert("Saqlashda texnik xato!");
    }
  };

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
    <div style={{padding:'20px', maxWidth:'800px', margin:'auto', fontFamily:'Arial'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #3498db', marginBottom:'20px'}}>
        <h2>Ustoz: {user}</h2>
        <button onClick={() => window.location.reload()} style={{...sBtn, width:'auto', background:'#e74c3c'}}>CHIQISH</button>
      </div>
      
      <div style={{background:'#f8f9fa', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
        <h4>⚙️ Imtihon Sozmalari</h4>
        <input placeholder="Fan nomi" style={sInp} onChange={e => setTest({...test, subject: e.target.value})} />
        <div style={{display:'flex', gap:'20px'}}>
          <div style={{flex:1}}><label>⏱ Taymer (min):</label><input type="number" value={test.duration} style={sInp} onChange={e => setTest({...test, duration: e.target.value})} /></div>
          <div style={{flex:1}}><label>🔄 Urinishlar:</label><input type="number" value={test.attempts} style={sInp} onChange={e => setTest({...test, attempts: e.target.value})} /></div>
        </div>
      </div>

      <div style={{border:'1px solid #ddd', padding:'20px', borderRadius:'10px', background:'#fff', marginBottom: '30px'}}>
        <h4>➕ Yangi Savol Qo'shish</h4>
        <input placeholder="Savol matni" value={newQ.text} style={sInp} onChange={e => setNewQ({...newQ, text: e.target.value})} />
        {newQ.options.map((opt, i) => (
          <div key={i} style={{display:'flex', alignItems:'center', marginBottom:'5px'}}>
            <input type="radio" name="correct" checked={newQ.correct === i} onChange={() => setNewQ({...newQ, correct: i})} />
            <input placeholder={`Variant ${i+1}`} value={opt} style={{...sInp, marginLeft:'10px', flex:1}} onChange={e => {
              let ops = [...newQ.options]; ops[i] = e.target.value; setNewQ({...newQ, options: ops});
            }} />
          </div>
        ))}
        <button onClick={addQuestion} style={{...sBtn, background:'#28a745', marginTop:'10px'}}>SAVOLNI QO'SHISH</button>
      </div>

      <div style={{textAlign:'center', background: '#e9ecef', padding: '15px', borderRadius: '10px', marginBottom:'40px'}}>
        <p>Savollar soni: <b>{test.questions.length} ta</b></p>
        <button onClick={uploadTest} style={{...sBtn, background:'#3498db', padding:'15px', fontSize: '18px'}}>🚀 TESTNI SAQLASH</button>
      </div>

      <hr />

      {/* --- NATIJALAR JADVALI --- */}
      <div style={{marginTop:'40px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>📊 O'quvchilar Natijalari</h3>
            <button onClick={getStudentResults} style={{...sBtn, width:'auto', background:'#9b59b6'}}>YANGILASH</button>
        </div>
        <table border="1" style={{width:'100%', marginTop:'10px', borderCollapse:'collapse', textAlign:'center'}}>
          <thead style={{background:'#3498db', color:'white'}}>
            <tr>
              <th style={{padding:'10px'}}>O'quvchi</th>
              <th>ID</th>
              <th>Ball</th>
              <th>Fan</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? results.map((r) => (
              <tr key={
