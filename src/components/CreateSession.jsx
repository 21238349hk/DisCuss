// frontend/src/components/SessionCreateForm.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/SessionCreateForm.css';

function SessionCreateForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discussion_theme: '',
    difficulty: '',
    session_date: '',
    start_time: '',
    duration_minutes: 40,
    max_participants: 6,
    meeting_method: 'オンライン',
    zoom_link: '',
  });
  const [message, setMessage] = useState('');
<<<<<<< Updated upstream
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
=======
  const [error, setError] = useState('');
  const [isIssuingUrl, setIsIssuingUrl] = useState(false); // URL発行中の状態
>>>>>>> Stashed changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleIssueZoomUrl = async () => {
    setIsIssuingUrl(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/create-zoom-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: formData.title || '新しいセッション' }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Zoom URLの発行に失敗しました。');
      }

      const data = await response.json();
      setFormData(prevData => ({
        ...prevData,
        zoom_link: data.join_url
      }));
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsIssuingUrl(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    if (!user) {
      setError("セッションを作成するにはログインが必要です。");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setMessage('');
    setError(null);
    setShowConfirmation(false);

    if (!user) {
      setError("セッションを作成するにはログインが必要です。");
      return;
    }

    try {
      const sessionsCollectionRef = collection(db, 'sessions');

      const sessionDataToSave = {
        title: formData.title,
        description: formData.description,
        discussion_theme: formData.discussion_theme,
        difficulty: formData.difficulty,
        session_datetime: new Date(`${formData.session_date}T${formData.start_time}`),
        duration_minutes: Number(formData.duration_minutes),
        max_participants: Number(formData.max_participants),
        meeting_method: formData.meeting_method,
        zoom_link: formData.meeting_method === 'オンライン' ? formData.zoom_link : null,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        userEmail: user.email, // ★ ここを追加：ユーザーのGmailアドレスを保存
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(sessionsCollectionRef, sessionDataToSave);
      setMessage(`セッションが正常に作成されました。ドキュメントID: ${docRef.id}`);
      setFormData({
        title: '', description: '', discussion_theme: '', difficulty: '',
        session_date: '', start_time: '', duration_minutes: 40, max_participants: 6,
        meeting_method: 'オンライン', zoom_link: '',
      });

    } catch (err) {
      console.error("セッションの保存中にエラーが発生しました:", err);
      setError(`セッションの保存に失敗しました: ${err.message}`);
    }
  };

<<<<<<< Updated upstream
  const handleCancel = () => {
    setShowConfirmation(false);
    setMessage('');
    setError(null);
  };

  return (
    <div className="session-form-container">
      <h1>新しいGDセッションを作成</h1>
      <p className="form-description">他の就活生と一緒に学べるセッションを企画しましょう</p>

      {user ? (
        <p className="login-status">ログイン中: {user.displayName || user.email}</p>
      ) : (
        <p className="login-status-warning">セッションを作成するにはログインが必要です。 (ダッシュボードなどからログインしてください)</p>
      )}

      <div className="form-section">
        <h2 className="section-title">基本情報</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>セッションタイトル*:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="例: 金融業界志望者向けGD" />
          </div>
          <div>
            <label>セッション説明*:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="セッションの目的や内容について詳しく説明してください..." rows="5"></textarea>
          </div>
          <div>
            <label>ディスカッションテーマ*:</label>
            <input type="text" name="discussion_theme" value={formData.discussion_theme} onChange={handleChange} required placeholder="例: 新規事業立案" />
          </div>
          <div className="form-row">
            <div>
              <label>難易度:</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="">選択してください</option>
                <option value="初級">初級</option>
                <option value="中級">中級 (ある程度の経験あり)</option>
                <option value="上級">上級</option>
              </select>
            </div>
          </div>
          <div>
            <label>開催日*:</label>
            <input type="date" name="session_date" value={formData.session_date} onChange={handleChange} required />
          </div>
          <div>
            <label>開始時間*:</label>
            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
          </div>
          <div>
            <label>所要時間 (分)*:</label>
            <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required min={5} max={40} />
          </div>
          <div>
            <label>最大参加者数*:</label>
            <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} required />
          </div>
          <div>
            <label>開催方式*:</label>
            <select name="meeting_method" value={formData.meeting_method} onChange={handleChange} required>
              <option value="オンライン">オンライン</option>
              <option value="対面">対面</option>
            </select>
          </div>
          {formData.meeting_method === 'オンライン' && (
            <div>
              <label>Zoom招待リンク:</label>
              <input type="url" name="zoom_link" value={formData.zoom_link} onChange={handleChange} placeholder="https://zoom.us/j/..." />
            </div>
          )}

          <button type="submit" disabled={!user}>セッションを保存</button>
        </form>
      </div>
=======
  return (
    <div>
      <h1>セッション作成</h1>
      <form onSubmit={handleSubmit}>
        {/* 既存のフォーム要素 (ファイルアップロード欄は削除) */}
        <div>
          <label>セッションタイトル*:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>セッション説明*:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
        </div>
        <div>
          <label>ディスカッションテーマ:</label>
          <input type="text" name="discussion_theme" value={formData.discussion_theme} onChange={handleChange} />
        </div>
        <div>
          <label>難易度:</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
            <option value="">選択してください</option>
            <option value="初級">初級</option>
            <option value="中級">中級</option>
            <option value="上級">上級</option>
          </select>
        </div>
        <div>
          <label>開催日*:</label>
          <input type="date" name="session_date" value={formData.session_date} onChange={handleChange} required />
        </div>
        <div>
          <label>開始時間*:</label>
          <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
        </div>
        <div>
          <label>所要時間 (分)*:</label>
          <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required />
        </div>
        <div>
          <label>最大参加者数*:</label>
          <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} required />
        </div>
        <div>
          <label>開催方式*:</label>
          <select name="meeting_method" value={formData.meeting_method} onChange={handleChange} required>
            <option value="オンライン">オンライン</option>
            <option value="対面">対面</option>
          </select>
        </div>
        {formData.meeting_method === 'オンライン' && (
          <div>
            <label>Zoom招待リンク:</label>
            <input type="url" name="zoom_link" value={formData.zoom_link} onChange={handleChange} placeholder="https://zoom.us/j/..." />
            <button
              type="button"
              onClick={handleIssueZoomUrl}
              disabled={isIssuingUrl}
              style={{ marginLeft: '10px' }}
            >
              {isIssuingUrl ? '発行中...' : 'Zoom URLを即時発行'}
            </button>
          </div>
        )}
        {/* ★ 削除: ファイルアップロード用の入力フィールドは含めない */}
>>>>>>> Stashed changes

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 確認モーダル */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal-content">
            <h2>入力内容の確認</h2>
            <p>以下の内容でセッションを作成します。よろしいですか？</p>
            <div className="confirmation-details">
              <p><strong>セッションタイトル:</strong> {formData.title}</p>
              <p><strong>セッション説明:</strong> {formData.description}</p>
              <p><strong>ディスカッションテーマ:</strong> {formData.discussion_theme || 'N/A'}</p>
              <p><strong>難易度:</strong> {formData.difficulty || 'N/A'}</p>
              <p><strong>開催日:</strong> {formData.session_date}</p>
              <p><strong>開始時間:</strong> {formData.start_time}</p>
              <p><strong>所要時間:</strong> {formData.duration_minutes}分</p>
              <p><strong>最大参加者数:</strong> {formData.max_participants}人</p>
              <p><strong>開催方式:</strong> {formData.meeting_method}</p>
              {formData.meeting_method === 'オンライン' && formData.zoom_link && (
                <p><strong>Zoom招待リンク:</strong> {formData.zoom_link}</p>
              )}
              {user && (
                <>
                  <p><strong>作成者UID:</strong> {user.uid}</p>
                  <p><strong>作成者名:</strong> {user.displayName || user.email}</p>
                  <p><strong>作成者Gmail:</strong> {user.email}</p> {/* ★ ここを確認モーダルにも表示 (任意) */}
                </>
              )}
            </div>
            <div className="confirmation-buttons">
              <button onClick={handleConfirm} className="confirm-button">決定</button>
              <button onClick={handleCancel} className="cancel-button">やり直す</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionCreateForm;