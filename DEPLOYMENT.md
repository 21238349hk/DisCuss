# デプロイ時の環境変数設定

このプロジェクトは`.env`ファイルをGitに含めないため、デプロイ先で環境変数を設定する必要があります。

## デプロイ先別の設定方法

### 1. Vercel でのデプロイ

1. Vercelダッシュボードでプロジェクトを開く
2. Settings → Environment Variables に移動
3. 以下の環境変数を追加：
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ZOOM_CLIENT_ID=your_zoom_client_id_here
   VITE_ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
   VITE_ZOOM_ACCOUNT_ID=your_zoom_account_id_here
   ```
4. Production, Preview, Development すべての環境に適用

### 2. Netlify でのデプロイ

1. Netlifyダッシュボードでプロジェクトを開く
2. Site settings → Environment variables に移動
3. 以下の環境変数を追加：
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ZOOM_CLIENT_ID=your_zoom_client_id_here
   VITE_ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
   VITE_ZOOM_ACCOUNT_ID=your_zoom_account_id_here
   ```

### 3. Firebase Hosting でのデプロイ

1. Firebase Consoleでプロジェクトを開く
2. Functions → Configuration → Environment variables に移動
3. 以下の環境変数を追加：
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ZOOM_CLIENT_ID=your_zoom_client_id_here
   VITE_ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
   VITE_ZOOM_ACCOUNT_ID=your_zoom_account_id_here
   ```

### 4. GitHub Pages でのデプロイ

GitHub Pagesでは環境変数を直接設定できないため、以下の方法を使用：

#### 方法A: GitHub Secrets + GitHub Actions
1. リポジトリのSettings → Secrets and variables → Actions
2. 以下のSecretsを追加：
   ```
   VITE_GEMINI_API_KEY
   VITE_ZOOM_CLIENT_ID
   VITE_ZOOM_CLIENT_SECRET
   VITE_ZOOM_ACCOUNT_ID
   ```
3. `.github/workflows/deploy.yml`を作成（下記参照）

#### 方法B: ビルド時に環境変数を埋め込み
```bash
# ビルド時に環境変数を設定
VITE_GEMINI_API_KEY=your_key npm run build
```

## GitHub Actions での自動デプロイ例

`.github/workflows/deploy.yml`を作成：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      env:
        VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
        VITE_ZOOM_CLIENT_ID: ${{ secrets.VITE_ZOOM_CLIENT_ID }}
        VITE_ZOOM_CLIENT_SECRET: ${{ secrets.VITE_ZOOM_CLIENT_SECRET }}
        VITE_ZOOM_ACCOUNT_ID: ${{ secrets.VITE_ZOOM_ACCOUNT_ID }}
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## ローカル開発時の設定

開発時は`.env`ファイルを使用：

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_ZOOM_CLIENT_ID=your_zoom_client_id_here
VITE_ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
VITE_ZOOM_ACCOUNT_ID=your_zoom_account_id_here
```

## セキュリティのベストプラクティス

1. **APIキーのローテーション**: 定期的にAPIキーを更新
2. **最小権限の原則**: 必要最小限の権限のみを付与
3. **環境分離**: 開発・ステージング・本番で異なるAPIキーを使用
4. **監査ログ**: APIキーの使用状況を定期的に確認

## トラブルシューティング

### 環境変数が読み込まれない場合

1. 環境変数名が`VITE_`で始まっているか確認
2. デプロイ後にキャッシュをクリア
3. ブラウザの開発者ツールで環境変数を確認

### CORSエラーが発生する場合

1. `vite.config.ts`のプロキシ設定を確認
2. APIキーが正しく設定されているか確認
3. 必要に応じてCORS設定を調整 