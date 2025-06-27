import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// 配置marked选项
marked.setOptions({
    breaks: true,
    gfm: true,
});

// 自定义渲染器
const renderer = new marked.Renderer();

// 自定义链接渲染，添加安全属性
renderer.link = ({ href, title, tokens }) => {
    const cleanHref = DOMPurify.sanitize(href || '');
    const cleanTitle = title ? DOMPurify.sanitize(title) : '';
    // Extract text from tokens
    const text = tokens
        .map((token) => {
            if (token.type === 'text') {
                return token.raw;
            }
            return token.raw || '';
        })
        .join('');
    const cleanText = DOMPurify.sanitize(text);

    return `<a href="${cleanHref}" title="${cleanTitle}" target="_blank" rel="noopener noreferrer nofollow">${cleanText}</a>`;
};

// 自定义代码块渲染
renderer.code = ({ text, lang }) => {
    const cleanCode = DOMPurify.sanitize(text);
    const cleanLanguage = lang ? DOMPurify.sanitize(lang) : '';

    return `<pre class="overflow-x-auto"><code class="language-${cleanLanguage}">${cleanCode}</code></pre>`;
};

// 自定义图片渲染（禁用图片）
renderer.image = ({ text }) => {
    return `<span class="text-muted-foreground">[${text || '图片'}]</span>`;
};

marked.use({ renderer });

export async function markdownToHtml(markdown: string): Promise<string> {
    if (!markdown) return '';

    try {
        // 转换markdown为HTML
        const rawHtml = await marked(markdown);

        // 使用DOMPurify清理HTML，移除潜在的XSS攻击向量
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
            ALLOWED_TAGS: [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'br',
                'del',
                'strong',
                'em',
                'u',
                's',
                'ul',
                'ol',
                'li',
                'blockquote',
                'code',
                'pre',
                'a',
                'span',
            ],
            ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
            ALLOW_DATA_ATTR: false,
        });

        return cleanHtml;
    } catch (error) {
        console.error('Error converting markdown to HTML:', error);
        return DOMPurify.sanitize(markdown);
    }
}

// Synchronous version for client-side use
export function markdownToHtmlSync(markdown: string): string {
    if (!markdown) return '';

    try {
        // 转换markdown为HTML (sync version) - use parseInline for simple sync parsing
        const rawHtml = marked(markdown, { async: false }) as string;

        // 使用DOMPurify清理HTML，移除潜在的XSS攻击向量
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
            ALLOWED_TAGS: [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'br',
                'del',
                'strong',
                'em',
                'u',
                's',
                'ul',
                'ol',
                'li',
                'blockquote',
                'code',
                'pre',
                'a',
                'span',
            ],
            ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
            ALLOW_DATA_ATTR: false,
        });

        return cleanHtml;
    } catch (error) {
        console.error('Markdown to HTML conversion error:', error);
        return DOMPurify.sanitize(markdown);
    }
}
