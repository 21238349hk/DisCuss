import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  MapPin,
  Video
} from 'lucide-react';
import { getDocs, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { mockSessions } from '../data/mockData';
import emailjs from 'emailjs-com';
import '../styles/Dashboard.css';
import '../styles/SessionList.css';

export default function Dashboard({ onNavigate, user }) {
  const [stats, setStats] = useState([
    { label: '参加セッション数', value: '-', icon: Users, color: 'bg-blue-500' },
    { label: '今月の参加回数', value: '-', icon: Calendar, color: 'bg-green-500' },
    { label: '平均評価スコア', value: '-', icon: Trophy, color: 'bg-yellow-500' },
    { label: '成長率', value: '+15%', icon: TrendingUp, color: 'bg-purple-500' }
  ]);

  const [appliedSessions, setAppliedSessions] = useState([]);
  const [newSessions, setNewSessions] = useState([]);

  // Modal State
  const [selectedSession, setSelectedSession] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 左側：モックデータから申請予定のセッションを取得
        const applied = mockSessions
          .filter(session => session.participants.length > 0)
          .map(session => ({
            ...session,
            userEmail: session.organizer.email,
            discussion_theme: session.theme,
            duration_minutes: session.duration,
            max_participants: session.maxParticipants,
            meeting_method: session.location === 'online' ? 'オンライン' : 'オフライン',
            participants: { length: session.currentParticipants },
            session_datetime: { toDate: () => new Date(session.scheduledAt) }
          }));
        setAppliedSessions(applied);
        
        // 統計データの更新 (モックデータ基準)
        const joined = applied.length;
        const thisMonth = applied.length;
        setStats([
          { label: '参加セッション数', value: String(joined), icon: Users, color: 'bg-blue-500' },
          { label: '今月の参加回数', value: String(thisMonth), icon: Calendar, color: 'bg-green-500' },
          { label: '平均評価スコア', value: '4.2', icon: Trophy, color: 'bg-yellow-500' },
          { label: '成長率', value: '+15%', icon: TrendingUp, color: 'bg-purple-500' }
        ]);

        // 右側：Firebaseから新しいセッションを2件取得
        const sessionsCollection = collection(db, 'sessions');
        const q = query(sessionsCollection, orderBy('createdAt', 'desc'), limit(2));
        const snapshot = await getDocs(q);
        const newSessionsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setNewSessions(newSessionsData);

      } catch (error) {
        console.error("データ取得に失敗しました", error);
      }
    };

    fetchData();
  }, [user]);

  const openModal = (session, type) => {
    setSelectedSession(session);
    setRequestType(type);
    setShowModal(true);
  };

  const sendEmailToOwner = (ownerEmail, sessionTitle, requesterEmail, type) => {
    const approvalUrl = `https://gd-tanyao.web.app`;

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
    if (!selectedSession || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        sessionId: selectedSession.id,
        type: requestType,
        timestamp: new Date(),
        sessionTitle: selectedSession.title,
        requesterId: user.uid || 'anonymous',
        requesterEmail: user.email || 'anonymous@example.com',
        status: 'pending',
      });

      await sendEmailToOwner(
        selectedSession.userEmail,
        selectedSession.title,
        user.email || 'anonymous@example.com',
        requestType
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          おかえりなさい、{user ? user.displayName : 'ゲスト'}さん
        </h1>
        <p className="dashboard-subtitle">
          今日も就活スキルを磨いていきましょう！
        </p>
      </div>

      {/* 統計セクション */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-content">
              <div className={`stat-icon ${stat.color} bg-animate`}>
                <stat.icon className="icon-white" />
              </div>
              <div className="stat-text">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* セッションセクション */}
      <div className="session-grid">
        {/* 申請予定のセッション */}
        <div className="session-box animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="session-box-header">
            <h2 className="session-box-title">申請予定のセッション</h2>
          </div>
          <div className="session-box-body">
            {appliedSessions.length > 0 ? (
              <div className="session-list">
                {appliedSessions.map((session, index) => {
                  const sessionDateTime = session.session_datetime.toDate();
                  const sessionDate = sessionDateTime.toLocaleDateString('ja-JP');
                  const startTime = sessionDateTime.toTimeString().substring(0, 5);

                  return (
                    <div
                      key={session.id}
                      className="session-item animate-slide-up"
                      style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                    >
                      <div className="session-content" style={{ flexGrow: 1 }}>
                        <div className="session-item-header">
                          <h3 className="session-title">{session.title}</h3>
                        </div>
                        <p><strong>説明:</strong> {session.description}</p>
                        <p><strong>テーマ:</strong> {session.discussion_theme || 'N/A'}</p>
                        <p><strong>難易度:</strong> {session.difficulty || 'N/A'}</p>
                        <p><strong>開催日:</strong> {sessionDate}</p>
                        <p><strong>時間:</strong> {startTime}〜 ({session.duration_minutes}分)</p>
                        <p><strong>参加者:</strong> {session.participants.length}/{session.max_participants}人</p>
                        <p><strong>開催方式:</strong> {session.meeting_method}</p>
                      </div>
                      <div className="session-actions" style={{ marginTop: 'auto' }}>
                        <button className="request-button join" onClick={() => openModal(session, '参加')}>
                          参加申請
                        </button>
                        <button className="request-button observe" onClick={() => openModal(session, '見学')}>
                          見学申請
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="session-empty animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <Calendar className="icon-large" />
                <p>申請予定のセッションがありません</p>
                <button onClick={() => onNavigate('sessions')} className="button-primary">
                  セッションを探す
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 新しいセッション */}
        <div className="session-box animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="session-box-header">
            <h2 className="session-box-title">新しいセッション</h2>
          </div>
          <div className="session-box-body">
            <div className="session-list">
              {newSessions.map((session, index) => {
                const sessionDateTime = session.session_datetime?.toDate();
                const sessionDate = sessionDateTime?.toLocaleDateString('ja-JP') || 'N/A';
                const startTime = sessionDateTime?.toTimeString().substring(0, 5) || 'N/A';

                return (
                  <div
                    key={session.id}
                    className="session-item animate-slide-up"
                    style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                  >
                    <div className="session-content" style={{ flexGrow: 1 }}>
                      <div className="session-item-header">
                        <h3 className="session-title">{session.title}</h3>
                      </div>
                      <p><strong>説明:</strong> {session.description}</p>
                      <p><strong>テーマ:</strong> {session.discussion_theme || 'N/A'}</p>
                      <p><strong>難易度:</strong> {session.difficulty || 'N/A'}</p>
                      <p><strong>開催日:</strong> {sessionDate}</p>
                      <p><strong>時間:</strong> {startTime}〜 ({session.duration_minutes}分)</p>
                      <p><strong>参加者:</strong> {session.participants?.length || 0}/{session.max_participants}人</p>
                      <p><strong>開催方式:</strong> {session.meeting_method}</p>
                    </div>
                    <div className="session-actions" style={{ marginTop: 'auto' }}>
                      <button className="request-button join" onClick={() => openModal(session, '参加')}>
                        参加申請
                      </button>
                      <button className="request-button observe" onClick={() => openModal(session, '見学')}>
                        見学申請
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Quick Action */}
      <div
        className="quick-action-container animate-slide-up"
        style={{ animationDelay: '1s' }}
      >
        <div className="quick-action-content">
          <div className="quick-action-text">
            <h3 className="quick-action-title">新しいセッションを作成しませんか？</h3>
            <p className="quick-action-subtext">
              他の就活生と一緒にスキルアップしましょう
            </p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="quick-action-button"
          >
            セッションを作成
          </button>
        </div>
      </div>
      {showModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>申請の確認</h2>
            <p><strong>セッション名:</strong> {selectedSession.title}</p>
            <p><strong>申請種別:</strong> {requestType}</p>
            <p><strong>開催日:</strong> {selectedSession.session_datetime?.toDate().toLocaleDateString('ja-JP')} {selectedSession.session_datetime?.toDate().toTimeString().substring(0, 5)}〜</p>
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
