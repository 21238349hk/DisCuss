import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import '../styles/SessionList.css';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionsCollectionRef = collection(db, 'sessions');
    const q = query(sessionsCollectionRef, orderBy('session_datetime', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const sessionDateTime = data.session_datetime ? data.session_datetime.toDate() : null;
        const createdAt = data.createdAt ? data.createdAt.toDate() : null;
        const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;

        return {
          id: doc.id,
          ...data,
          session_date: sessionDateTime ? sessionDateTime.toISOString().split('T')[0] : null,
          start_time: sessionDateTime ? sessionDateTime.toTimeString().split(' ')[0].substring(0, 5) : null,
          createdAt: createdAt ? createdAt.toISOString() : null,
          updatedAt: updatedAt ? updatedAt.toISOString() : null,
        };
      });
      setSessions(sessionsData);
      setLoading(false);
    }, (err) => {
      console.error("セッションのリアルタイム取得中にエラーが発生しました:", err);
      setError("セッションの読み込みに失敗しました。");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>セッションを読み込み中...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="session-container">
      <h1>セッション一覧</h1>
      {sessions.length === 0 ? (
        <p>まだセッションがありません。</p>
      ) : (
        <ul className="session-list">
          {sessions.map((session) => (
            <li key={session.id} className="session-item float-animate">
              <h2>{session.title}</h2>
              <p><strong>説明:</strong> {session.description}</p>
              <p><strong>ディスカッションテーマ:</strong> {session.discussion_theme || 'N/A'}</p>
              <p><strong>難易度:</strong> {session.difficulty || 'N/A'}</p>
              <p><strong>開催日:</strong> {session.session_date}</p>
              <p><strong>開始時間:</strong> {session.start_time}</p>
              <p><strong>所要時間:</strong> {session.duration_minutes}分</p>
              <p><strong>最大参加者数:</strong> {session.max_participants}人</p>
              <p><strong>開催方式:</strong> {session.meeting_method}</p>
              {session.meeting_method === 'オンライン' && session.zoom_link && (
                <p><strong>Zoomリンク:</strong> <a href={session.zoom_link} target="_blank" rel="noopener noreferrer">{session.zoom_link}</a></p>
              )}
              {session.createdAt && session.updatedAt && (
                <p className="session-meta">
                  作成日時: {new Date(session.createdAt).toLocaleString()} |
                  更新日時: {new Date(session.updatedAt).toLocaleString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SessionList;
