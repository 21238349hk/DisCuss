import React, { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import '../styles/Header.css';

export default function Header({ currentPage, onNavigate, user, userProfile, searchQuery, setSearchQuery }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const navigation = [
    { name: 'ダッシュボード', key: 'dashboard' },
    { name: 'セッション一覧', key: 'sessions' },
    { name: 'セッション作成', key: 'create' },
    { name: 'プロフィール', key: 'profile' }
  ];

  return (
    <header className="custom-header">
      <div className="header__container">
        <div className="header__row">
          <div className="header__logo">DisCuss</div>

          <nav className="header__nav">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`header__nav-item ${currentPage === item.key ? 'header__nav-item--active' : ''}`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="header__right">
            <div className="search-bar">
              <Search className="search-bar__icon" />
              <input
                type="text"
                className="search-bar__input"
                placeholder="セッションを検索..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onNavigate('sessions'); 
                }}
              />
            </div>

            <div className="notification">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification__button"
              >
                <Bell className="notification__icon" />
                {unreadCount > 0 && <span className="notification__badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notification__dropdown">
                  <div className="notification__header">通知</div>
                  <div className="notification__list">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification__item ${!notification.read ? 'notification__item--unread' : ''}`}
                      >
                        <h4 className="notification__title">{notification.title}</h4>
                        <p className="notification__message">{notification.message}</p>
                        <p className="notification__time">
                          {new Date(notification.createdAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('profile')}
              className="profile-button"
            >
              {userProfile && userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName} className="profile-button__avatar" />
              ) : (
                <div className="profile-button__avatar-placeholder">
                  <User size={20} />
                </div>
              )}
              <span className="profile-button__name">
                {userProfile ? userProfile.displayName : (user ? user.displayName : 'プロフィールを登録')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
