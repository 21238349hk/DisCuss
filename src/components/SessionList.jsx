// frontend/src/components/SessionList.js
//丸ごと変更　幹太
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config'; // db のみをインポート
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore'; // Firestore関数

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionsCollectionRef = collection(db, 'sessions');
    const q = query(sessionsCollectionRef, orderBy('session_datetime', 'asc'));

    // リアルタイムリスナーを使用してデータの変更を自動的に反映
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // FirestoreのTimestampオブジェクトをJavaScriptのDateオブジェクトに変換
        const sessionDateTime = data.session_datetime ? data.session_datetime.toDate() : null;
        const createdAt = data.createdAt ? data.createdAt.toDate() : null;
        const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;

        return {
          id: doc.id, // ドキュメントID
          ...data,
          // 表示用に日付と時刻を分離してISO文字列に変換
          session_date: sessionDateTime ? sessionDateTime.toISOString().split('T')[0] : null,
          start_time: sessionDateTime ? sessionDateTime.toTimeString().split(' ')[0].substring(0, 5) : null, // HH:MM
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

    // コンポーネントのアンマウント時にリスナーを解除するクリーンアップ関数
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>セッションを読み込み中...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>セッション一覧</h1>
      {sessions.length === 0 ? (
        <p>まだセッションがありません。</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
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
              {/* ★ 削除: ファイルURLの表示は行わない */}
              {session.createdAt && session.updatedAt && (
                <p style={{fontSize: '0.8em', color: '#666'}}>
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