# Zoom Account ID の正しい取得方法

## 現在の問題
Account ID: `8byOj7EaSguQQsGu-T53Vw` にハイフンが含まれており、これが400 Bad Requestエラーの原因の可能性があります。

## 正しいAccount IDの取得方法

### 方法1: Zoom Web から取得
1. [Zoom Web](https://zoom.us/) にログイン
2. 右上のプロフィール画像をクリック
3. **"Account"** を選択
4. **"Account ID"** を確認（通常は数字のみ）

### 方法2: Zoom App Marketplace から取得
1. [Zoom App Marketplace](https://marketplace.zoom.us/) にアクセス
2. 作成したアプリを開く
3. **"App Credentials"** タブで **"Account ID"** を確認

### 方法3: Zoom API から取得
```bash
# 現在のAccount IDでAPIをテスト
curl -X GET "https://api.zoom.us/v2/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 正しいAccount IDの形式
- ✅ 正しい例: `1234567890` (数字のみ)
- ✅ 正しい例: `abc123def456` (英数字混合)
- ❌ 問題の可能性: `8byOj7EaSguQQsGu-T53Vw` (ハイフン含む)

## 修正手順
1. 正しいAccount IDを取得
2. Firebase Configを更新:
   ```bash
   firebase functions:config:set zoom.account_id="正しいAccount ID"
   ```
3. Functionsを再デプロイ:
   ```bash
   firebase deploy --only functions
   ```

## テスト方法
Account IDを修正後、以下のコマンドでテスト:
```bash
# 環境変数を確認
firebase functions:config:get

# Functionsをテスト
curl -X POST "https://us-central1-gd-tanyao.cloudfunctions.net/createZoomMeeting" \
  -H "Content-Type: application/json" \
  -d '{"topic": "test meeting"}'
``` 