/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import cors from "cors";
import * as dotenv from "dotenv";

// .envファイルから環境変数を読み込み
dotenv.config();

// CORSミドルウェアを初期化
const corsHandler = cors({origin: true});

// 環境変数を定義（Firebaseに設定した大文字のキー名に合わせる）
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;

/**
 * Zoom APIのアクセストークンを取得する関数
 */
async function getZoomAccessToken() {
  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    logger.error("Zoomの認証情報が環境変数に設定されていません。");
    throw new Error("Zoom API credentials are not set.");
  }

  const auth = Buffer.from(
    `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`,
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      null,
      {
        params: {
          grant_type: "account_credentials",
          account_id: ZOOM_ACCOUNT_ID,
        },
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );
    return response.data.access_token;
  } catch (error) {
    logger.error("Zoomアクセストークンの取得に失敗しました:", error);
    throw new Error("Failed to get Zoom access token.");
  }
}

/**
 * Zoomミーティング作成のHTTPトリガー関数
 */
export const createZoomMeeting = onRequest({
  // フロントエンド(http://localhost:5173など)からのアクセスを許可
  cors: true,
}, async (req, res) => {
  // CORSを手動で処理
  corsHandler(req, res, async () => {
    // POST以外のメソッドを拒否
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const accessToken = await getZoomAccessToken();
      const topic = req.body.topic || "新規ディスカッションセッション";

      const zoomResponse = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          topic: topic,
          type: 2, // スケジュールされたミーティング
          duration: 60,
          settings: {
            join_before_host: true,
            waiting_room: false,
            approval_type: 2, // 登録不要
          },
        },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      logger.info("Zoomミーティングが正常に作成されました。");
      res.status(200).json({join_url: zoomResponse.data.join_url});
    } catch (error) {
      logger.error("Zoomミーティングの作成に失敗しました:", error);
      res.status(500).json({
        error: "Zoomミーティングの作成に失敗しました。",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
});
