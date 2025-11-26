const { GoogleGenerativeAI } = require('@google/generative-ai');

// 💡 注意: Vercelの環境変数 (Secrets) からキーを取得します
const API_KEY = process.env.GEMINI_API_KEY; 

module.exports = async (req, res) => {
    // CORSエラー対応
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONSリクエスト（プリフライト）対応
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // JSONデータのパース
    const { prompt, imageBase64, mimeType } = req.body;
    
    if (!API_KEY) {
        return res.status(500).json({ error: "Server API Key (GEMINI_API_KEY) not configured in Vercel." });
    }
    if (!imageBase64) {
        return res.status(400).json({ error: "画像データがありません。" });
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType: mimeType || "image/png" } }
        ]);

        const responseText = result.response.text;
        res.status(200).json({ text: responseText });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};