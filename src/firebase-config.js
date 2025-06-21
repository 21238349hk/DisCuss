// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 設定（あなたのプロジェクトのものを貼り付け）
const firebaseConfig = {
  apiKey: "AIzaSyCamsvSPckzFQA5QZpkeTdPSKQQ8YBhelI",
  authDomain: "gd-tanyao.firebaseapp.com",
  projectId: "gd-tanyao",
  storageBucket: "gd-tanyao.firebasestorage.app",
  messagingSenderId: "523149200962",
  appId: "1:523149200962:web:06684dc91ef1c630b5a7db",
  measurementId: "G-EB2Y1Q9Y2M"
};

// Firebase を初期化
const app = initializeApp(firebaseConfig);

// 利用したい機能をエクスポート
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };