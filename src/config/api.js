// API設定ファイル
export const API_CONFIG = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  ZOOM_CLIENT_ID: import.meta.env.VITE_ZOOM_CLIENT_ID,
  ZOOM_CLIENT_SECRET: import.meta.env.VITE_ZOOM_CLIENT_SECRET,
  ZOOM_ACCOUNT_ID: import.meta.env.VITE_ZOOM_ACCOUNT_ID,
};

// Gemini APIを直接呼び出す関数
export const callGeminiAPI = async (message) => {
  if (!API_CONFIG.GEMINI_API_KEY) {
    throw new Error('Gemini APIキーが設定されていません');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `あなたは就活中の学生に対して、グループディスカッション（GD）対策の相談に答えるAIです。企業がGDで何を見ているのか、面接との違いなどを、やさしく・実践的にアドバイスしてください。文字数は多くならないように気をつけてください\n\n${message}`
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('Gemini API呼び出しに失敗しました');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// Zoom APIのアクセストークンを取得する関数
export const getZoomAccessToken = async () => {
  if (!API_CONFIG.ZOOM_CLIENT_ID || !API_CONFIG.ZOOM_CLIENT_SECRET || !API_CONFIG.ZOOM_ACCOUNT_ID) {
    throw new Error('Zoomの認証情報が設定されていません');
  }

  const auth = btoa(`${API_CONFIG.ZOOM_CLIENT_ID}:${API_CONFIG.ZOOM_CLIENT_SECRET}`);

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: API_CONFIG.ZOOM_ACCOUNT_ID,
    })
  });

  if (!response.ok) {
    throw new Error('Zoomアクセストークンの取得に失敗しました');
  }

  const data = await response.json();
  return data.access_token;
};

// Zoomミーティングを作成する関数
export const createZoomMeeting = async (topic) => {
  const accessToken = await getZoomAccessToken();

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: topic,
      type: 2, // スケジュールされたミーティング
      duration: 60,
      settings: {
        join_before_host: true,
        waiting_room: false,
        approval_type: 2, // 登録不要
      },
    })
  });

  if (!response.ok) {
    throw new Error('Zoomミーティングの作成に失敗しました');
  }

  const data = await response.json();
  return data.join_url;
}; 