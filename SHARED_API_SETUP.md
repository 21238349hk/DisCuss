# 共有APIキー設定ガイド

このガイドでは、他の人が個別にAPIキーを作成せずに使用できる共有APIキーの設定方法を説明します。

## 共有APIキーのメリット・デメリット

### メリット
- ユーザーが個別にAPIキーを取得する必要がない
- 設定が簡単
- 管理者が使用量を一元管理できる

### デメリット
- セキュリティリスク（APIキーが露出する可能性）
- 使用量制限の管理が複雑
- 悪用されるリスク

## 設定方法

### 1. 共有APIキーの取得

#### Gemini API
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. APIキーを作成
3. 共有用のAPIキーとして使用

#### Zoom API
1. [Zoom App Marketplace](https://marketplace.zoom.us/) にアクセス
2. 新しいアプリを作成（Server-to-Server OAuth）
3. 共有用の認証情報を取得

### 2. 環境変数の設定

プロジェクトのルートディレクトリに `.env` ファイルを作成：

```env
# 共有APIキー
VITE_SHARED_GEMINI_API_KEY=your_shared_gemini_api_key_here
VITE_SHARED_ZOOM_CLIENT_ID=your_shared_zoom_client_id_here
VITE_SHARED_ZOOM_CLIENT_SECRET=your_shared_zoom_client_secret_here
VITE_SHARED_ZOOM_ACCOUNT_ID=your_shared_zoom_account_id_here
```

### 3. デプロイ時の設定

#### Vercel/Netlify
ダッシュボードで以下の環境変数を設定：
```
VITE_SHARED_GEMINI_API_KEY=your_shared_gemini_api_key_here
VITE_SHARED_ZOOM_CLIENT_ID=your_shared_zoom_client_id_here
VITE_SHARED_ZOOM_CLIENT_SECRET=your_shared_zoom_client_secret_here
VITE_SHARED_ZOOM_ACCOUNT_ID=your_shared_zoom_account_id_here
```

#### GitHub Pages
GitHub Secretsに以下を追加：
```
VITE_SHARED_GEMINI_API_KEY
VITE_SHARED_ZOOM_CLIENT_ID
VITE_SHARED_ZOOM_CLIENT_SECRET
VITE_SHARED_ZOOM_ACCOUNT_ID
```

## 使用量制限

共有APIキーには以下の制限が設定されています：

- **ユーザーあたり**: 1日50回まで
- **全体**: 1日1000回まで
- **制限に達した場合**: 翌日まで使用不可

## セキュリティ対策

### 1. APIキーの制限設定

#### Gemini API
- Google Cloud ConsoleでAPIキーの使用制限を設定
- 特定のドメインからのみアクセス可能に制限

#### Zoom API
- Zoom App Marketplaceでアプリの権限を最小限に設定
- 必要に応じてIPアドレス制限を設定

### 2. 使用量監視

- 定期的に使用量を確認
- 異常な使用パターンを検出
- 必要に応じてAPIキーをローテーション

### 3. バックアップAPIキー

- メインのAPIキーが制限に達した場合のバックアップを準備
- 複数のAPIキーをローテーションして使用

## トラブルシューティング

### 使用量制限エラー
```
ユーザーあたりの使用量制限に達しました
```
- 翌日まで待つ
- 管理者に連絡して制限を緩和してもらう

### APIキーエラー
```
共有Gemini APIキーが設定されていません
```
- 環境変数が正しく設定されているか確認
- デプロイ後にキャッシュをクリア

### CORSエラー
- `vite.config.ts`のプロキシ設定を確認
- 必要に応じてCORS設定を調整

## 管理者機能

### 使用量リセット
```javascript
import { resetUsage } from '../config/shared-api';

// 特定ユーザーの使用量をリセット
resetUsage('user_id');

// 全ユーザーの使用量をリセット
resetUsage();
```

### 使用量確認
```javascript
// ローカルストレージから使用量を確認
const userUsage = localStorage.getItem('api_usage_user_id');
const dailyUsage = localStorage.getItem('api_usage_2024-01-01');
```

## 推奨事項

1. **本番環境では共有APIキーの使用を避ける**
2. **定期的にAPIキーをローテーション**
3. **使用量監視を自動化**
4. **バックアップAPIキーを準備**
5. **セキュリティ監査を定期的に実施** 