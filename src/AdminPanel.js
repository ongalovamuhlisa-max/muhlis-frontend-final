import React, { useState, useEffect } from 'react';

const StudentPanel = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = 

useState("");
  const [test, setTest] = useState(null);
  const [studentName, setStudentName] = useState

("");
  const [studentId, setStudentId] = useState("");
  const [isStarted, setIsStarted] = useState

(false);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [summary, setSummary] = useState({ correct: 

0, wrong: 0, total: 0 }); // Natija hisoboti uchun

  const BACKEND_URL = "https://muxlis-backend-final-8.onrender.com";

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Taymer mantiqi
  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t 

=> t - 1), 1000);
      return () => clearInterval(timer);
    } else if (isStarted && timeLeft === 0) {
      submitTest(); // Vaqt tugasa avtomat 

topshiradi
    }
  }, [isStarted, timeLeft]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`

${BACKEND_URL}/api/subjects`);
      const data = await res.json();
      setSubjects(data);
    } catch (err) { console.error("Fanlarni yuklab 

bo'lmadi"); }
  };

  const startTest = async () => {
    if (!studentName || !studentId || !

selectedTeacher) return alert("Hamma maydonlarni 

to'ldiring!");

    try {
      // 1. URINISHLARNI TEKSHIRISH
      const resRes = await fetch(`

${BACKEND_URL}/api/admin/results`);
      const allResults = await resRes.json();
      
      // O'quvchi bu ustozda necha marta 

topshirganini sanaymiz
      const myPrevAttempts = allResults.filter(r => 
        (r.id === studentId || r.name.toLowerCase() 

=== studentName.toLowerCase()) && 
        r.teacher === selectedTeacher
      );

      // 2. TEST MA'LUMOTINI OLISH
      const res = await fetch(`

${BACKEND_URL}/api/get-teacher-test/

${selectedTeacher}`);
      if (res.ok) {
        const data = await res.json();

        // Urinishlar sonini tekshirish (Ustoz 

belgilagan attempts bilan)
        if (myPrevAttempts.length >= (data.attempts 

|| 1)) {
          return alert(`Sizda urinishlar qolmagan! 

Maksimal urinishlar soni: ${data.attempts || 1}`);
        }

        setTest(data);
        setTimeLeft(data.duration * 60); 
        setIsStarted(true);
      } else { alert("Bu ustozda hozircha aktiv 

test yo'q!"); }
    } catch (err) { alert("Server bilan ulanishda 

xato!"); }
  };

  const submitTest = async () => {
    if (finished) return; // Ikki marta 

yuborilmasligi uchun

    let s = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correct) s++;
    });

    const totalQuestions = test.questions.length;
    setScore(s);
    setSummary({
        correct: s,
        wrong: totalQuestions - s,
        total: totalQuestions
    });
    setFinished(true);
    setIsStarted(false);

    const resultData = {
      id: studentId,
      name: studentName,
      score: `${s}/${totalQuestions}`, // Avtomatik 

hisoblangan natija
      subject: test.subjectName,
      teacher: selectedTeacher,
      date: new Date().toISOString()
    };

    try {
      await fetch(`

${BACKEND_URL}/api/student/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 

'application/json' },
        body: JSON.stringify(resultData)
      });
    } catch (err) { console.error("Natijani 

saqlashda xato!"); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // TEST TUGAGANDA KO'RINADIGAN OYNA
  if (finished) {
      return (
          <div style={containerStyle}>
              <div style={{...cardStyle, 

textAlign:'center', border:'2px solid #27ae60'}}>
                <h2 style={{color: '#27ae60'}}>🎉 

Imtihon Yakunlandi</h2>
                <hr/>
                <p>O'quvchi: <b>{studentName}

</b></p>
                <p>Fan: <b>{test.subjectName}

</b></p>
                <div style={{margin: '20px 0', 

fontSize: '18px'}}>
                    <p>✅ To'g'ri javob: <span 

style={{color:'green', fontWeight:'bold'}}>

{summary.correct} ta</span></p>
                    <p>❌ Noto'g'ri javob: <span 

style={{color:'red', fontWeight:'bold'}}>

{summary.wrong} ta</span></p>
                    <p>📊 Umumiy natija: <span 

style={{color:'#1a73e8', fontWeight:'bold'}}>

{Math.round((summary.correct / summary.total) * 

100)}%</span></p>
                </div>
                <button onClick={() => 

window.location.reload()} style={btnStyle}>ASOSIY 

SAHIFAGA QAYTISH</button>
              </div>
          </div>
      );
  }

  if (isStarted) {
    return (
      <div style={containerStyle}>
        <div style={{position:'sticky', top:0, 

background:'#fff', padding:'10px', 

borderBottom:'3px solid #e74c3c', zIndex: 100, 

display:'flex', justifyContent:'space-between', 

alignItems:'center'}}>
           <h4 style={{margin:0}}>⏳ Vaqt: <span 

style={{color:'red'}}>{formatTime(timeLeft)}

</span></h4>
           <h4 style={{margin:0}}>Savollar: 

{test.questions.length} ta</h4>
        </div>
        <h2 style={{textAlign:'center', 

color:'#2c3e50'}}>{test.subjectName}</h2>
        {test.questions.map((q, i) => (
          <div key={i} style={cardStyle}>
            <p style={{fontSize:'17px'}}><b>{i + 

1}. {q.text}</b></p>
            {q.options.map((opt, j) => (
              <label key={j} style={{ 
                  display: 'block', 
                  margin: '10px 0', 
                  padding: '10px', 
                  borderRadius: '5px', 
                  background: answers[i] === j ? 

'#d1e7dd' : '#f8f9fa',
                  cursor: 'pointer',
                  border: '1px solid #ddd'
              }}>
                <input type="radio" name={`q${i}`} 

checked={answers[i] === j} onChange={() => 

setAnswers({ ...answers, [i]: j })} style=

{{marginRight: '10px'}} /> 
                {opt}
              </label>
            ))}
          </div>
        ))}
        <button onClick={() => {if(window.confirm

("Testni yakunlashga ishonchingiz komilmi?")) 

submitTest()}} style={{...btnStyle, 

marginTop:'20px', background:'#e67e22'}}>TESTNI 

TUGATISH</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{...cardStyle, boxShadow: '0 4px 

15px rgba(0,0,0,0.1)'}}>
          <h2 style={{textAlign:'center', 

color:'#1a73e8'}}>📝 Imtihon Topshirish</h2>
          <p style={{fontSize:'12px', color:'gray', 

textAlign:'center'}}>Ma'lumotlarni aniq 

kiriting</p>
          <input placeholder="Ism Familiya" style=

{inpStyle} onChange={e => setStudentName

(e.target.value)} />
          <input placeholder="ID / Guruh" style=

{inpStyle} onChange={e => setStudentId

(e.target.value)} />
          <select style={inpStyle} onChange={e => 

setSelectedTeacher(e.target.value)}>
            <option value="">Ustozni 

tanlang</option>
            {subjects.map((t, i) => <option key={i} 

value={t}>{t}</option>)}
          </select>
          <button onClick={startTest} style=

{btnStyle}>IMTIHONNI BOSHLASH</button>
      </div>
    </div>
  );
};

const containerStyle = { padding: '30px 20px', 

maxWidth: '700px', margin: 'auto', fontFamily: 

'Arial', backgroundColor:'#f4f7f6', 

minHeight:'100vh' };
const cardStyle = { background: '#fff', padding: 

'20px', borderRadius: '12px', marginBottom: '15px', 

border: '1px solid #eee', boxShadow: '0 2px 5px 

rgba(0,0,0,0.05)' };
const inpStyle = { display: 'block', width: '100%', 

padding: '12px', marginBottom: '15px', 

borderRadius: '8px', border: '1px solid #ccc', 

boxSizing: 'border-box', fontSize: '15px' };
const btnStyle = { width: '100%', padding: '15px', 

background: '#27ae60', color: 'white', border: 

'none', borderRadius: '8px', cursor: 'pointer', 

fontWeight: 'bold', fontSize: '16px', transition: 

'0.3s' };

export default StudentPanel;
