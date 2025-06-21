import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SessionList from './components/SessionList';
import CreateSession from './components/CreateSession';
import Profile from './components/Profile';
import Login from './components/Login';

import '../src/styles/App.css'; 

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(null); // これが抜けていた場合、追加してください

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          setCurrentPage('dashboard');
        } else {
          console.log("プロフィールが見つかりません。作成ページに移動します。");
          setCurrentPage('profile');
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setCurrentPage('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderCurrentPage = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
      return <Login onNavigate={setCurrentPage} setUser={setUser} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} user={user} />;
      case 'sessions':
        return (
          <SessionList
            onNavigate={setCurrentPage}
            searchQuery={searchQuery}
          />
        );
      case 'create':
        return <CreateSession onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} user={user} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <Header
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          userProfile={userProfile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;
