const { GoogleGenerativeAI } = require('@google/generative-ai');

// Vercelに預けたキーを裏側でこっそり取り出す
const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // 1. 許可証（CORS）の発行
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. 準備運動（プリフライトリクエスト）への返事
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. キーがあるかチェック
  if (!API_KEY) {
    return res.status(500).json({ error: 'サーバー側のAPIキー設定がありません' });
  }

  // 4. AIに仕事を依頼
  try {
    const { prompt, imageBase64 } = req.body;
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    // 最新モデルを指定
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    const text = response.text();

    // 5. 結果をフロントエンドに返す
    res.status(200).json({ text: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
}
手順4：フロントエンド (board.html) の修正
最後に、board.html が「直接Google」ではなく、「自分のVercelサーバー」を経由するように書き換えます。

board.html の <script type="module"> の中にある、aiBtn のクリックイベント部分 を以下のように全書き換えしてください。

（APIキーを書く場所はもうありません！）

JavaScript

      // ==========================================
      // ★修正版：AI解析ボタンの処理（Vercel経由）
      // ==========================================
      aiBtn.addEventListener('click', async () => {
        const loadingEl = document.getElementById('ai-loading');
        const errorEl = document.getElementById('ai-error-msg');
        
        // リセット
        errorEl.style.display = 'none';
        
        if(!selFile) return;
        
        // 読み込み中表示
        loadingEl.style.display = 'block';
        aiBtn.style.display = 'none';

        try {
          // 画像をBase64（文字データ）に変換
          const reader = new FileReader();
          reader.readAsDataURL(selFile);
          
          reader.onloadend = async () => {
            // "data:image/jpeg;base64,..." の頭の部分を取り除く
            const base64 = reader.result.split(',')[1];
            
            const promptText = "あなたはプロの家庭教師です。画像の過去問を解説してください。形式：【解説】...【類題】...【類題の解答】...";
            
            // ★ここが変わった！
            // Googleに直接送るのではなく、自分のサーバー(/api/gemini)に送る
            const response = await fetch('/api/gemini', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                prompt: promptText,
                imageBase64: base64
              })
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'APIエラーが発生しました');
            }

            // 成功したら結果を表示
            renderAIResult(data.text);
            loadingEl.style.display = 'none';
          };

        } catch(e) {
          console.error(e);
          errorEl.textContent = "エラー: " + e.message;
          errorEl.style.display = "block";
          loadingEl.style.display = 'none';
          aiBtn.style.display = 'block'; // ボタンを復活させる
        }
      });