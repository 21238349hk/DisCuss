import React from 'react';
// 【変更】Firebaseから認証関連の機能をインポート
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// 【変更】App.jsxから渡されるprops（onNavigate, setUser）を受け取る
const Login = ({ onNavigate, setUser }) => {
  // 【追加】Googleログインを実行する関数
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // signInWithPopupでGoogle認証のポップアップを表示
      const result = await signInWithPopup(auth, provider);
      // ログインに成功したら、ユーザー情報をAppコンポーネントのstateに保存
      setUser(result.user);
      // ダッシュボードへ画面遷移
      onNavigate('dashboard');
    } catch (error) {
      console.error("Googleログイン中にエラーが発生しました:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          ログイン
        </h2>
        <button
          onClick={handleGoogleLogin} // 【変更】クリックでhandleGoogleLogin関数を呼び出す
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
};

export default Login;