// components/AIChatPage.jsx
import React, { useState } from 'react';
import '../styles/AIChatPage.css';

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ask-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      const aiMessage = {
        role: 'ai',
        text: data.reply || 'AIからの返答がありませんでした。'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Gemini APIエラー:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'エラーが発生しました。時間をおいて再試行してください。' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <h2>AI相談チャット</h2>
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
