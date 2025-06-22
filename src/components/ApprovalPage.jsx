import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase-config';
import '../styles/ApprovalPage.css'; 
import Header from './Header';
import emailjs from 'emailjs-com'; 

export default function ApprovalPage({ user }) { 
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = params.get("sessionId");
  const requesterId = params.get("requesterId");

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); 
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(null); 

  useEffect(() => {
    if (!user || !user.uid) {
      setUserProfile(null); 
      return;
    }

    const fetchOwnerProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data());
        } else {
          console.warn("セッションオーナーのプロフィールが見つかりません。UID:", user.uid);
          setUserProfile(null); 
        }
      } catch (err) {
        console.error("セッションオーナーのプロフィール取得エラー:", err);
        setUserProfile(null); 
      }
    };
    fetchOwnerProfile();
  }, [user]); 

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId || !requesterId) {
        setError('URLパラメータ (sessionId, requesterId) が不足しています。');
        setLoading(false);
        return;
      }

      try {
        const sessionDocRef = doc(db, 'sessions', sessionId);
        const requesterUserDocRef = doc(db, 'users', requesterId);
        const notificationDocRef = doc(db, 'notifications', `${sessionId}_${requesterId}`); 

        const [sessionSnap, requesterUserSnap, notificationSnap] = await Promise.all([
          getDoc(sessionDocRef),
          getDoc(requesterUserDocRef),
          getDoc(notificationDocRef) 
        ]);

        if (sessionSnap.exists()) {
          setSession(sessionSnap.data());
        } else {
          setError('セッション情報が見つかりません。');
          return; 
        }

        if (requesterUserSnap.exists()) {
          setProfile(requesterUserSnap.data());
        } else {
          setError(prev => prev ? prev + ' 申請者プロフィールが見つかりません。' : '申請者プロフィールが見つかりません。');
          return; 
        }

        if (!notificationSnap.exists()) {
        } else {
        }

      } catch (err) {
        console.error("データの取得エラー:", err);
        setError('データの読み込み中にエラーが発生しました。詳細はコンソールを確認してください。');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId, requesterId]); 

    const sendEmailToApplicant = async (
    targetRequesterEmail,
    targetRequesterName,
    targetSessionTitle,
    targetSessionDate,
    targetRequestType,
    decisionType,
    targetOwnerEmail
    ) => {
    const approvedTemplateId = 'template_wntd5x9';   
    const rejectedTemplateId = 'template_xlcz1vf'; 

    const templateId = decisionType === 'approved' ? approvedTemplateId : rejectedTemplateId;

    try {
        await emailjs.send(
        'service_axahjrs', 
        templateId,
        {
            to_email: targetRequesterEmail,
            requesterName: targetRequesterName,
            sessionTitle: targetSessionTitle,
            sessionDate: targetSessionDate,
            requestType: targetRequestType,
            ownerEmail: targetOwnerEmail,
            name: 'DisCuss',
            email: targetOwnerEmail
        },
        'cX_QxGBbnmjHYDS0D' 
        );
    } catch (err) {
        console.error(`メール送信エラー (${decisionType}):`, err);
    }
    };


  const handleDecision = async (decision) => {
    if (!session || !profile) {
      setStatus('エラー: セッション情報または申請者プロフィールが不足しているため、処理できません。');
      return;
    }

    try {
      const notificationRef = doc(db, 'notifications', `${sessionId}_${requesterId}`);
      const notifDoc = await getDoc(notificationRef);

      if (notifDoc.exists()) {
        const notificationData = notifDoc.data();

        await updateDoc(notifDoc.ref, { status: decision });
        setStatus(`申請を「${decision === 'approved' ? '承認' : '拒否'}」に更新しました。`);

        if (notificationData.requesterEmail && notificationData.type && session.userEmail) {
          console.log("メール送信対象:", {
            requesterEmail: notificationData.requesterEmail,
            requesterName: profile.displayName,
            sessionTitle: session.title,
            sessionDate: session.session_datetime.toDate().toLocaleString('ja-JP'),
            type: notificationData.type,
            ownerEmail: session.userEmail
          });

          await sendEmailToApplicant(
            notificationData.requesterEmail,
            profile.displayName || notificationData.requesterEmail, 
            session.title,
            new Date(session.session_datetime.toDate()).toLocaleString('ja-JP'),
            notificationData.type, 
            decision, 
            session.userEmail 
          );
        } else {
          console.warn("メール送信に必要な情報が不足しています");
          setStatus(prev => prev + ' (メールは送信されませんでした)');
        }

      } else {
        setStatus('エラー: 対応する申請ドキュメントが見つかりませんでした。申請IDが正しいか確認してください。');
      }
    } catch (err) {
      console.error("ステータス更新またはメール送信エラー:", err);
      setStatus('申請ステータスの更新に失敗しました。詳細はコンソールを確認してください。');
    }
  };

  const handleNavigate = (key) => {
    if (key === 'dashboard') navigate('/');
    else if (key === 'sessions') navigate('/sessions');
    else if (key === 'create') navigate('/create-session'); 
    else if (key === 'profile') navigate('/profile');
    else if (key === 'ai-chat') navigate('/ai-chat'); 
  };

  if (loading) {
    return (
      <>
        <Header
          currentPage="approval" 
          onNavigate={handleNavigate}
          user={user}
          userProfile={userProfile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="loading-message">読み込み中...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          currentPage="approval"
          onNavigate={handleNavigate}
          user={user}
          userProfile={userProfile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="error-message">{error}</div>
      </>
    );
  }

  if (!session || !profile) {
     return (
      <>
        <Header
          currentPage="approval"
          onNavigate={handleNavigate}
          user={user}
          userProfile={userProfile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="error-message">必要なセッションまたは申請者プロフィール情報が取得できませんでした。</div>
      </>
    );
  }

  return (
    <>
      <Header
        currentPage="approval"
        onNavigate={handleNavigate}
        user={user}
        userProfile={userProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="approval-container">
        <h1>申請承認ページ</h1>
        <div className="section-card">
          <h2>セッション情報</h2>
          <p><strong>タイトル:</strong> {session.title}</p>
          <p><strong>開催日:</strong> {new Date(session.session_datetime.toDate()).toLocaleString('ja-JP')}</p>
        </div>

        <div className="section-card">
          <h2>申請者プロフィール</h2>
          <p><strong>氏名:</strong> {profile.displayName || 'N/A'}</p>
          <p><strong>大学:</strong> {profile.university || 'N/A'}</p>
          <p><strong>専攻:</strong> {profile.major || profile.department || 'N/A'}</p>
        </div>

        <div className="decision-buttons">
          <button className="approve" onClick={() => handleDecision('approved')}>承認</button>
          <button className="reject" onClick={() => handleDecision('rejected')}>拒否</button>
        </div>

        {status && (
          <p className={`status-message ${status.includes('失敗') || status.includes('エラー') ? 'error' : ''}`}>
            {status}
          </p>
        )}
      </div>
    </>
  );
}
