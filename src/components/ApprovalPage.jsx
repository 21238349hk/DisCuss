import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
    if (user && user.uid) {
      const fetchUserProfile = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
          }
        } catch (err) {
          console.error("ユーザープロファイルの取得エラー:", err);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionSnap = await getDoc(doc(db, 'sessions', sessionId));
        const requesterUserSnap = await getDoc(doc(db, 'users', requesterId));

        if (sessionSnap.exists()) {
          setSession(sessionSnap.data());
        } else {
          setError('セッション情報が見つかりません。');
        }

        if (requesterUserSnap.exists()) {
          setProfile(requesterUserSnap.data());
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

  const sendEmailToApplicant = async (
    requesterEmail,
    requesterName,
    sessionTitle,
    sessionDate,
    requestType,
    decision, 
    ownerEmail
  ) => {
    let templateId;
    if (decision === 'approved') {
      templateId = 'template_wmkriqn'; 
    } else {
      templateId = 'template_wmkriqn'; 
    }

    try {
      await emailjs.send(
        'service_a9mr7c2', 
        templateId, 
        {
          to_email: requesterEmail,
          requesterName: requesterName,
          sessionTitle: sessionTitle,
          sessionDate: sessionDate,
          requestType: requestType,
          decision: decision === 'approved' ? '承認' : '拒否', 
          ownerEmail: ownerEmail
        },
        '7fDpG5aIjSV3qnE5F' 
      );
      console.log(`申請者へのメール送信成功 (${decision}通知)！`);
    } catch (err) {
      console.error(`申請者へのメール送信エラー (${decision}通知):`, err);
    }
  };


  const handleDecision = async (decision) => {
    try {
      const notificationRef = doc(db, 'notifications', `${sessionId}_${requesterId}`);
      const notifDoc = await getDoc(notificationRef);

      if (notifDoc.exists()) {
        const notificationData = notifDoc.data();
        await updateDoc(notifDoc.ref, { status: decision });
        setStatus(`申請を「${decision === 'approved' ? '承認' : '拒否'}」に更新しました。`);

        await sendEmailToApplicant(
          notificationData.requesterEmail,
          profile?.name || notificationData.requesterEmail,
          session.title,
          new Date(session.session_datetime.toDate()).toLocaleString('ja-JP'),
          notificationData.type,
          decision, 
          session.userEmail
        );

      } else {
        setStatus('エラー: 対応する申請ドキュメントが見つかりませんでした。');
      }
    } catch (err) {
      console.error("申請ステータス更新エラー:", err);
      setStatus('申請ステータスの更新に失敗しました。');
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

  if (!session && !profile) {
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
        <div className="error-message">セッション情報および申請者プロフィールが見つかりませんでした。</div>
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
    </>
  );
}