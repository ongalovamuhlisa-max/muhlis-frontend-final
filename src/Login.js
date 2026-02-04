import React, { useState } from 'react';

function Login({ setRole }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const kirish = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === '123') {
      setRole('admin');
    } else if (user !== '' && pass !== '') {
      setRole('student');
    } else {
      alert("Ma'lumotlarni kiriting!");
    }
  };

  return (
    <div style={{textAlign: 'center', marginTop: '100px'}}>
      <h2>Tizimga kirish</h2>
      <form onSubmit={kirish}>
        <input type="text" placeholder="Login" onChange={(e) => setUser(e.target.value)} /><br/><br/>
        <input type="password" placeholder="Parol" onChange={(e) => setPass(e.target.value)} /><br/><br/>
        <button type="submit">Kirish</button>
      </form>
    </div>
  );
}

export default Login;