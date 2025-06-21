import { useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useEffect, useState } from 'react';

export default function ApprovalPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId");
  const requesterId = params.get("requesterId");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const sessionSnap = await getDoc(doc(db, 'sessions', sessionId));
      const userSnap = await getDoc(doc(db, 'users', requesterId));
      if (sessionSnap.exists()) setSession(sessionSnap.data());
      if (userSnap.exists()) setProfile(userSnap.data());
    };
    fetchData();
  }, [sessionId, requesterId]);

  const handleDecision = async (decision) => {
    const notifQuery = await getDoc(doc(db, 'notifications', `${sessionId}_${requesterId}`)); 
    if (notifQuery.exists()) {
      await updateDoc(notifQuery.ref, { status: decision });
      setStatus(`申請を「${decision}」に更新しました。`);
    }
  };

  return (
    <div>
      <h1>申請承認ページ</h1>
      {session && (
        <div>
          <h2>セッション情報</h2>
          <p><strong>タイトル:</strong> {session.title}</p>
          <p><strong>開催日:</strong> {new Date(session.session_datetime.toDate()).toLocaleString('ja-JP')}</p>
        </div>
      )}
      {profile && (
        <div>
          <h2>申請者プロフィール</h2>
          <p><strong>名前:</strong> {profile.name}</p>
          <p><strong>所属:</strong> {profile.affiliation}</p>
          <p><strong>自己紹介:</strong> {profile.bio}</p>
        </div>
      )}
      <div>
        <button onClick={() => handleDecision('approved')}>承認</button>
        <button onClick={() => handleDecision('rejected')}>拒否</button>
      </div>
      {status && <p>{status}</p>}
    </div>
  );
}
