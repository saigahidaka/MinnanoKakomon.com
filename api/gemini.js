// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // POSTメソッド以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // データが空の場合のエラー処理を追加
  const { prompt, imageBase64 } = req.body;
  if (!prompt || !imageBase64) {
    return res.status(400).json({ error: 'Prompt or Image data is missing' });
  }

  // APIキーの確認
  if (!process.env.GEMINI_API_KEY) {
    console.error("API Key is missing in Environment Variables");
    return res.status(500).json({ error: 'Server Configuration Error (API Key)' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 最新で高速なFlashモデルを指定
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 画像データの準備
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg", // フロントエンドから受け取った画像データとして処理
      },
    };

    // 生成実行
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: 'AI processing failed', details: error.message });
  }
}