import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

type EnrichResult = {
  translation: string
  keywords: { word: string; meaning: string }[]
}


export async function enrichArticle(text: string): Promise<EnrichResult | null> {
    try{
        const prompt = `以下の英語の技術記事を日本語に翻訳してください。
            またTOEIC700点を超える難しい単語やイディオムを抽出し、日本語の意味をつけてください。
            必ず以下のJSON形式のみで返してください：
            {"translation":"日本語訳","keywords":[{"word":"英単語","meaning":"日本語の意味"}]}`;
        text = text.slice(0, 8000); // トークン制限対策（約6000トークン）
        const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: `${prompt}\n\n${text}` }],
        response_format: {type: 'json_object'}
        });
        const content = response.choices[0]?.message?.content
        if  (!content) {
            console.error('OpenAI API エラー: レスポンスが空です。');
            return null;
        }
        const parsed = JSON.parse(content) as EnrichResult  // 文字列→オブジェクト
        return parsed
    }catch (error) {
        console.error(`OpenAI API エラー: ${error}`);
        return null;
    }
}