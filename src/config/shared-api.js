// 共有APIキー設定ファイル
// 注意: この方法はセキュリティリスクがあります

// 共有APIキー（本番環境では環境変数から取得）
const SHARED_API_KEYS = {
  GEMINI_API_KEY: import.meta.env.VITE_SHARED_GEMINI_API_KEY || 'your_shared_gemini_key',
  ZOOM_CLIENT_ID: import.meta.env.VITE_SHARED_ZOOM_CLIENT_ID || 'your_shared_zoom_client_id',
  ZOOM_CLIENT_SECRET: import.meta.env.VITE_SHARED_ZOOM_CLIENT_SECRET || 'your_shared_zoom_client_secret',
  ZOOM_ACCOUNT_ID: import.meta.env.VITE_SHARED_ZOOM_ACCOUNT_ID || 'your_shared_zoom_account_id',
};

// デバッグ用: 環境変数の確認
console.log('Shared API Keys Status:', {
  GEMINI_API_KEY: SHARED_API_KEYS.GEMINI_API_KEY ? '✅ Set' : '❌ Not Set',
  ZOOM_CLIENT_ID: SHARED_API_KEYS.ZOOM_CLIENT_ID ? '✅ Set' : '❌ Not Set',
  ZOOM_CLIENT_SECRET: SHARED_API_KEYS.ZOOM_CLIENT_SECRET ? '✅ Set' : '❌ Not Set',
  ZOOM_ACCOUNT_ID: SHARED_API_KEYS.ZOOM_ACCOUNT_ID ? '✅ Set' : '❌ Not Set',
});

// 使用量制限の設定
const USAGE_LIMITS = {
  MAX_REQUESTS_PER_DAY: 1000, // 1日あたりの最大リクエスト数
  MAX_REQUESTS_PER_USER: 50,  // ユーザーあたりの最大リクエスト数
};

// ローカルストレージを使用した使用量追跡
const getUsageKey = (userId) => `api_usage_${userId}`;
const getDailyKey = () => `api_usage_${new Date().toDateString()}`;

// 使用量をチェックする関数
const checkUsageLimit = (userId) => {
  const usageKey = getUsageKey(userId);
  const dailyKey = getDailyKey();
  
  const userUsage = parseInt(localStorage.getItem(usageKey) || '0');
  const dailyUsage = parseInt(localStorage.getItem(dailyKey) || '0');
  
  if (userUsage >= USAGE_LIMITS.MAX_REQUESTS_PER_USER) {
    throw new Error('ユーザーあたりの使用量制限に達しました');
  }
  
  if (dailyUsage >= USAGE_LIMITS.MAX_REQUESTS_PER_DAY) {
    throw new Error('1日あたりの使用量制限に達しました');
  }
  
  return true;
};

// 使用量を更新する関数
const updateUsage = (userId) => {
  const usageKey = getUsageKey(userId);
  const dailyKey = getDailyKey();
  
  const userUsage = parseInt(localStorage.getItem(usageKey) || '0');
  const dailyUsage = parseInt(localStorage.getItem(dailyKey) || '0');
  
  localStorage.setItem(usageKey, (userUsage + 1).toString());
  localStorage.setItem(dailyKey, (dailyUsage + 1).toString());
};

// 共有Gemini APIを呼び出す関数
export const callSharedGeminiAPI = async (message, userId = 'anonymous') => {
  try {
    // 使用量制限をチェック
    checkUsageLimit(userId);
    
    if (!SHARED_API_KEYS.GEMINI_API_KEY) {
      throw new Error('共有Gemini APIキーが設定されていません');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${SHARED_API_KEYS.GEMINI_API_KEY}`, {
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
    
    // 使用量を更新
    updateUsage(userId);
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('共有Gemini APIエラー:', error);
    throw error;
  }
};

// 共有Zoom APIのアクセストークンを取得する関数
export const getSharedZoomAccessToken = async () => {
  if (!SHARED_API_KEYS.ZOOM_CLIENT_ID || !SHARED_API_KEYS.ZOOM_CLIENT_SECRET || !SHARED_API_KEYS.ZOOM_ACCOUNT_ID) {
    throw new Error('共有Zoomの認証情報が設定されていません');
  }

  // デバッグ用: 認証情報の確認（機密情報は一部マスク）
  console.log('Zoom Auth Debug:', {
    CLIENT_ID: SHARED_API_KEYS.ZOOM_CLIENT_ID.substring(0, 10) + '...',
    CLIENT_SECRET: SHARED_API_KEYS.ZOOM_CLIENT_SECRET.substring(0, 10) + '...',
    ACCOUNT_ID: SHARED_API_KEYS.ZOOM_ACCOUNT_ID,
    ACCOUNT_ID_LENGTH: SHARED_API_KEYS.ZOOM_ACCOUNT_ID.length
  });

  const auth = btoa(`${SHARED_API_KEYS.ZOOM_CLIENT_ID}:${SHARED_API_KEYS.ZOOM_CLIENT_SECRET}`);

  try {
    // Viteのプロキシを使用してCORS問題を回避
    const response = await fetch('/api/zoom/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: SHARED_API_KEYS.ZOOM_ACCOUNT_ID,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Zoom OAuth Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        requestHeaders: {
          'Authorization': `Basic ${auth.substring(0, 20)}...`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        requestBody: {
          grant_type: 'account_credentials',
          account_id: SHARED_API_KEYS.ZOOM_ACCOUNT_ID,
        }
      });
      throw new Error(`Zoomアクセストークンの取得に失敗しました: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Zoom OAuth Success:', {
      access_token: data.access_token ? '✅ Received' : '❌ Missing',
      token_type: data.token_type,
      expires_in: data.expires_in
    });
    return data.access_token;
  } catch (error) {
    console.error('Zoom OAuth Request Error:', error);
    throw new Error(`Zoomアクセストークンの取得に失敗しました: ${error.message}`);
  }
};

// 共有Zoomミーティングを作成する関数
export const createSharedZoomMeeting = async (topic, userId = 'anonymous') => {
  try {
    // 使用量制限をチェック
    checkUsageLimit(userId);
    
    console.log('Creating Zoom meeting with topic:', topic);
    
    const accessToken = await getSharedZoomAccessToken();
    console.log('Zoom access token obtained successfully');

    const meetingData = {
      topic: topic,
      type: 2, // スケジュールされたミーティング
      duration: 60,
      settings: {
        join_before_host: true,
        waiting_room: false,
        approval_type: 2, // 登録不要
      },
    };

    console.log('Sending meeting creation request with data:', meetingData);

    // Viteのプロキシを使用してCORS問題を回避
    const response = await fetch('/api/zoom/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Zoom Meeting Creation Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Zoomミーティングの作成に失敗しました: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Zoom meeting created successfully:', data);
    
    // 使用量を更新
    updateUsage(userId);
    
    return data.join_url;
  } catch (error) {
    console.error('共有Zoom APIエラー:', error);
    throw error;
  }
};

// 使用量をリセットする関数（管理者用）
export const resetUsage = (userId = null) => {
  if (userId) {
    localStorage.removeItem(getUsageKey(userId));
  } else {
    // 全ユーザーの使用量をリセット
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_usage_')) {
        localStorage.removeItem(key);
      }
    });
  }
}; 