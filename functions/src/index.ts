/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest, onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import cors from "cors";
import {GoogleGenerativeAI} from "@google/generative-ai";
import * as functions from "firebase-functions";

// CORSミドルウェアを初期化
const corsHandler = cors({origin: true});

// 環境変数を定義（Firebaseに設定した大文字のキー名に合わせる）
const ZOOM_CLIENT_ID = functions.config().zoom?.client_id;
const ZOOM_CLIENT_SECRET = functions.config().zoom?.client_secret;
const ZOOM_ACCOUNT_ID = functions.config().zoom?.account_id;
const GEMINI_API_KEY = functions.config().gemini?.api_key;

// Google Generative AIを初期化
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

/**
 * AIチャット機能の呼び出し可能関数
 */
export const askGemini = onCall(async (request) => {
  try {
    const {message} = request.data;
    
    if (!message) {
      throw new Error("メッセージが提供されていません");
    }

    if (!GEMINI_API_KEY) {
      throw new Error("Gemini APIキーが設定されていません");
    }

    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
    
    const result = await model.generateContent(`あなたは就活中の学生に対して、グループディスカッション（GD）対策の相談に答えるAIです。企業がGDで何を見ているのか、面接との違いなどを、やさしく・実践的にアドバイスしてください。文字数は多くならないように気をつけてください\n\n${message}`);
    const response = await result.response;
    const text = response.text();

    logger.info("AIチャットが正常に実行されました");
    
    return {
      success: true,
      response: text
    };
  } catch (error) {
    logger.error("AIチャットでエラーが発生しました:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
});

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
