import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // collection, query, where, getDocsは不要なため削除
import { db } from '../firebase-config';
import '../styles/ApprovalPage.css'; // CSSファイルのインポートパスを確認
import Header from './Header'; // Headerコンポーネントのパスを確認
import emailjs from 'emailjs-com'; // EmailJSをインポート

export default function ApprovalPage({ user }) { // 親コンポーネントからuserオブジェクトを受け取る
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = params.get("sessionId");
  const requesterId = params.get("requesterId");

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // 申請者のプロフィール
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Headerに渡すためのstate
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(null); // セッションオーナー（現在のユーザー）のプロフィール

  // セッションオーナーのプロフィールをFirestoreから取得
  useEffect(() => {
    if (!user || !user.uid) {
      // userが未認証またはUIDがない場合は処理しない
      setUserProfile(null); // プロフィールをクリア
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
          setUserProfile(null); // 見つからない場合はnull
        }
      } catch (err) {
        console.error("セッションオーナーのプロフィール取得エラー:", err);
        setUserProfile(null); // エラー時もnull
      }
    };
    fetchOwnerProfile();
  }, [user]); // userオブジェクトが変更されたときに実行

  // セッション情報と申請者プロフィール、通知データを取得
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
        const notificationDocRef = doc(db, 'notifications', `${sessionId}_${requesterId}`); // notificationsドキュメントも取得

        const [sessionSnap, requesterUserSnap, notificationSnap] = await Promise.all([
          getDoc(sessionDocRef),
          getDoc(requesterUserDocRef),
          getDoc(notificationDocRef) // 通知ドキュメントの取得を追加
        ]);

        if (sessionSnap.exists()) {
          setSession(sessionSnap.data());
        } else {
          setError('セッション情報が見つかりません。');
          return; // エラーなので以降の処理を中断
        }

        if (requesterUserSnap.exists()) {
          setProfile(requesterUserSnap.data());
        } else {
          setError(prev => prev ? prev + ' 申請者プロフィールが見つかりません。' : '申請者プロフィールが見つかりません。');
          return; // エラーなので以降の処理を中断
        }

        // 通知ドキュメントの存在確認（EmailJS送信時にrequesterEmailとtypeが必要なため）
        if (!notificationSnap.exists()) {
          console.warn("対応する通知ドキュメントが見つかりません。メール通知ができない可能性があります。");
          // ここでエラーにするかは要件によるが、今回は通知できない旨のログに留める
        }

      } catch (err) {
        console.error("データの取得エラー:", err);
        setError('データの読み込み中にエラーが発生しました。詳細はコンソールを確認してください。');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId, requesterId]); // sessionIdとrequesterIdが変わったときに実行

  // 申請者へのメール送信関数
  const sendEmailToApplicant = async (
    targetRequesterEmail, // 申請者のメールアドレス
    targetRequesterName,  // 申請者の名前
    targetSessionTitle,   // セッションタイトル
    targetSessionDate,    // セッション開催日時
    targetRequestType,    // 申請種別 (参加 or 見学)
    decisionType,         // 'approved' or 'rejected'
    targetOwnerEmail      // セッションオーナーのメールアドレス
  ) => {
    let templateId;
    if (decisionType === 'approved') {
      templateId = 'template_approved_applicant_notification'; // 承認用テンプレートID
    } else {
      templateId = 'template_rejected_applicant_notification'; // 拒否用テンプレートID
    }

    try {
      await emailjs.send(
        'service_a9mr7c2', // あなたのEmailJS Service ID
        templateId,        // 決定に応じて動的にテンプレートIDを設定
        {
          to_email: targetRequesterEmail,
          requesterName: targetRequesterName,
          sessionTitle: targetSessionTitle,
          sessionDate: targetSessionDate,
          requestType: targetRequestType,
          // 'decision'変数が必要な場合はテンプレート側に合わせて追加
          ownerEmail: targetOwnerEmail,
          name: 'DisCuss', // From Name のための静的な値
          email: 'no-reply@your-app-domain.com' // Reply To のための固定メールアドレス（必要に応じて変更）
        },
        '7fDpG5aIjSV3qnE5F' // あなたのEmailJS User ID
      );
      console.log(`申請者へのメール送信成功 (${decisionType}通知)！`);
    } catch (err) {
      console.error(`申請者へのメール送信エラー (${decisionType}通知):`, err);
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

        // 状態を更新
        await updateDoc(notifDoc.ref, { status: decision });
        setStatus(`申請を「${decision === 'approved' ? '承認' : '拒否'}」に更新しました。`);

        // メール通知（通知ドキュメントからrequesterEmailとtypeを取得）
        if (notificationData.requesterEmail && notificationData.type && session.userEmail) {
          await sendEmailToApplicant(
            notificationData.requesterEmail,
            profile.name || notificationData.requesterEmail, // 申請者名 (プロフィール優先、なければメール)
            session.title,
            new Date(session.session_datetime.toDate()).toLocaleString('ja-JP'),
            notificationData.type, // 申請種別
            decision, // 'approved' or 'rejected'
            session.userEmail // セッションオーナーのメールアドレス
          );
        } else {
          console.warn("メール送信に必要な情報（申請者メール、申請タイプ、オーナーメール）が不足しています。");
          setStatus(prev => prev + ' (メールは送信されませんでした)');
        }

      } else {
        setStatus('エラー: 対応する申請ドキュメントが見つかりませんでした。申請IDが正しいか確認してください。');
      }
    } catch (err) {
      console.error("申請ステータス更新またはメール送信エラー:", err);
      setStatus('申請ステータスの更新に失敗しました。詳細はコンソールを確認してください。');
    }
  };

  // HeaderのonNavigateプロップ用の関数
  const handleNavigate = (key) => {
    if (key === 'dashboard') navigate('/');
    else if (key === 'sessions') navigate('/sessions');
    else if (key === 'create') navigate('/create-session'); // セッション作成ページのパスを仮定
    else if (key === 'profile') navigate('/profile');
    else if (key === 'ai-chat') navigate('/ai-chat'); // AI相談ページのパスを仮定
  };

  // ローディング中の表示
  if (loading) {
    return (
      <>
        <Header
          currentPage="approval" // ヘッダーでこのページがアクティブになることは通常ないが、識別用に設定
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

  // エラー時の表示
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
          <p><strong>名前:</strong> {profile.name || 'N/A'}</p>
          <p><strong>所属:</strong> {profile.affiliation || 'N/A'}</p>
          <p><strong>自己紹介:</strong> {profile.bio || 'N/A'}</p>
        </div>
        <div className="decision-buttons">
          <button className="approve" onClick={() => handleDecision('approved')}>承認</button>
          <button className="reject" onClick={() => handleDecision('rejected')}>拒否</button>
        </div>
        {status && <p className={`status-message ${status.includes('失敗') || status.includes('エラー') ? 'error' : ''}`}>{status}</p>}
      </div>
    </>
  );
}