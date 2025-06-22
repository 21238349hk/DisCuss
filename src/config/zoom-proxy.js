// Zoom APIプロキシ関数
// CORS問題を回避するため、環境変数を使用してサーバーサイドでAPIを呼び出す

// 開発環境用の簡易プロキシ（本番環境では適切なバックエンドを使用）
export const zoomProxy = {
  // OAuthトークン取得
  async getAccessToken(clientId, clientSecret, accountId) {
    // 開発環境では、ブラウザの制限を回避するため、
    // 環境変数を直接使用するか、別の方法を検討
    console.warn('Zoom APIのCORS問題により、直接呼び出しは制限されています');
    throw new Error('Zoom APIの直接呼び出しはCORS制限により制限されています。バックエンドプロキシが必要です。');
  },

  // ミーティング作成
  async createMeeting(accessToken, meetingData) {
    console.warn('Zoom APIのCORS問題により、直接呼び出しは制限されています');
    throw new Error('Zoom APIの直接呼び出しはCORS制限により制限されています。バックエンドプロキシが必要です。');
  }
};

// 代替案: モックデータを使用（開発・テスト用）
export const createMockZoomMeeting = async (topic) => {
  console.log('Mock Zoom meeting created for:', topic);
  // 実際のZoom URLの代わりにモックURLを返す
  return `https://zoom.us/j/123456789?pwd=mockpassword`;
};

// 代替案: 手動入力用のフォールバック
export const getManualZoomUrl = () => {
  return prompt('Zoom URLを手動で入力してください:') || '';
}; 