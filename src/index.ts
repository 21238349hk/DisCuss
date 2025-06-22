// ... existing code ...
    throw new Error("Failed to get Zoom access token.");
  }
}

/**
 * Zoomミーティング作成のHTTPトリガー関数 (v2)
 */
export const createZoomMeeting = onRequest(
  { cors: true, secrets: [ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_ACCOUNT_ID] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const accessToken = await getZoomAccessToken();
      const { topic = "新規ディスカッションセッション", sessionId } = req.body;

      if (!sessionId) {
        res.status(400).send("Bad Request: sessionId is required.");
        return;
      }

      const zoomResponse = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          topic: topic,
          type: 2,
          duration: 60,
          settings: {
            join_before_host: true,
            waiting_room: false,
            approval_type: 2,
            auto_recording: "cloud",
          },
        },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info("Zoomミーティングが正常に作成されました。");
      res.status(200).json({ join_url: zoomResponse.data.join_url });
    } catch (error) {
      logger.error("Zoomミーティングの作成に失敗しました:", error);
      res.status(500).json({
        error: "Zoomミーティングの作成に失敗しました。",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Gemini AIとチャットする呼び出し可能関数 (v2)
 */
// ... existing code ... 