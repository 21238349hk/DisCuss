import React, { useState, useEffect } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import '../styles/Header.css';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config'; 

export default function Header({ currentPage, onNavigate, user, userProfile, searchQuery, setSearchQuery }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigation = [
    { name: 'ダッシュボード', key: 'dashboard' },
    { name: 'セッション一覧', key: 'sessions' },
    { name: 'セッション作成', key: 'create' },
    { name: 'AI相談/GD', key: 'ai-chat' },
<<<<<<< Updated upstream
    { name: 'プロフィール', key: 'profile' },
=======
    { name: 'プロフィール', key: 'profile' }
>>>>>>> Stashed changes
  ];

  useEffect(() => {
    if (!user || !user.email) return;

    const q = query(
      collection(db, 'notifications'),
      where('userEmail', '==', user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(" snapshot size:", snapshot.size);
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(" 通知取得:", notifs);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });


    return () => unsubscribe();
  }, [user]);



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
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification__item ${!notification.read ? 'notification__item--unread' : ''}`}
                      >
                        <h4 className="notification__title">{notification.sessionTitle}</h4>
                        <p className="notification__message">
                          {notification.requesterEmail} が {notification.type} を申請しました
                        </p>
                        <p className="notification__time">
                          {new Date(notification.timestamp.toDate()).toLocaleString('ja-JP')}
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
