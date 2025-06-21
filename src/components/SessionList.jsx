import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import '../styles/SessionList.css';
import emailjs from 'emailjs-com';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc
} from 'firebase/firestore';

function SessionList({ currentUser }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('session_datetime', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const sessionDateTime = doc.data().session_datetime?.toDate();
        return {
          id: doc.id,
          ...doc.data(),
          session_date: sessionDateTime?.toLocaleDateString('ja-JP') || 'N/A',
          start_time: sessionDateTime?.toTimeString().substring(0, 5) || 'N/A',
          createdAt: doc.data().createdAt?.toDate().toLocaleString('ja-JP') || 'N/A',
          updatedAt: doc.data().updatedAt?.toDate().toLocaleString('ja-JP') || 'N/A',
          ownerEmail: doc.data().userEmail || 'default_owner@example.com',
        };
      });
      setSessions(data);
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

    return emailjs.send(
      'service_a9mr7c2',
      'template_opkxshf',
      {
        to_email: ownerEmail,
        sessionTitle,
        requesterEmail,
        type,
        approvalUrl,
      },
      '7fDpG5aIjSV3qnE5F'
    );
  };

  const handleConfirm = async () => {
    if (!selectedSession || !currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        sessionId: selectedSession.id,
        type: requestType,
        timestamp: new Date(),
        sessionTitle: selectedSession.title,
        requesterId: currentUser.uid || 'anonymous',
        requesterEmail: currentUser.email || 'anonymous@example.com',
        status: 'pending',
      });

      await sendEmailToOwner(
        selectedSession.userEmail,
        selectedSession.title,
        currentUser.email || 'anonymous@example.com',
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
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>セッションを読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="session-container">
      <h1>セッション一覧</h1>
      {sessions.length === 0 ? (
        <p>まだセッションがありません。</p>
      ) : (
        <ul className="session-list">
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
              </div>

              <div className="session-actions">
                <button className="request-button join" onClick={() => openModal(session, '参加')}>
                  参加申請
                </button>
                <button className="request-button observe" onClick={() => openModal(session, '見学')}>
                  見学申請
                </button>
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
              <button onClick={handleConfirm} className="button-confirm" disabled={isSubmitting}>
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
              <button onClick={() => setShowModal(false)} className="button-cancel" disabled={isSubmitting}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionList;
