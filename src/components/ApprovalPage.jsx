import { useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'; // collection, query, where, getDocs をインポート
import { db } from '../firebase-config';
import { useEffect, useState } from 'react';
import '../styles/ApprovalPage.css';

export default function ApprovalPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId");
  const requesterId = params.get("requesterId");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionSnap = await getDoc(doc(db, 'sessions', sessionId));
        const userSnap = await getDoc(doc(db, 'users', requesterId));

        if (sessionSnap.exists()) {
          setSession(sessionSnap.data());
        } else {
          setError('セッション情報が見つかりません。');
        }

        if (userSnap.exists()) {
          setProfile(userSnap.data());
        } else {
          setError(prev => prev ? prev + ' 申請者プロフィールが見つかりません。' : '申請者プロフィールが見つかりません。');
        }
      } catch (err) {
        console.error("データの取得エラー:", err);
        setError('データの読み込み中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId, requesterId]);

  const handleDecision = async (decision) => {
    try {
      // sessionId と requesterId を使って通知を検索
      const q = query(
        collection(db, 'notifications'),
        where('sessionId', '==', sessionId),
        where('requesterId', '==', requesterId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 該当する通知が1つ以上見つかった場合、最初のものを更新
        const notificationDoc = querySnapshot.docs[0];
        await updateDoc(notificationDoc.ref, { status: decision });
        setStatus(`申請を「${decision === 'approved' ? '承認' : '拒否'}」に更新しました。`);
      } else {
        setStatus('エラー: 対応する申請が見つかりませんでした。');
      }
    } catch (err) {
      console.error("申請ステータス更新エラー:", err);
      setStatus('申請ステータスの更新に失敗しました。');
    }
  };

  if (loading) {
    return <div className="loading-message">読み込み中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!session && !profile) {
    return <div className="error-message">セッション情報および申請者プロフィールが見つかりませんでした。</div>;
  }

  return (
    <div className="approval-container">
      <h1>申請承認ページ</h1>
      {session && (
        <div className="section-card">
          <h2>セッション情報</h2>
          <p><strong>タイトル:</strong> {session.title}</p>
          <p><strong>開催日:</strong> {new Date(session.session_datetime.toDate()).toLocaleString('ja-JP')}</p>
        </div>
      )}
      {profile && (
        <div className="section-card">
          <h2>申請者プロフィール</h2>
          <p><strong>名前:</strong> {profile.name || 'N/A'}</p>
          <p><strong>所属:</strong> {profile.affiliation || 'N/A'}</p>
          <p><strong>自己紹介:</strong> {profile.bio || 'N/A'}</p>
        </div>
      )}
      <div className="decision-buttons">
        <button className="approve" onClick={() => handleDecision('approved')}>承認</button>
        <button className="reject" onClick={() => handleDecision('rejected')}>拒否</button>
      </div>
      {status && <p className={`status-message ${status.includes('失敗') || status.includes('エラー') ? 'error' : ''}`}>{status}</p>}
    </div>
  );
}