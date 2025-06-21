import React from 'react';
import {
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  MapPin,
  Video
} from 'lucide-react';
import { mockSessions, currentUser } from '../data/mockData';
import '../styles/Dashboard.css';

export default function Dashboard({ onNavigate, user }) {
  const upcomingSessions = mockSessions.filter(
    session =>
      session.participants.some(p => p.id === currentUser.id) &&
      new Date(session.scheduledAt) > new Date()
  );

  const stats = [
    { label: '参加セッション数', value: '12', icon: Users, color: 'bg-blue-500' },
    { label: '今月の参加回数', value: '4', icon: Calendar, color: 'bg-green-500' },
    { label: '平均評価スコア', value: '4.2', icon: Trophy, color: 'bg-yellow-500' },
    { label: '成長率', value: '+15%', icon: TrendingUp, color: 'bg-purple-500' }
  ];

  const recommendedSessions = mockSessions.filter(
    session =>
      session.status === 'recruiting' &&
      !session.participants.some(p => p.id === currentUser.id)
  );

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
              <div className={`stat-icon ${stat.color}`}>
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
        {/* Upcoming Sessions */}
        <div className="session-box animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="session-box-header">
            <h2 className="session-box-title">参加予定のセッション</h2>
          </div>
          <div className="session-box-body">
            {upcomingSessions.length > 0 ? (
              <div className="session-list">
                {upcomingSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="session-item animate-slide-up"
                    style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                  >
                    <div className="session-item-header">
                      <h3 className="session-title">{session.title}</h3>
                      <span className={`session-tag ${
                        session.difficulty === 'beginner' ? 'diff-beginner' :
                        session.difficulty === 'intermediate' ? 'diff-intermediate' :
                        'diff-advanced'
                      }`}>
                        {session.difficulty === 'beginner' ? '初級' :
                        session.difficulty === 'intermediate' ? '中級' : '上級'}
                      </span>
                    </div>
                    <div className="session-item-info">
                      <div><Calendar className="icon-small" />{new Date(session.scheduledAt).toLocaleDateString('ja-JP')}</div>
                      <div><Clock className="icon-small" />{session.duration}分</div>
                      <div>
                        {session.location === 'online' ? (
                          <><Video className="icon-small" />オンライン</>
                        ) : (
                          <><MapPin className="icon-small" />オフライン</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="session-empty animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <Calendar className="icon-large" />
                <p>参加予定のセッションがありません</p>
                <button onClick={() => onNavigate('sessions')} className="button-primary">
                  セッションを探す
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Sessions */}
        <div className="session-box animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="session-box-header">
            <h2 className="session-box-title">おすすめのセッション</h2>
          </div>
          <div className="session-box-body">
            <div className="session-list">
              {recommendedSessions.slice(0, 3).map((session, index) => (
                <div
                  key={session.id}
                  className="session-item clickable animate-slide-up"
                  style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                >
                  <div className="session-item-header">
                    <h3 className="session-title">{session.title}</h3>
                    <span className="participant-count">
                      {session.currentParticipants}/{session.maxParticipants}人
                    </span>
                  </div>
                  <p className="session-description">{session.description}</p>
                  <div className="session-tags">
                    {session.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="session-footer">
                    <div className="session-date">
                      <Calendar className="icon-small" />
                      {new Date(session.scheduledAt).toLocaleDateString('ja-JP')}
                    </div>
                    <button className="button-secondary">参加する</button>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
