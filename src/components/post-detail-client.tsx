'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import token from '@/utils/userToken';
import { ReplyEditor } from '@/components/reply-editor';
import { ReplyList } from '@/components/reply-list';
import { ShareButton } from '@/components/share-button';

interface PostDetailClientProps {
    post: {
        id: number;
        title: string;
        likes: number;
        replies: number;
    };
    replies: any[];
    locale: string;
    currentPage: number;
    totalPages: number;
}

export function PostDetailClient({
    post,
    replies,
    locale,
    currentPage,
    totalPages,
}: PostDetailClientProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [showReplyEditor, setShowReplyEditor] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // 处理点赞
    const handleLike = useCallback(async () => {
        if (!token.get()) {
            toast.error(
                lang(
                    {
                        'zh-CN': '请先登录',
                        'en-US': 'Please login first',
                        'zh-TW': '請先登錄',
                        'es-ES': 'Por favor inicia sesión primero',
                        'fr-FR': "Veuillez vous connecter d'abord",
                        'ru-RU': 'Пожалуйста, сначала войдите',
                        'ja-JP': '最初にログインしてください',
                        'de-DE': 'Bitte melden Sie sich zuerst an',
                        'pt-BR': 'Por favor, faça login primeiro',
                        'ko-KR': '먼저 로그인해주세요',
                    },
                    locale,
                ),
            );
            return;
        }

        if (isLiking) return;
        setIsLiking(true);

        try {
            const response = await fetch('/api/like/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.get(),
                },
                body: JSON.stringify({
                    postid: post.id,
                    action: !isLiked,
                }),
            });

            const result = await response.json();

            if (result.ok) {
                setIsLiked(!isLiked);
                setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

                toast.success(
                    lang(
                        {
                            'zh-CN': isLiked ? '已取消点赞' : '点赞成功',
                            'en-US': isLiked ? 'Like removed' : 'Liked successfully',
                            'zh-TW': isLiked ? '已取消按讚' : '按讚成功',
                            'es-ES': isLiked ? 'Me gusta eliminado' : 'Me gusta exitoso',
                            'fr-FR': isLiked ? "J'aime supprimé" : "J'aime réussi",
                            'ru-RU': isLiked ? 'Лайк удален' : 'Лайк успешен',
                            'ja-JP': isLiked ? 'いいねを削除' : 'いいね成功',
                            'de-DE': isLiked ? 'Gefällt mir entfernt' : 'Gefällt mir erfolgreich',
                            'pt-BR': isLiked ? 'Curtida removida' : 'Curtida bem-sucedida',
                            'ko-KR': isLiked ? '좋아요 취소' : '좋아요 성공',
                        },
                        locale,
                    ),
                );
            } else {
                throw new Error('Failed to like post');
            }
        } catch (error) {
            console.error('Like error:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '操作失败，请重试',
                        'en-US': 'Operation failed, please try again',
                        'zh-TW': '操作失敗，請重試',
                        'es-ES': 'Operación falló, por favor intente de nuevo',
                        'fr-FR': 'Opération échouée, veuillez réessayer',
                        'ru-RU': 'Операция не удалась, попробуйте еще раз',
                        'ja-JP': '操作に失敗しました。もう一度お試しください',
                        'de-DE': 'Operation fehlgeschlagen, bitte versuchen Sie es erneut',
                        'pt-BR': 'Operação falhou, tente novamente',
                        'ko-KR': '작업 실패, 다시 시도해주세요',
                    },
                    locale,
                ),
            );
        } finally {
            setIsLiking(false);
        }
    }, [isLiked, isLiking, post.id, locale]);

    // 处理回复提交成功
    const handleReplySuccess = () => {
        setShowReplyEditor(false);
        // 刷新页面或重新获取数据
        window.location.reload();
    };

    return (
        <div className='space-y-6'>
            {/* 交互按钮 */}
            <Card>
                <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant={isLiked ? 'default' : 'outline'}
                                size='sm'
                                onClick={handleLike}
                                disabled={isLiking}
                                className='flex items-center gap-2'>
                                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{likesCount}</span>
                            </Button>

                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setShowReplyEditor(!showReplyEditor)}
                                className='flex items-center gap-2'>
                                <MessageCircle className='h-4 w-4' />
                                {lang(
                                    {
                                        'zh-CN': '回复',
                                        'en-US': 'Reply',
                                        'zh-TW': '回覆',
                                        'es-ES': 'Responder',
                                        'fr-FR': 'Répondre',
                                        'ru-RU': 'Ответить',
                                        'ja-JP': '返信',
                                        'de-DE': 'Antworten',
                                        'pt-BR': 'Responder',
                                        'ko-KR': '답글',
                                    },
                                    locale,
                                )}
                            </Button>

                            <ShareButton title={post.title} locale={locale} />
                        </div>

                        <div className='text-sm text-muted-foreground'>
                            {lang(
                                {
                                    'zh-CN': `${post.replies} 条回复`,
                                    'en-US': `${post.replies} replies`,
                                    'zh-TW': `${post.replies} 條回覆`,
                                    'es-ES': `${post.replies} respuestas`,
                                    'fr-FR': `${post.replies} réponses`,
                                    'ru-RU': `${post.replies} ответов`,
                                    'ja-JP': `${post.replies} 返信`,
                                    'de-DE': `${post.replies} Antworten`,
                                    'pt-BR': `${post.replies} respostas`,
                                    'ko-KR': `${post.replies} 답글`,
                                },
                                locale,
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 回复编辑器 */}
            {showReplyEditor && (
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>
                            {lang(
                                {
                                    'zh-CN': '发表回复',
                                    'en-US': 'Post Reply',
                                    'zh-TW': '發表回覆',
                                    'es-ES': 'Publicar respuesta',
                                    'fr-FR': 'Publier une réponse',
                                    'ru-RU': 'Опубликовать ответ',
                                    'ja-JP': '返信を投稿',
                                    'de-DE': 'Antwort veröffentlichen',
                                    'pt-BR': 'Publicar resposta',
                                    'ko-KR': '답글 게시',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReplyEditor
                            postId={post.id}
                            locale={locale}
                            onSuccess={handleReplySuccess}
                            onCancel={() => setShowReplyEditor(false)}
                        />
                    </CardContent>
                </Card>
            )}

            <Separator />

            {/* 回复列表 */}
            <div className='space-y-4'>
                <h2 className='text-xl font-semibold'>
                    {lang(
                        {
                            'zh-CN': '回复',
                            'en-US': 'Replies',
                            'zh-TW': '回覆',
                            'es-ES': 'Respuestas',
                            'fr-FR': 'Réponses',
                            'ru-RU': 'Ответы',
                            'ja-JP': '返信',
                            'de-DE': 'Antworten',
                            'pt-BR': 'Respostas',
                            'ko-KR': '답글',
                        },
                        locale,
                    )}
                </h2>

                <ReplyList replies={replies} locale={locale} />

                {/* 分页 */}
                {totalPages > 1 && (
                    <div className='flex items-center justify-center gap-2 mt-6'>
                        {currentPage > 1 && (
                            <Button variant='outline' size='sm' asChild>
                                <Link
                                    href={`/${locale}/post/${post.id}/page/${currentPage - 1}`}
                                    className='flex items-center gap-2'>
                                    <ChevronLeft className='h-4 w-4' />
                                    {lang(
                                        {
                                            'zh-CN': '上一页',
                                            'en-US': 'Previous',
                                            'zh-TW': '上一頁',
                                            'es-ES': 'Anterior',
                                            'fr-FR': 'Précédent',
                                            'ru-RU': 'Предыдущая',
                                            'ja-JP': '前へ',
                                            'de-DE': 'Vorherige',
                                            'pt-BR': 'Anterior',
                                            'ko-KR': '이전',
                                        },
                                        locale,
                                    )}
                                </Link>
                            </Button>
                        )}

                        <div className='flex items-center gap-1'>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === currentPage ? 'default' : 'outline'}
                                        size='sm'
                                        asChild
                                        className='w-8 h-8 p-0'>
                                        <Link href={`/${locale}/post/${post.id}/page/${pageNum}`}>
                                            {pageNum}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>

                        {currentPage < totalPages && (
                            <Button variant='outline' size='sm' asChild>
                                <Link
                                    href={`/${locale}/post/${post.id}/page/${currentPage + 1}`}
                                    className='flex items-center gap-2'>
                                    {lang(
                                        {
                                            'zh-CN': '下一页',
                                            'en-US': 'Next',
                                            'zh-TW': '下一頁',
                                            'es-ES': 'Siguiente',
                                            'fr-FR': 'Suivant',
                                            'ru-RU': 'Следующая',
                                            'ja-JP': '次へ',
                                            'de-DE': 'Nächste',
                                            'pt-BR': 'Próximo',
                                            'ko-KR': '다음',
                                        },
                                        locale,
                                    )}
                                    <ChevronRight className='h-4 w-4' />
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
