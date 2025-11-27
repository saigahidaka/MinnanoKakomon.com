const { GoogleGenerativeAI } = require('@google/generative-ai');

// Vercelの設定画面
const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // プリフライトリクエスト
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // キーの確認
  if (!API_KEY) {
    return res.status(500).json({ error: 'サーバー側のAPIキー設定がありません' });
  }

  // AI処理
  try {
    const { prompt, imageBase64, mimeType } = req.body;
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: mimeType || "image/png" } }
    ]);

    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}