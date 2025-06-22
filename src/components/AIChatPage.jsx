// components/AIChatPage.jsx
import React, { useState } from 'react';
import '../styles/AIChatPage.css';

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { role: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ask-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput })
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
          <div key={idx} className={`chat-row ${msg.role}`}>
            {msg.role === 'ai' && (
              <img src="/ai-icon.png" alt="AIアイコン" className="chat-avatar" />
            )}
            <div className={`chat-bubble ${msg.role}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-row ai">
            <img src="/ai-icon.png" alt="AIアイコン" className="chat-avatar" />
            <div className="chat-bubble ai">
              <em>AIが考え中です...</em>
            </div>
          </div>
        )}
      </div>

      {/* ▼ form で囲んで onSubmit を使う */}
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="相談内容を入力してください"
        />
        <button type="submit" disabled={loading}>
          {loading ? '送信中...' : '送信'}
        </button>
      </form>
    </div>
  );
}
