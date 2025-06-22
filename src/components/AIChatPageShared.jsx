import React, { useState, useEffect } from 'react';
import { callSharedGeminiAPI } from '../config/shared-api';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/AIChatPage.css';

export default function AIChatPageShared() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [usageInfo, setUsageInfo] = useState({ userUsage: 0, dailyUsage: 0 });
  const [envStatus, setEnvStatus] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  // 環境変数の状態をチェック
  useEffect(() => {
    const checkEnvStatus = () => {
      const status = {
        GEMINI_API_KEY: !!import.meta.env.VITE_SHARED_GEMINI_API_KEY,
        ZOOM_CLIENT_ID: !!import.meta.env.VITE_SHARED_ZOOM_CLIENT_ID,
        ZOOM_CLIENT_SECRET: !!import.meta.env.VITE_SHARED_ZOOM_CLIENT_SECRET,
        ZOOM_ACCOUNT_ID: !!import.meta.env.VITE_SHARED_ZOOM_ACCOUNT_ID,
      };
      setEnvStatus(status);
      
      // 環境変数の状態をログ出力
      console.log('Environment Variables Status:', status);
    };
    
    checkEnvStatus();
  }, []);

  // 使用量情報を取得
  const getUsageInfo = () => {
    const userId = user?.uid || 'anonymous';
    const usageKey = `api_usage_${userId}`;
    const dailyKey = `api_usage_${new Date().toDateString()}`;
    
    const userUsage = parseInt(localStorage.getItem(usageKey) || '0');
    const dailyUsage = parseInt(localStorage.getItem(dailyKey) || '0');
    
    setUsageInfo({ userUsage, dailyUsage });
  };

  useEffect(() => {
    getUsageInfo();
  }, [user]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const userId = user?.uid || 'anonymous';
      
      // 環境変数の確認（デバッグ用）
      const geminiKey = import.meta.env.VITE_SHARED_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error('Gemini APIキーが設定されていません。本番環境では環境変数を設定してください。');
      }
      
      const response = await callSharedGeminiAPI(input, userId);
      
      const aiMessage = {
        role: 'ai',
        text: response || 'AIからの返答がありませんでした。'
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // 使用量情報を更新
      getUsageInfo();
    } catch (error) {
      console.error('Gemini APIエラー:', error);
      
      // より詳細なエラーメッセージ
      let errorMessage = 'エラーが発生しました。';
      
      if (error.message.includes('APIキーが設定されていません')) {
        errorMessage = 'APIキーが設定されていません。管理者に連絡してください。';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (error.message.includes('429')) {
        errorMessage = 'API使用量制限に達しました。しばらく待ってから再試行してください。';
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
      <h2>AI相談チャット（共有版）</h2>
      
      {/* 環境変数状態表示 */}
      <div className="env-status" style={{ 
        background: '#f8f9fa', 
        padding: '10px', 
        marginBottom: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>環境変数状態:</div>
        <div>Gemini API: {envStatus.GEMINI_API_KEY ? '✅' : '❌'}</div>
        <div>Zoom Client ID: {envStatus.ZOOM_CLIENT_ID ? '✅' : '❌'}</div>
        <div>Zoom Client Secret: {envStatus.ZOOM_CLIENT_SECRET ? '✅' : '❌'}</div>
        <div>Zoom Account ID: {envStatus.ZOOM_ACCOUNT_ID ? '✅' : '❌'}</div>
        {!envStatus.GEMINI_API_KEY && (
          <div style={{ color: 'red', marginTop: '5px', fontSize: '11px' }}>
            ⚠️ Gemini APIキーが設定されていません。本番環境では環境変数を設定してください。
          </div>
        )}
      </div>
      
      {/* 使用量表示 */}
      <div className="usage-info" style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        marginBottom: '10px', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div>あなたの使用回数: {usageInfo.userUsage}/50</div>
        <div>今日の全体使用回数: {usageInfo.dailyUsage}/1000</div>
        {user && <div>ログイン中: {user.email}</div>}
        {!user && <div>ゲストユーザー（使用量制限があります）</div>}
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
          disabled={usageInfo.userUsage >= 50 || usageInfo.dailyUsage >= 1000}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || usageInfo.userUsage >= 50 || usageInfo.dailyUsage >= 1000}
        >
          {loading ? '送信中...' : '送信'}
        </button>
      </div>
      
      {(usageInfo.userUsage >= 50 || usageInfo.dailyUsage >= 1000) && (
        <div style={{ 
          color: 'red', 
          textAlign: 'center', 
          marginTop: '10px',
          padding: '10px',
          background: '#ffe6e6',
          borderRadius: '5px'
        }}>
          使用量制限に達しました。明日までお待ちください。
        </div>
      )}
    </div>
  );
} 