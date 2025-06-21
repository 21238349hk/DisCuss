// src/Signup.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("登録成功！");
      navigate('/home');
    } catch (error) {
      alert("登録失敗: " + error.message);
    }
  };

  return (
    <div>
      <h2>新規登録</h2>
      <input type="email" placeholder="メールアドレス" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="パスワード" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignup}>登録</button>
    </div>
  );
};

export default Signup;
