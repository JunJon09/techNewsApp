
const JINA_BASE_URL = 'https://r.jina.ai/'

export async function fetchArticleContent(url: string): Promise<string | null> {
    const requestJinaUrl = JINA_BASE_URL + url;
    try{
        const response = await fetch(requestJinaUrl);
        if (!response.ok) {
            console.error(`Jina API エラー: ${response.status}`);
            return null;
        }
        const contentMarkdown = await response.text();
        return contentMarkdown;
    } catch (error) {
        console.error(`Jina API エラー: ${error}`);
        return null;
    }
}
