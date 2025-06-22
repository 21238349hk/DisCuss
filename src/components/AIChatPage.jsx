import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import '../styles/AIChatPage.css';

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('consult'); 
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const endpoint = mode === 'gd' ? '/api/ask-gemini-gd' : '/api/ask-gemini';
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput })
      });

      const data = await res.json();

      if (mode === 'gd') {
        const aiMessages = data.replies || [];
        setMessages((prev) => [...prev, ...aiMessages]);
      } else {
        const aiMessage = {
          role: 'ai',
          text: data.reply || 'AIからの返答がありませんでした。'
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

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

  const handleModeToggle = () => {
    const newMode = mode === 'consult' ? 'gd' : 'consult';
    setMode(newMode);
    setMessages([]); 
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <h2 className="chat-title">{mode === 'gd' ? 'AIGD' : 'AI相談'}</h2>
        <button className="aigd-mode" onClick={handleModeToggle}>
          {mode === 'gd' ? '相談モードに切替' : 'AIGDモードに切替'}
        </button>
      </div>

      <div className="chat-box">
{messages.map((msg, idx) => (
  <div key={idx} className={`chat-row ${msg.role}`}>
    {(msg.role === 'ai' || msg.role === 'ai1' || msg.role === 'ai2') && (
      <img
        src={
          msg.role === 'ai1'
            ? '/ai1-icon.png'
            : msg.role === 'ai2'
            ? '/ai2-icon.png'
            : '/ai-icon.png'
        }
        alt="AIアイコン"
        className="chat-avatar"
      />
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
