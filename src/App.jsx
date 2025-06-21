import React, { useState, useEffect } from 'react'; // 【修正】useEffectをインポート
import { auth, db } from './firebase'; // 【変更】dbをインポート
import { onAuthStateChanged } from 'firebase/auth'; // 【追加】onAuthStateChangedをインポート
import { doc, getDoc } from 'firebase/firestore'; // 【追加】Firestoreの関数をインポート

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // 【変更】asyncを追加
      if (currentUser) {
        setUser(currentUser);
        // 【追加】プロフィール存在チェック
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // プロフィールが存在する場合、ダッシュボードへ
          setCurrentPage('dashboard');
        } else {
          // プロフィールが存在しない場合、プロフィール設定ページへ
          console.log("プロフィールが見つかりません。作成ページに移動します。");
          setCurrentPage('profile');
        }
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
        return <Profile onNavigate={setCurrentPage} user={user} />; // userを渡す
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