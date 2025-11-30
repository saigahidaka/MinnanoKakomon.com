import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // CORS設定（アクセス許可）
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'APIキーが設定されていません' });
  }

  try {
    const { prompt, imageBase64 } = req.body;
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    // 安定板の 1.5-flash を使用（2.0はまだ不安定な場合があるため）
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
}