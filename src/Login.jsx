// src/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("ログイン成功！");
      navigate('/home');
    } catch (error) {
      alert("ログイン失敗: " + error.message);
    }
  };

  return (
    <div>
      <h2>ログイン</h2>
      <input type="email" placeholder="メールアドレス" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="パスワード" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
};

export default Login;
