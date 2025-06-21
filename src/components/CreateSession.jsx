// frontend/src/components/SessionCreateForm.js
import React, { useState } from 'react';
import { db } from '../firebase-config'; // db のみをインポート
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore関数
import '../styles/SessionCreateForm.css';

function SessionCreateForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discussion_theme: '',
    difficulty: '',
    session_date: '',
    start_time: '',
    duration_minutes: 90,
    max_participants: 6,
    meeting_method: 'オンライン',
    zoom_link: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // 'sessions' コレクションへの参照を取得
      const sessionsCollectionRef = collection(db, 'sessions');

      // フォームデータをFirestoreに保存する形式に調整
      const sessionDataToSave = {
        title: formData.title,
        description: formData.description,
        discussion_theme: formData.discussion_theme,
        difficulty: formData.difficulty,
        session_datetime: new Date(`${formData.session_date}T${formData.start_time}`), // Dateオブジェクトとして保存
        duration_minutes: Number(formData.duration_minutes),
        max_participants: Number(formData.max_participants),
        meeting_method: formData.meeting_method,
        zoom_link: formData.meeting_method === 'オンライン' ? formData.zoom_link : null,
        // file_url: fileUrl, // ★ 削除: ファイルURLは保存しない
        createdAt: serverTimestamp(), // Firestore側で作成日時を記録
        updatedAt: serverTimestamp(), // Firestore側で更新日時を記録
      };

      // 新しいドキュメントをコレクションに追加
      const docRef = await addDoc(sessionsCollectionRef, sessionDataToSave);
      setMessage(`セッションが正常に作成されました。ドキュメントID: ${docRef.id}`);
      // フォームのリセット
      setFormData({
        title: '', description: '', discussion_theme: '', difficulty: '',
        session_date: '', start_time: '', duration_minutes: 90, max_participants: 6,
        meeting_method: 'オンライン', zoom_link: '',
      });

    } catch (err) {
      console.error("セッションの保存中にエラーが発生しました:", err);
      setError(`セッションの保存に失敗しました: ${err.message}`);
    }
  };

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
          </div>
        )}
        {/* ★ 削除: ファイルアップロード用の入力フィールドは含めない */}

        <button type="submit">セッションを保存</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default SessionCreateForm;