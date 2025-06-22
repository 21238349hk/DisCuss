// バックエンドサーバーを使用したAPI設定
const BACKEND_URL = 'http://localhost:5001';

// バックエンドを使用したGemini API呼び出し
export const callBackendGeminiAPI = async (message) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ask-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Gemini API呼び出しに失敗しました');
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Backend Gemini API Error:', error);
    throw error;
  }
};

// バックエンドを使用したZoom API呼び出し
export const createBackendZoomMeeting = async (topic) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/create-zoom-meeting`, {
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
    console.error('Backend Zoom API Error:', error);
    throw error;
  }
}; 