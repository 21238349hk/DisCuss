const ZOOM_API_URL = import.meta.env.VITE_ZOOM_API_URL;
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import {
  collection, addDoc, serverTimestamp,
  doc, getDoc, updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/SessionCreateForm.css';

function SessionCreateForm({ onNavigate }) {
  const [formData, setFormData] = useState({
    title: '', description: '', discussion_theme: '', difficulty: '',
    session_date: '', start_time: '', duration_minutes: 40, max_participants: 6,
    meeting_method: 'オンライン', zoom_link: ''
  });
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [user, setUser] = useState(null);
  const [isIssuingUrl, setIsIssuingUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  

  const handleIssueZoomUrl = async () => {
    setIsIssuingUrl(true);
    setError(null);
    try {
      const response = await fetch(ZOOM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: formData.title || '新しいセッション' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Zoom URLの発行に失敗しました。');
      }

      const data = await response.json();
      setFormData(prevData => ({ ...prevData, zoom_link: data.join_url }));
      setMessage('Zoom URLが正常に発行されました');
    } catch (err) {
      setError(`Zoom URL発行エラー: ${err.message}`);
    } finally {
      setIsIssuingUrl(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return setError('セッションを作成するにはログインが必要です。');
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...formData,
        session_datetime: new Date(`${formData.session_date}T${formData.start_time}`),
        zoom_link: formData.meeting_method === 'オンライン' ? formData.zoom_link : null,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const prev = userDocSnap.data()?.stats?.createdSessions || 0;
        await updateDoc(userDocRef, { 'stats.createdSessions': prev + 1 });
      }

      setMessage(`セッションが作成されました。ID: ${docRef.id}`);
      setFormData({
        title: '', description: '', discussion_theme: '', difficulty: '',
        session_date: '', start_time: '', duration_minutes: 40, max_participants: 6,
        meeting_method: 'オンライン', zoom_link: ''
      });
      setShowSuccessCheck(true);
      setTimeout(() => {
        setShowSuccessCheck(false);
        onNavigate('dashboard');
      }, 1500);
    } catch (err) {
      setError(`保存に失敗しました: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const steps = [
    <>
      <label>セッションタイトル</label>
      <input type="text" name="title" value={formData.title} onChange={handleChange} required />
      <label>セッション説明</label>
      <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" />
    </>,
    <>
      <label>ディスカッションテーマ</label>
      <input type="text" name="discussion_theme" value={formData.discussion_theme} onChange={handleChange} required />
      <label>難易度</label>
      <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
        <option value="">選択してください</option>
        <option value="初級">初級</option>
        <option value="中級">中級</option>
        <option value="上級">上級</option>
      </select>
    </>,
    <>
      <label>開催日</label>
      <input type="date" name="session_date" value={formData.session_date} onChange={handleChange} required />
      <label>開始時間</label>
      <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
    </>,
    <>
      <label>所要時間 (分)</label>
      <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} min={5} max={40} required />
      <label>最大参加者数</label>
      <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} required />
    </>,
    <>
      <label>開催方式</label>
      <select name="meeting_method" value={formData.meeting_method} onChange={handleChange} required>
        <option value="オンライン">オンライン</option>
        <option value="対面">対面</option>
      </select>
      {formData.meeting_method === 'オンライン' && (
        <>
          <label>Zoom招待リンク:</label>
          <input type="url" name="zoom_link" value={formData.zoom_link} onChange={handleChange} required pattern="https?://.+" />
          <button type="button" onClick={handleIssueZoomUrl} disabled={isIssuingUrl}>
            {isIssuingUrl ? '発行中...' : 'Zoom URLを即時発行'}
          </button>
        </>
      )}
    </>
  ];

  return (
    <div className="session-form-container">
      <h1>新しいGDセッションを作成</h1>
      <div className="step-indicator">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`step ${step === s ? 'active' : ''}`}>Step {s}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {steps[step - 1]}
        <div className="step-buttons">
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)}>戻る</button>}
          {step < 5 && <button type="button" onClick={() => setStep(step + 1)}>次へ</button>}
          {step === 5 && <button type="submit">確認画面へ</button>}
        </div>
      </form>
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal-content">
            <h2>入力内容の確認</h2>
            <div className="confirmation-details">
              <p><strong>タイトル:</strong> {formData.title}</p>
              <p><strong>説明:</strong> {formData.description}</p>
              <p><strong>テーマ:</strong> {formData.discussion_theme}</p>
              <p><strong>難易度:</strong> {formData.difficulty}</p>
              <p><strong>日付:</strong> {formData.session_date}</p>
              <p><strong>時間:</strong> {formData.start_time}</p>
              <p><strong>時間:</strong> {formData.duration_minutes}分</p>
              <p><strong>人数:</strong> {formData.max_participants}人</p>
              <p><strong>方式:</strong> {formData.meeting_method}</p>
              {formData.zoom_link && <p><strong>Zoomリンク:</strong> {formData.zoom_link}</p>}
            </div>
            <div className="confirmation-buttons">
              <button onClick={handleConfirm} disabled={isSubmitting} className="confirm-button">
                {isSubmitting ? '投稿中...' : '投稿'}
              </button>
              <button onClick={() => setShowConfirmation(false)} className="cancel-button">キャンセル</button>
            </div>
          </div>
        </div>
      )}
      {(message || error) && (
        <p className={`status-msg ${error ? 'error' : 'success'}`}>
          {error || message}
        </p>
      )}
      {showSuccessCheck && (
        <div className="checkmark-overlay">
          <div className="checkmark-container">
            <svg className="checkmark" viewBox="0 0 52 52">
              <path d="M14 27 l10 10 l20 -20" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionCreateForm;
