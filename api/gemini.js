import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // POSTメソッド以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, imageBase64 } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API Key is missing' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // または gemini-pro-vision

    // 画像データの準備
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg", // フロントから送る形式に合わせる
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: error.message || 'AI processing failed' });
  }
}