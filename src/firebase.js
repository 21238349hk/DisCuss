// Firebase SDKから必要な関数をインポート
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 【追加】Firestoreのインポートを元に戻す
import { getFunctions } from "firebase/functions";

// ご自身のFirebaseプロジェクトの設定情報に置き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyCamsvSPckzFQA5QZpkeTdPSKQQ8YBhelI",
  authDomain: "gd-tanyao.firebaseapp.com",
  projectId: "gd-tanyao",
  storageBucket: "gd-tanyao.firebasestorage.app",
  messagingSenderId: "523149200962",
  appId: "1:523149200962:web:06684dc91ef1c630b5a7db",
  measurementId: "G-EB2Y1Q9Y2M"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// Firebaseの各サービスへの参照を取得してエクスポート
// これにより、他のコンポーネントから簡単に利用できるようになる
export const auth = getAuth(app);
export const db = getFirestore(app); // 【追加】dbのエクスポートを元に戻す
export const functions = getFunctions(app);