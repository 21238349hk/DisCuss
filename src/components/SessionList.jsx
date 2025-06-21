import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import '../styles/SessionList.css';
import emailjs from 'emailjs-com';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

function SessionList({ searchQuery, currentUser }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSession, setSelectedSession] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const sessionsCollectionRef = collection(db, 'sessions');
    const q = query(sessionsCollectionRef, orderBy('session_datetime', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const sessionDateTime = data.session_datetime?.toDate() || null;
        const createdAt = data.createdAt?.toDate() || null;
        const updatedAt = data.updatedAt?.toDate() || null;

        return {
          id: doc.id,
          ...data,
          session_date: sessionDateTime ? sessionDateTime.toLocaleDateString('ja-JP') : 'N/A',
          start_time: sessionDateTime ? sessionDateTime.toTimeString().substring(0, 5) : 'N/A',
          createdAt: createdAt ? createdAt.toLocaleString('ja-JP') : 'N/A',
          updatedAt: updatedAt ? updatedAt.toLocaleString('ja-JP') : 'N/A',
        };
      });
      setSessions(sessionsData);
      setLoading(false);
    }, (err) => {
      console.error('セッションの取得エラー:', err);
      setError('セッションの読み込みに失敗しました。');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openModal = (session, type) => {
    setSelectedSession(session);
    setRequestType(type);
    setShowModal(true);
  };

  const sendEmailToOwner = (ownerEmail, sessionTitle, requesterEmail, type, sessionId) => {
    const approvalUrl = `https://yourapp.com/approval/${sessionId}`;

    emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: ownerEmail,
        sessionTitle,
        requesterEmail,
        type,
        approvalUrl,
      },
      'YOUR_PUBLIC_KEY'
    ).then(() => {
      console.log('通知メール送信完了');
    }).catch((err) => {
      console.error('メール送信エラー:', err);
    });
  };

  const handleConfirm = async () => {
    try {
      await addDoc(collection(db, 'notifications'), {
        sessionId: selectedSession.id,
        type: requestType,
        timestamp: new Date(),
        sessionTitle: selectedSession.title,
        requesterId: currentUser?.id || 'anonymous',
        requesterEmail: currentUser?.email || 'anonymous@example.com',
        status: 'pending',
      });

      sendEmailToOwner(
        selectedSession.ownerEmail,
        selectedSession.title,
        currentUser?.email || 'anonymous@example.com',
        requestType,
        selectedSession.id
      );

      alert(`${requestType}申請を送信しました。`);
    } catch (err) {
      console.error('通知送信エラー:', err);
      alert('申請の送信に失敗しました。');
    } finally {
      setShowModal(false);
      setSelectedSession(null);
      setRequestType('');
    }
  };

  if (loading) return <p>セッションを読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="session-container">
      <h1>セッション一覧</h1>

      {filteredSessions.length === 0 ? (
        <p>該当するセッションがありません。</p>
      ) : (
        <ul className="session-list">
          {filteredSessions.map((session) => (
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
              </div>

              <div className="session-actions">
                <button className="request-button join" onClick={() => openModal(session, '参加')}>参加申請</button>
                <button className="request-button observe" onClick={() => openModal(session, '見学')}>見学申請</button>
              </div>

              <div className="session-meta-container">
                <p className="session-meta">作成日時: {session.createdAt} | 更新日時: {session.updatedAt}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>申請の確認</h2>
            <p><strong>セッション名:</strong> {selectedSession.title}</p>
            <p><strong>申請種別:</strong> {requestType}</p>
            <p><strong>開催日:</strong> {selectedSession.session_date} {selectedSession.start_time}〜</p>
            <div className="modal-actions">
              <button onClick={handleConfirm} className="button-confirm">送信する</button>
              <button onClick={() => setShowModal(false)} className="button-cancel">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionList;
