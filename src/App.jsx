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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      return <div className="loading-screen">Loading...</div>;
    }

    if (!user) {
      return <Login onNavigate={setCurrentPage} setUser={setUser} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} user={userProfile} />;
      case 'sessions':
        return <SessionList onNavigate={setCurrentPage} />;
      case 'create':
        return (
          <div className="session-form-container">
              <CreateSession onNavigate={setCurrentPage} />
          </div>
        );
      case 'profile':
        return <Profile onNavigate={setCurrentPage} user={user} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} user={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header currentPage={currentPage} onNavigate={setCurrentPage} user={user} />}
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;
