import response from '../_utils/response';
import limitControl from '../_utils/limit';
import lang from '@/lib/lang';
import { MeiliSearch } from 'meilisearch';
import prisma from '../_utils/prisma';

const client = new MeiliSearch({
    host: process.env.MEILI_HOST || '',
    apiKey: process.env.MEILI_API_KEY,
});

const PER_PAGE = 20;

function getAvatar(userUids: number[]) {
    return prisma.user.findMany({
        where: { uid: { in: userUids } },
        select: { uid: true, avatar: true, nickname: true },
    });
}

export async function GET(request: Request) {
    const locale = request.headers.get('Accept-Language')?.split(',')[0] || 'en-US';

    try {
        const isAllowed = await limitControl.check(request);

        if (!isAllowed) {
            return response(429, {
                error: 'rate_limit_exceeded',
                message: lang(
                    {
                        'zh-CN': '请求过于频繁，请稍后再试',
                        'zh-TW': '請求過於頻繁，請稍後再試',
                        'en-US': 'Too many requests, please try again later',
                        'es-ES': 'Demasiadas solicitudes, inténtalo más tarde',
                        'fr-FR': 'Trop de demandes, veuillez réessayer plus tard',
                        'ru-RU': 'Слишком много запросов, попробуйте позже',
                        'ja-JP': 'リクエストが多すぎます。後でもう一度お試しください',
                        'de-DE': 'Zu viele Anfragen, bitte später versuchen',
                        'pt-BR': 'Muitas solicitações, tente novamente mais tarde',
                        'ko-KR': '요청이 너무 많습니다. 나중에 다시 시도해 주세요',
                    },
                    locale,
                ),
            });
        }

        const url = new URL(request.url);
        const q = url.searchParams.get('q');
        const page = url.searchParams.get('page');
        const language = url.searchParams.get('lang');

        if (!q) {
            return response(400, {
                error: 'missing_parameters',
                message: lang(
                    {
                        'zh-CN': '缺少必要参数',
                        'zh-TW': '缺少必要參數',
                        'en-US': 'Missing required parameters',
                        'es-ES': 'Faltan parámetros requeridos',
                        'fr-FR': 'Paramètres requis manquants',
                        'ru-RU': 'Отсутствуют обязательные параметры',
                        'ja-JP': '必須パラメータが不足しています',
                        'de-DE': 'Erforderliche Parameter fehlen',
                        'pt-BR': 'Parâmetros obrigatórios ausentes',
                        'ko-KR': '필수 매개변수가 없습니다',
                    },
                    locale,
                ),
            });
        }

        const index = client.index('posts');
        const result = await index.search(q, {
            limit: PER_PAGE,
            offset: page ? (parseInt(page) - 1) * PER_PAGE : 0,
            filter: language ? `originLang = '${language}'` : undefined,
        });

        await limitControl.update(request);

        // 只返回对应语言的 title 和 content 字段
        let filteredResult = result;
        let userUidList: number[] = [];
        if (locale) {
            // 语言后缀映射
            const langMap: Record<string, string> = {
                'zh-CN': 'ZHCN',
                'zh-TW': 'ZHTW',
                'en-US': 'ENUS',
                'es-ES': 'ESES',
                'fr-FR': 'FRFR',
                'ru-RU': 'RURU',
                'ja-JP': 'JAJP',
                'de-DE': 'DEDE',
                'pt-BR': 'PTBR',
                'ko-KR': 'KOKR',
            };
            const langSuffix = Object.prototype.hasOwnProperty.call(langMap, locale)
                ? langMap[locale]
                : '';
            if (langSuffix) {
                userUidList = Array.isArray(result.hits)
                    ? Array.from(
                          new Set(
                              result.hits
                                  .map((hit) => hit.userUid)
                                  .filter((uid) => typeof uid === 'number'),
                          ),
                      )
                    : [];
                filteredResult = {
                    ...result,
                    hits: Array.isArray(result.hits)
                        ? result.hits.map((hit) => {
                              // 保留通用字段
                              const {
                                  id,
                                  origin,
                                  userUid,
                                  createdAt,
                                  lastReplyAt,
                                  originLang,
                                  published,
                                  updatedAt,
                                  pin,
                                  unsafeTags,
                                  topics,
                              } = hit;
                              // 动态获取 title 和 content 字段
                              const titleKey = langSuffix ? `title${langSuffix}` : 'title';
                              const contentKey = langSuffix ? `content${langSuffix}` : 'content';
                              let title = hit[titleKey];
                              if (title == null || title === undefined) {
                                  title = hit.title ?? hit.origin;
                              }
                              let content = hit[contentKey];
                              if (content == null || content === undefined) {
                                  content = hit.content ?? hit.origin;
                              }
                              return {
                                  id,
                                  origin,
                                  userUid,
                                  createdAt,
                                  lastReplyAt,
                                  originLang,
                                  published,
                                  updatedAt,
                                  pin,
                                  unsafeTags,
                                  topics,
                                  title,
                                  content,
                              };
                          })
                        : [],
                };
            }
        }

        // 查询用户头像和昵称，写入 hits
        if (Array.isArray(filteredResult.hits) && filteredResult.hits.length > 0) {
            if (userUidList.length === 0) {
                userUidList = Array.from(
                    new Set(
                        filteredResult.hits
                            .map((hit) => hit.userUid)
                            .filter((uid) => typeof uid === 'number'),
                    ),
                );
            }
            const userList = await getAvatar(userUidList);
            const userMap = new Map(userList.map((u) => [u.uid, u]));
            filteredResult.hits = filteredResult.hits.map((hit) => {
                const user = userMap.get(hit.userUid);
                return {
                    ...hit,
                    avatar: user?.avatar ?? null,
                    nickname: user?.nickname ?? null,
                };
            });
        }

        return response(200, {
            ok: true,
            data: {
                originalContent: filteredResult,
            },
        });
    } catch (error) {
        console.error('Get original content error:', error);
        return response(500, {
            error: 'server_error',
            message: lang(
                {
                    'zh-CN': '服务器错误，请稍后再试',
                    'zh-TW': '伺服器錯誤，請稍後再試',
                    'en-US': 'Server error, please try again later',
                    'es-ES': 'Error del servidor, inténtalo más tarde',
                    'fr-FR': 'Erreur du serveur, veuillez réessayer plus tard',
                    'ru-RU': 'Ошибка сервера, попробуйте позже',
                    'ja-JP': 'サーバーエラー。後でもう一度お試しください',
                    'de-DE': 'Server-Fehler, bitte später versuchen',
                    'pt-BR': 'Erro do servidor, tente novamente mais tarde',
                    'ko-KR': '서버 오류입니다. 나중에 다시 시도해 주세요',
                },
                locale,
            ),
        });
    }
}
