import React, { useState, useEffect } from 'react';

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

  // --- ⚠️ DIQQAT: Render linkini to'g'ri yozamiz ---
  const BACKEND_URL = "https://muxlis-backend-final-3.onrender.com";

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/subjects`);
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error("Fanlarni yuklab bo'lmadi");
    }
  };

  const startTest = async () => {
    if (!studentName || !studentId || !selectedTeacher) {
      return alert("Hamma maydonlarni to'ldiring!");
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/get-teacher-test/${selectedTeacher}`);
      if (res.ok) {
        const data = await res.json();
        setTest(data);
        setIsStarted(true);
      } else {
        alert("Bu ustozda hali test mavjud emas!");
      }
    } catch (err) {
      alert("Testni yuklashda xato!");
    }
  };

  const submitTest = async () => {
    let s = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correct) s++;
    });
    setScore(s);
    setFinished(true);

    const resultData = {
      id: studentId,
      name: studentName,
      score: `${s}/${test.questions.length}`,
      subject: test.subjectName,
      teacher: selectedTeacher
    };

    try {
      await fetch(`${BACKEND_URL}/api/student/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      });
    } catch (err) {
      console.error("Natijani saqlashda xato!");
    }
  };

  if (finished) return <div style={containerStyle}><h2>Imtihon tugadi! Natijangiz: {score}/{test.questions.length}</h2></div>;

  if (isStarted) {
    return (
      <div style={containerStyle}>
        <h2>{test.subjectName} imtihoni</h2>
        {test.questions.map((q, i) => (
          <div key={i} style={cardStyle}>
            <p><b>{i + 1}. {q.text}</b></p>
            {q.options.map((opt, j) => (
              <label key={j} style={{ display: 'block', margin: '5px 0' }}>
                <input type="radio" name={`q${i}`} onChange={() => setAnswers({ ...answers, [i]: j })} /> {opt}
              </label>
            ))}
          </div>
        ))}
        <button onClick={submitTest} style={btnStyle}>TESTNI TUGATISH</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>📝 Imtihon Topshirish</h2>
      <input placeholder="Ism Familiya" style={inpStyle} onChange={e => setStudentName(e.target.value)} />
      <input placeholder="ID / Guruh" style={inpStyle} onChange={e => setStudentId(e.target.value)} />
      <select style={inpStyle} onChange={e => setSelectedTeacher(e.target.value)}>
        <option value="">Ustozni tanlang</option>
        {subjects.map((t, i) => <option key={i} value={t}>{t}</option>)}
      </select>
      <button onClick={startTest} style={btnStyle}>IMTIHONNI BOSHLASH</button>
    </div>
  );
};

const containerStyle = { padding: '50px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial' };
const cardStyle = { background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' };
const inpStyle = { display: 'block', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

export default StudentPanel;