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

app.post('/api/ask-gemini', async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash' // ←モデル名
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `あなたは就活中の学生に対して、グループディスカッション（GD）対策の相談に答えるAIです。企業がGDで何を見ているのか、面接との違いなどを、やさしく・実践的にアドバイスしてください。文字数は多くならないように気をつけてください
\n\n${message}`
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
