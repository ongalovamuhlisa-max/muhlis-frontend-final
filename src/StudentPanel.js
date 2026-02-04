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
      .catch(() => console.log("Xato"));
  }, []);

  // Taymer logikasi
  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted) {
      submitTest(); // Vaqt tugasa avtomatik topshirish
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, timeLeft]);

  const startTest = async () => {
    if (!studentName || !studentId || !selectedTeacher) return alert("Ma'lumotlarni to'ldiring!");
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/get-teacher-test/${selectedTeacher}`);
      if (res.ok) {
        const data = await res.json();
        setTest(data);
        setTimeLeft(data.duration * 60); // Minutni sekundga o'tkazish
        setIsStarted(true);
      } else {
        alert("Test topilmadi!");
      }
    } catch (err) {
      alert("Xato yuz berdi!");
    }
  };

  const submitTest = async () => {
    clearInterval(timerRef.current);
    let s = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correct) s++;
    });
    setScore(s);
    setFinished(true);
    setIsStarted(false);

    try {
      await fetch(`${BACKEND_URL}/api/student/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studentId,
          name: studentName,
          score: `${s}/${test.questions.length}`,
          subject: test.subjectName,
          teacher: selectedTeacher
        })
      });
    } catch (err) { console.log("Natija saqlanmadi"); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const containerStyle = { padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial' };
  const cardStyle = { background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' };
  const inpStyle = { display: 'block', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' };
  const btnStyle = { width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

  if (finished) {
    return (
      <div style={containerStyle}>
        <div style={{textAlign: 'center', background: '#fff', padding: '30px', borderRadius: '15px', border: '2px solid #27ae60'}}>
          <h2>🏁 Imtihon tugadi!</h2>
          <h3>Natijangiz: {score} / {test.questions.length}</h3>
          {/* Agar admin 1 tadan ko'p urinish bergan bo'lsa tugma chiqadi, bo'lmasa yo'q */}
          {test.attempts > 1 ? (
            <button onClick={() => window.location.reload()} style={{...btnStyle, background: '#3498db', marginTop: '20px'}}>QAYTA TOPSHIRISH</button>
          ) : (
            <p style={{color: 'red', marginTop: '20px'}}>⚠️ Bu testni qayta topshirishga ruxsat yo'q.</p>
          )}
        </div>
      </div>
    );
  }

  if (isStarted && test) {
    return (
      <div style={containerStyle}>
        <div style={{position: 'sticky', top: '0', background: '#fff', padding: '10px', borderBottom: '2px solid #e74c3c', display: 'flex', justifyContent: 'space-between', zIndex: '100'}}>
          <b style={{fontSize: '18px'}}>{test.subjectName}</b>
          <b style={{color: '#e74c3c', fontSize: '18px'}}>⏱ Vaqt: {formatTime(timeLeft)}</b>
        </div>
        {test.questions.map((q, i) => (
          <div key={i} style={cardStyle}>
            <p><b>{i + 1}. {q.text}</b></p>
            {q.options.map((opt, j) => (
              <label key={j} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                <input type="radio" name={`q${i}`} style={{marginRight: '10px'}} onChange={() => setAnswers({ ...answers, [i]: j })} /> {opt}
              </label>
            ))}
          </div>
        ))}
        <button onClick={submitTest} style={btnStyle}>TESTNI YAKUNLASH</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
        <h2 style={{textAlign: 'center'}}>📝 Imtihon Topshirish</h2>
        <input placeholder="Ism Familiya" style={inpStyle} onChange={e => setStudentName(e.target.value)} />
        <input placeholder="ID / Guruh" style={inpStyle} onChange={e => setStudentId(e.target.value)} />
        <select style={inpStyle} onChange={e => setSelectedTeacher(e.target.value)}>
          <option value="">Ustozni tanlang</option>
          {subjects.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>
        <button onClick={startTest} style={btnStyle}>IMTIHONNI BOSHLASH</button>
      </div>
    </div>
  );
};

export default StudentPanel;
