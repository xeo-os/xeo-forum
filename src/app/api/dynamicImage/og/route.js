import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetUrl = searchParams.get('url');

        if (!targetUrl) {
            return new Response('Missing url parameter', { status: 400 });
        }

        // 构建完整的URL来获取页面信息
        const baseUrl = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const fullUrl = `${protocol}://${baseUrl}${targetUrl}`;

        // 获取页面内容并解析meta信息
        const response = await fetch(fullUrl);
        const html = await response.text();        // 解析HTML内容
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? decodeHTMLEntities(titleMatch[1].replace(' | XEO OS', '')) : 'XEO OS';
        const descriptionMatch = html.match(
            /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
        );
        const description = descriptionMatch ? decodeHTMLEntities(descriptionMatch[1]) : "Xchange Everyone's Opinion";
        const keywordsMatch = html.match(
            /<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i,
        );
        const keywords = keywordsMatch ? decodeHTMLEntities(keywordsMatch[1]) : null;

        const authorMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
        const author = authorMatch ? decodeHTMLEntities(authorMatch[1]) : null;

        const authorAvatarMatch = html.match(/<link\s+rel=["']author["']\s+href=["']([^"']+)["']/i);
        const authorAvatar = authorAvatarMatch ? authorAvatarMatch[1] : null;

        const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
        const canonicalUrl = canonicalMatch ? canonicalMatch[1] : fullUrl;

        // HTML实体解码函数
        function decodeHTMLEntities(text) {
            const entities = {
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#x27;': "'",
                '&apos;': "'",
                '&#39;': "'",
                '&nbsp;': ' ',
            };
            return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
                        padding: '60px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}>
                    {/* 主卡片容器 */}
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '48px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                        {' '}
                        {/* 装饰性渐变背景 */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '16px',
                                background: '#ffa500',
                            }}
                        />{' '}                        {/* 标题 */}
                        <div
                            style={{
                                fontSize: '48px',
                                fontWeight: '700',
                                color: '#1a1a1a',
                                lineHeight: '1.2',
                                marginBottom: '24px',
                                maxHeight: '120px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}>
                            {title}
                        </div>{' '}
                        {/* 主题标签 */}
                        {keywords && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: '#f5f5f5',
                                    color: '#666',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    marginBottom: '20px',
                                    alignSelf: 'flex-start',
                                }}>
                                {keywords}
                            </div>
                        )}
                        {/* 描述 */}
                        <div
                            style={{
                                fontSize: '24px',
                                color: '#666',
                                lineHeight: '1.4',
                                marginBottom: 'auto',
                                maxHeight: '140px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                            }}>
                            {description}
                        </div>{' '}
                        {/* 底部信息区域 */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent:
                                    author || authorAvatar ? 'space-between' : 'flex-end',
                                alignItems: 'flex-end',
                                marginTop: '32px',
                            }}>
                            {/* 左下角：作者信息 */}
                            {(author || authorAvatar) && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                    {authorAvatar && (
                                        <img
                                            src={`${protocol}://${baseUrl}${authorAvatar.replace('&amp;', '&')}`}
                                            width="256"
                                            height="256"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                            }}
                                            alt='Author avatar'
                                        />
                                    )}
                                    {author && (
                                        <div
                                            style={{
                                                fontSize: '20px',
                                                color: '#333',
                                                fontWeight: '500',
                                            }}>
                                            {author}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 右下角：站点信息 */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '4px',
                                }}>
                                {' '}
                                <div
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: '#ffa500',
                                    }}>
                                    XEO OS
                                </div>{' '}
                                <div
                                    style={{
                                        fontSize: '16px',
                                        color: '#888',
                                    }}>
                                    Xchange Everyone&apos;s Opinion
                                </div>
                            </div>
                        </div>
                        {/* 底部URL */}
                        <div
                            style={{
                                fontSize: '16px',
                                color: '#aaa',
                                marginTop: '20px',
                                paddingTop: '20px',
                                borderTop: '1px solid #eee',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                            {canonicalUrl}
                        </div>
                    </div>
                </div>
            ),            {
                width: 1200,
                height: 630,
                headers: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            },
        );
    } catch (error) {
        console.error('OG Image generation error:', error);

        // 返回一个简单的错误图像
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
                        fontSize: '48px',
                        color: '#666',
                    }}>
                    <div style={{ marginBottom: '20px' }}>XEO OS</div>
                    <div style={{ fontSize: '24px' }}>Xchange Everyone&apos;s Opinion</div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    }
}
