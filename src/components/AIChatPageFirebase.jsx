import React, { useState, useEffect } from 'react';
import { callFirebaseGeminiAPI } from '../config/firebase-api';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/AIChatPage.css';

export default function AIChatPageFirebase() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const userId = user?.uid || 'anonymous';
      const response = await callFirebaseGeminiAPI(input, userId);
      
      const aiMessage = {
        role: 'ai',
        text: response || 'AIからの返答がありませんでした。'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Firebase Gemini APIエラー:', error);
      
      let errorMessage = 'エラーが発生しました。';
      
      if (error.message.includes('API呼び出しに失敗しました')) {
        errorMessage = 'Firebase Functionsの設定を確認してください。';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'ネットワークエラーが発生しました。';
      } else {
        errorMessage = `エラーが発生しました: ${error.message}`;
      }
      
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: errorMessage }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <h2>AI相談チャット（Firebase版）</h2>
      
      <div style={{ 
        background: '#e3f2fd', 
        padding: '10px', 
        marginBottom: '10px', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div>✅ Firebase Functionsを使用</div>
        <div>✅ CORS問題なし</div>
        <div>✅ セキュアなAPI呼び出し</div>
        {user && <div>ログイン中: {user.email}</div>}
        {!user && <div>ゲストユーザー</div>}
      </div>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'あなた' : 'AI'}:</strong> {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chat-message ai">
            <em>AIが考え中です...</em>
          </div>
        )}
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="相談内容を入力してください"
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? '送信中...' : '送信'}
        </button>
      </div>
    </div>
  );
} 