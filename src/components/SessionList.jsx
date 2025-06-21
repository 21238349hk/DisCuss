import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import '../styles/SessionList.css'; // CSSファイルをインポート
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
          session_date: sessionDateTime ? sessionDateTime.toLocaleDateString('ja-JP') : 'N/A', // 日本語形式で日付表示
          start_time: sessionDateTime ? sessionDateTime.toTimeString().substring(0, 5) : 'N/A', //
          createdAt: createdAt ? createdAt.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A', // 日本語形式で日時表示
          updatedAt: updatedAt ? updatedAt.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A', // 日本語形式で日時表示
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
        <ul className="session-list"> {/* この ul に Grid スタイルを適用 */}
          {sessions.map((session) => (
            <li key={session.id} className="session-item float-animate">
              <div className="session-content">
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
              </div>
              {session.createdAt && session.updatedAt && (
                <div className="session-meta-container">
                  <p className="session-meta">
                    作成日時: {session.createdAt} |
                    更新日時: {session.updatedAt}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SessionList;