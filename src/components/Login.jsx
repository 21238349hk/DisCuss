import React from 'react';
// 【変更】Firebaseから認証関連の機能をインポート
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// 【変更】App.jsxから渡されるpropsを受け取る
const Login = ({ onNavigate, setUser }) => {
  // 【追加】Googleログイン処理
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // ログイン成功後、ユーザー情報をセット
      setUser(result.user);
      // ダッシュボードへ遷移
      onNavigate('dashboard');
    } catch (error) {
      console.error("Googleログインエラー:", error);
      // エラー処理（必要に応じてUIにエラーメッセージを表示するなど）
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          ログイン
        </h2>
        <button
          onClick={handleGoogleLogin} // 【変更】クリックイベントにログイン処理を紐付け
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
};

export default Login;