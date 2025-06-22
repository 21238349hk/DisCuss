# フロントエンドのみでの動作設定

このプロジェクトは現在、フロントエンドのみで動作するように修正されています。

## 必要な環境変数の設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の環境変数を設定してください：

```env
# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Zoom API
VITE_ZOOM_CLIENT_ID=your_zoom_client_id_here
VITE_ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
VITE_ZOOM_ACCOUNT_ID=your_zoom_account_id_here
```

## APIキーの取得方法

### Gemini API
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. APIキーを作成
3. 作成したAPIキーを `VITE_GEMINI_API_KEY` に設定

### Zoom API
1. [Zoom App Marketplace](https://marketplace.zoom.us/) にアクセス
2. 新しいアプリを作成（Server-to-Server OAuth）
3. 以下の情報を取得：
   - Client ID → `VITE_ZOOM_CLIENT_ID`
   - Client Secret → `VITE_ZOOM_CLIENT_SECRET`
   - Account ID → `VITE_ZOOM_ACCOUNT_ID`

## 起動方法

環境変数を設定後、以下のコマンドでフロントエンドを起動できます：

```bash
npm run dev
```

バックエンドサーバーを起動する必要はありません。

## 注意事項

- 環境変数は `VITE_` プレフィックスが必要です（Viteの仕様）
- APIキーは公開リポジトリにコミットしないでください
- `.env` ファイルは `.gitignore` に含まれていることを確認してください 