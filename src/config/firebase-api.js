// Firebase Functionsを使用したAPI設定
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// Firebase Functionsを使用したGemini API呼び出し（既存の関数を使用）
export const callFirebaseGeminiAPI = async (message, userId = 'anonymous') => {
  try {
    // 既存のaskGemini関数を使用
    const askGemini = httpsCallable(functions, 'askGemini');
    const result = await askGemini({ message });
    const data = result.data;
    
    if (data.success) {
      return data.response;
    } else {
      throw new Error(data.error || 'API呼び出しに失敗しました');
    }
  } catch (error) {
    console.error('Firebase Gemini API Error:', error);
    throw error;
  }
};

// Firebase Functionsを使用したZoom API呼び出し（既存の関数を使用）
export const createFirebaseZoomMeeting = async (topic, userId = 'anonymous') => {
  try {
    // 既存のcreateZoomMeeting関数を使用
    const response = await fetch('https://us-central1-gd-tanyao.cloudfunctions.net/createZoomMeeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Zoomミーティングの作成に失敗しました');
    }

    const data = await response.json();
    return data.join_url;
  } catch (error) {
    console.error('Firebase Zoom API Error:', error);
    throw error;
  }
}; 