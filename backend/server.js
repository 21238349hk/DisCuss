// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- 通常のAI相談モード ----
app.post('/api/ask-gemini', async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `ユーザは就活中の大学生です。グループディスカッション（GD）対策の相談に答えるAIです。企業がGDで何を見ているのか、面接との違いなどを、やさしく・実践的にアドバイスしてください。コンパクトな発言を心がけてください。\n\n${message}`
            }
          ]
        }
      ]
    });

    const response = result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('❌ Gemini API Error:', err.response?.data || err.message || err);
    res.status(500).json({ reply: 'エラー：Gemini API呼び出しに失敗しました。' });
  }
});

// ---- AIGDモード（AI2人の返答） ----
app.post('/api/ask-gemini-gd', async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    // AI 1 の応答
    const responseA = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `あなたはAI A（エージェント1）です。ユーザとAI Bとグループディスカッションをします．ユーザの発言に対してGDっぽい発言をしてください\n${message}`
            }
          ]
        }
      ]
    });
    const replyA = responseA.response.text();

    // AI 2 の応答（AI Aの発言に対して）
    const responseB = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `あなたはAI B（エージェント2）です。AI Aの意見「${replyA}」を受けて、別の意見または補足を行ってください。`
            }
          ]
        }
      ]
    });
    const replyB = responseB.response.text();

    res.json({
      replies: [
        { role: 'ai1', text: replyA },
        { role: 'ai2', text: replyB }
      ]
    });
  } catch (err) {
    console.error('❌ AIGD API Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'AIGDモード呼び出しに失敗しました。' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
