// components/AIChatPage.jsx
import React, { useState } from 'react';
import '../styles/AIChatPage.css';

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    // 仮のAI応答（後でGemini APIに置き換える）
    const aiResponse = {
      role: 'ai',
      text: 'ご相談ありがとうございます。どんなことでお困りですか？'
    };
    setMessages((prev) => [...prev, aiResponse]);
    setInput('');
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
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="相談内容を入力してください"
        />
        <button onClick={handleSend}>送信</button>
      </div>
    </div>
  );
}
