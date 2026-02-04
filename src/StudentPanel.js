import React, { useState, useEffect, useRef } from 'react';

const StudentPanel = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [test, setTest] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const BACKEND_URL = "https://muxlis-backend-final-8.onrender.com";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => console.log("Xato: Backend uxlab yotibdi"));
  }, []);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted) {
      submitTest(); 
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, timeLeft]);

  const startTest = async () => {
    if (!studentName || !studentId || !selectedTeacher) return alert("Ma'lumotlarni to'ldiring!");
    
    try {
      // Avval o'quvchi bu testni topshirganmi yoki yo'qligini tekshirish
      const checkRes = await fetch(`${BACKEND_URL}/api/admin/results`);
      const allResults = await checkRes.json();
      const alreadyDone = allResults.find(r => r.studentId === studentId && r.teacher === selectedTeacher);

      if (alreadyDone) {
         return alert("Siz bu testni topshirib bo'lgansiz! Ustozingiz natijangizni o'chirmaguncha qayta kira olmaysiz.");
      }

      const res = await fetch(`${BACKEND_URL}/api/get-teacher-test/${selectedTeacher}`);
      if (res.ok) {
        const data = await res.json();
        setTest(data);
        setTimeLeft(data.duration * 60); 
        setIsStarted(true);
      } else {
        alert("Bu ustozda hali test mavjud emas!");
      }
    } catch (err) {
      alert("Serverga ulanishda xato! Backend uyg'onishini kuting.");
    }
  };

  const submitTest = async () => {
    clearInterval(timerRef.current);
    let s = 0;

    test.questions.forEach((q, i) => {
      // 🔥 MUHIM O'ZGARIŞ: Javobni indeks emas, matn sifatida solishtiramiz
      // Radio tanlangan bo'lsa indeks keladi, lekin biz uni variant matni bilan solishtiramiz
      const selectedIndex = answers[i]; 
      const selectedText = q.options[selectedIndex];
      const correctIndex = q.correct;
      
      // Agar tanlangan variant indeksi to'g'ri javob indeksiga teng bo'lsa
      if (selectedIndex !== undefined && selectedIndex === correctIndex) {
        s++;
      }
    });

    setScore(s);
    setFinished(true);
    setIsStarted(false);

    try {
      await fetch(`${BACKEND_URL}/api/student/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId, // Backendda 'studentId' deb nomlangan bo'lishi kerak
          name: studentName,
          score: s, // Faqat raqam yuboramiz (masalan: 5)
          subject: test.subjectName,
          teacher: selectedTeacher
        })
      });
    } catch (err) { console.log("Natija bazaga saqlanmadi"); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const containerStyle = { padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial' };
  const cardStyle = { background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
  const inpStyle = { display: 'block', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
  const btnStyle = { width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };

  if (finished) {
    return (
      <div style={containerStyle}>
        <div style={{textAlign: 'center', background: '#fff', padding: '40px 20px', borderRadius: '15px', border: '2px solid #27ae60', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}>
          <h1 style={{fontSize: '50px'}}>🏁</h1>
          <h2>Imtihon tugadi!</h2>
          <div style={{fontSize: '24px', margin: '20px 0'}}>
            Sizning natijangiz: <b style={{color: '#27ae60'}}>{score} / {test.questions.length}</b>
          </div>
          <p style={{color: '#7f8c8d'}}>Natijangiz saqlandi. Ustozingiz natijani o'chirsagina qayta topshira olasiz.</p>
          <button onClick={() => window.location.reload()} style={{...btnStyle, background: '#3498db', marginTop: '20px'}}>BOSH SAHIFA</button>
        </div>
      </div>
    );
  }

  if (isStarted && test) {
    return (
      <div style={containerStyle}>
        <div style={{position: 'sticky', top: '0', background: '#fff', padding: '15px', borderBottom: '3px solid #e74c3c', display: 'flex', justifyContent: 'space-between', zIndex: '100', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
          <b style={{fontSize: '18px'}}>{test.subjectName}</b>
          <b style={{color: '#e74c3c', fontSize: '18px'}}>⏱ Vaqt: {formatTime(timeLeft)}</b>
        </div>
        <div style={{marginTop: '20px'}}>
            {test.questions.map((q, i) => (
            <div key={i} style={cardStyle}>
                <p style={{fontSize: '17px', lineHeight: '1.4'}}><b>{i + 1}. {q.text}</b></p>
                {q.options.map((opt, j) => (
                <label key={j} style={{ display: 'flex', alignItems: 'center', margin: '12px 0', cursor: 'pointer', padding: '8px', borderRadius: '5px', background: answers[i] === j ? '#e8f6ed' : 'transparent' }}>
                    <input type="radio" name={`q${i}`} style={{width: '20px', height: '20px', marginRight: '12px'}} onChange={() => setAnswers({ ...answers, [i]: j })} /> 
                    <span style={{fontSize: '16px'}}>{opt}</span>
                </label>
                ))}
            </div>
            ))}
        </div>
        <button onClick={submitTest} style={{...btnStyle, marginTop: '20px', background: '#2c3e50'}}>TESTNI YAKUNLASH</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', border: '1px solid #eee'}}>
        <h2 style={{textAlign: 'center', color: '#2c3e50', marginBottom: '25px'}}>📝 Imtihon Tizimi</h2>
        <label>Ism va Familiyangiz:</label>
        <input placeholder="Masalan: Ali Valiyev" style={inpStyle} onChange={e => setStudentName(e.target.value)} />
        <label>ID yoki Guruh:</label>
        <input placeholder="Masalan: 101-guruh" style={inpStyle} onChange={e => setStudentId(e.target.value)} />
        <label>Ustozingizni tanlang:</label>
        <select style={inpStyle} onChange={e => setSelectedTeacher(e.target.value)}>
          <option value="">-- Tanlang --</option>
          {subjects.length > 0 ? subjects.map((t, i) => <option key={i} value={t}>{t}</option>) : <option>Yuklanmoqda...</option>}
        </select>
        <button onClick={startTest} style={btnStyle}>IMTIHONNI BOSHLASH</button>
        <p style={{fontSize: '12px', color: '#95a5a6', marginTop: '15px', textAlign: 'center'}}>Eslatma: Kirishda biroz kutishingizga to'g'ri kelishi mumkin.</p>
      </div>
    </div>
  );
};

export default StudentPanel;
