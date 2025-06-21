import React, { useState, useEffect } from 'react'; // 【修正】useEffectをインポート
import { auth } from './firebase'; // 【追加】firebase.jsからauthをインポート
import { onAuthStateChanged } from 'firebase/auth'; // 【追加】onAuthStateChangedをインポート

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SessionList from './components/SessionList';
import CreateSession from './components/CreateSession';
import Profile from './components/Profile';
import Login from './components/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 【追加】ローディング状態を管理

  // 【追加】認証状態を監視する副作用フック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setCurrentPage('dashboard');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderCurrentPage = () => {
    // 【変更】ローディング中はローディング表示
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    // 【変更】ログイン状態に応じて表示を切り替え
    // ログインしていなければLoginコンポーネントを表示
    if (!user) {
      // onNavigateとsetUserを渡す
      return <Login onNavigate={setCurrentPage} setUser={setUser} />;
    }

    // ログインしていればcurrentPageに応じたコンポーネントを表示
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'sessions':
        return <SessionList onNavigate={setCurrentPage} />;
      case 'create':
        return <CreateSession onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      default:
        // デフォルトはダッシュボードへ
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ログインしている時だけヘッダーを表示 */}
      {user && <Header currentPage={currentPage} onNavigate={setCurrentPage} user={user} />}
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;