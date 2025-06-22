import os
import requests
import base64
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# .envファイルから環境変数を読み込む
load_dotenv()

app = Flask(__name__)
# フロントエンドからのリクエストを許可する（ポート5174も追加）
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174"
        ]
    }
})

# Zoom APIの新しい認証情報
ZOOM_CLIENT_ID = os.getenv("ZOOM_CLIENT_ID")
ZOOM_CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET")
ZOOM_ACCOUNT_ID = os.getenv("ZOOM_ACCOUNT_ID")

# Gemini API設定
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_zoom_access_token():
    """Zoom APIのServer-to-Server OAuthアクセストークンを取得する"""
    if not all([ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_ACCOUNT_ID]):
        raise ValueError("Zoomの認証情報が.envファイルに設定されていません。")

    auth = base64.b64encode(f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}".encode()).decode()
    headers = {'Authorization': f'Basic {auth}'}
    params = {'grant_type': 'account_credentials', 'account_id': ZOOM_ACCOUNT_ID}
    
    response = requests.post(
        'https://zoom.us/oauth/token',
        headers=headers,
        params=params
    )
    response.raise_for_status()
    return response.json()['access_token']

@app.route('/')
def hello_world():
    return 'Hello from DisCuss Backend!'

@app.route('/api/ask-gemini', methods=['POST'])
def ask_gemini():
    """Gemini APIを使用してAIチャットを処理するエンドポイント"""
    try:
        if not GEMINI_API_KEY:
            return jsonify({"error": "Gemini APIキーが設定されていません"}), 500

        data = request.json
        message = data.get('message', '')
        
        if not message:
            return jsonify({"error": "メッセージが提供されていません"}), 400

        # Gemini APIを呼び出し
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""あなたは就活中の学生に対して、グループディスカッション（GD）対策の相談に答えるAIです。企業がGDで何を見ているのか、面接との違いなどを、やさしく・実践的にアドバイスしてください。文字数は多くならないように気をつけてください

{message}"""
        
        response = model.generate_content(prompt)
        reply = response.text

        return jsonify({"reply": reply})

    except Exception as e:
        print(f"Gemini APIエラー: {e}")
        return jsonify({"error": f"Gemini API呼び出しに失敗しました: {str(e)}"}), 500

@app.route('/api/create-zoom-meeting', methods=['POST'])
def create_zoom_meeting():
    """Zoomミーティングを作成し、参加URLを返すAPIエンドポイント"""
    try:
        access_token = get_zoom_access_token()
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        session_data = request.json or {}
        topic = session_data.get('topic', '新規ディスカッションセッション')

        response = requests.post(
            'https://api.zoom.us/v2/users/me/meetings',
            headers=headers,
            json={
                'topic': topic,
                'type': 2,  # スケジュールされたミーティング
                'duration': 60,
                'settings': {
                    'join_before_host': True,
                    'waiting_room': False,
                    'approval_type': 2, # 登録不要
                }
            }
        )
        response.raise_for_status()
        meeting_data = response.json()
        return jsonify({"join_url": meeting_data.get('join_url')})

    except ValueError as e:
        print(f"設定エラー: {e}")
        return jsonify({"error": str(e)}), 500
    except requests.exceptions.RequestException as e:
        print(f"Zoom APIへのリクエストに失敗しました: {e}")
        error_details = e.response.json() if e.response else "不明なエラー"
        return jsonify({
            "error": "Zoomミーティングの作成に失敗しました。認証情報やAPIの権限を確認してください。",
            "details": error_details
        }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
