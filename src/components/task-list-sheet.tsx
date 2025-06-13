'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import token from '@/utils/userToken';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { FileText, MessageSquare, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useBroadcast } from '@/store/useBroadcast';
import lang from '@/lib/lang';

interface Task {
    id: string;
    status: 'PENDING' | 'DONE' | 'FAIL';
    createdAt: string;
    post?: {
        title: string;
        id: string;
    };
    reply?: {
        content: string;
        postUid: string;
    };
}

interface TaskListSheetProps {
    children: React.ReactNode;
}

export default function TaskListSheet({ children }: TaskListSheetProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [retrying, setRetrying] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { registerCallback, unregisterCallback } = useBroadcast();

    useEffect(() => {
        const handleBroadcastMessage = (message: unknown) => {
            if (typeof message === 'object' && message !== null && 'action' in message) {
                const msg = message as { action: string; query?: string; type?: string; data?: { type: string } };
                if (msg.action === 'broadcast') {
                    const messageData = msg.data;
                    if (!messageData) return;
                    if (msg.type == 'task') {
                        // 实时更新任务状态
                        console.log('Task status updated:', messageData);

                        // 检查消息数据是否包含uuid和status
                        if (typeof messageData === 'object' && 'uuid' in messageData && 'status' in messageData) {
                            const { uuid, status } = messageData as { uuid: string; status: string };

                            // 更新对应任务的状态
                            setTasks((prevTasks) =>
                                prevTasks.map((task) =>
                                    task.id === uuid
                                        ? {
                                              ...task,
                                              status: status.toUpperCase() as 'PENDING' | 'DONE' | 'FAIL',
                                          }
                                        : task,
                                ),
                            );
                        }
                    }
                }
            }
        };

        registerCallback(handleBroadcastMessage);
        return () => {
            unregisterCallback(handleBroadcastMessage);
        };
    }, [registerCallback, unregisterCallback]);

    const fetchTasks = async (pageNum: number = 1, append: boolean = false) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await fetch('/api/task/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
                body: JSON.stringify({ page: pageNum }),
            });

            const data = await response.json();

            if (!data.ok) {
                toast.error(
                    data.message ||
                        lang({
                            'zh-CN': '获取任务列表失败',
                            'en-US': 'Failed to fetch task list',
                            'de-DE': 'Fehler beim Abrufen der Aufgabenliste',
                            'es-ES': 'Error al obtener la lista de tareas',
                            'fr-FR': 'Échec de la récupération de la liste des tâches',
                            'ja-JP': 'タスクリストの取得に失敗しました',
                            'ko-KR': '작업 목록을 가져오는 데 실패했습니다',
                            'pt-BR': 'Falha ao buscar lista de tarefas',
                            'ru-RU': 'Не удалось получить список задач',
                            'zh-TW': '獲取任務列表失敗',
                        }),
                );
                return;
            }

            if (append) {
                setTasks((prev) => [...prev, ...(data.tasks || [])]);
            } else {
                setTasks(data.tasks || []);
            }

            setHasMore(data.hasMore || false);
        } catch (error) {
            toast.error(
                lang({
                    'zh-CN': '网络错误，请稍后重试',
                    'en-US': 'Network error, please try again later',
                    'de-DE': 'Netzwerkfehler, bitte versuchen Sie es später erneut',
                    'es-ES': 'Error de red, inténtelo más tarde',
                    'fr-FR': 'Erreur réseau, veuillez réessayer plus tard',
                    'ja-JP': 'ネットワークエラーです。後でもう一度お試しください',
                    'ko-KR': '네트워크 오류, 나중에 다시 시도해주세요',
                    'pt-BR': 'Erro de rede, tente novamente mais tarde',
                    'ru-RU': 'Ошибка сети, попробуйте позже',
                    'zh-TW': '網路錯誤，請稍後重試',
                }),
            );
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 加载更多任务
    const loadMoreTasks = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;

        try {
            const response = await fetch('/api/task/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
                body: JSON.stringify({ page: nextPage }),
            });

            const data = await response.json();

            if (!data.ok) {
                toast.error(
                    data.message ||
                        lang({
                            'zh-CN': '获取任务列表失败',
                            'en-US': 'Failed to fetch task list',
                            'de-DE': 'Fehler beim Abrufen der Aufgabenliste',
                            'es-ES': 'Error al obtener la lista de tareas',
                            'fr-FR': 'Échec de la récupération de la liste des tâches',
                            'ja-JP': 'タスクリストの取得に失敗しました',
                            'ko-KR': '작업 목록을 가져오는 데 실패했습니다',
                            'pt-BR': 'Falha ao buscar lista de tarefas',
                            'ru-RU': 'Не удалось получить список задач',
                            'zh-TW': '獲取任務列表失敗',
                        }),
                );
                return;
            }

            setTasks((prev) => [...prev, ...(data.tasks || [])]);
            setHasMore(data.hasMore || false);
            setPage(nextPage);
        } catch (error) {
            toast.error(
                lang({
                    'zh-CN': '网络错误，请稍后重试',
                    'en-US': 'Network error, please try again later',
                    'de-DE': 'Netzwerkfehler, bitte versuchen Sie es später erneut',
                    'es-ES': 'Error de red, inténtelo más tarde',
                    'fr-FR': 'Erreur réseau, veuillez réessayer plus tard',
                    'ja-JP': 'ネットワークエラーです。後でもう一度お試しください',
                    'ko-KR': '네트워크 오류, 나중에 다시 시도해주세요',
                    'pt-BR': 'Erro de rede, tente novamente mais tarde',
                    'ru-RU': 'Ошибка сети, попробуйте позже',
                    'zh-TW': '網路錯誤，請稍後重試',
                }),
            );
            console.error('Error fetching tasks:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // 处理滚动事件
    useEffect(() => {
        if (!open) return;

        const scrollElement = scrollAreaRef.current;
        if (!scrollElement) return;

        // 尝试多个可能的滚动容器选择器
        const viewport =
            scrollElement.querySelector('[data-radix-scroll-area-viewport]') ||
            scrollElement.querySelector('.scroll-area-viewport') ||
            scrollElement.firstElementChild;

        if (!viewport) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = viewport as Element;

            // 检查是否有足够的内容可以滚动
            if (scrollHeight <= clientHeight) return;

            // 计算滚动进度，当接近底部时加载更多
            const scrollProgress = (scrollTop + clientHeight) / scrollHeight;

            if (scrollProgress > 0.8 && hasMore && !loadingMore) {
                loadMoreTasks();
            }
        };

        viewport.addEventListener('scroll', handleScroll, { passive: true });

        // 初始检查是否需要加载更多（内容不足时）
        const checkInitialLoad = () => {
            const { scrollHeight, clientHeight } = viewport as Element;
            if (scrollHeight <= clientHeight && hasMore && !loadingMore && tasks.length > 0) {
                loadMoreTasks();
            }
        };

        // 延迟检查，等待DOM更新
        const timer = setTimeout(checkInitialLoad, 100);

        return () => {
            viewport.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [open, hasMore, loadingMore, tasks.length]);

    const retryTask = async (taskId: string) => {
        setRetrying(taskId);
        try {
            const response = await fetch('/api/task/retry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
                body: JSON.stringify({ id: taskId }),
            });

            const data = await response.json();

            if (!data.ok) {
                toast.error(
                    data.message ||
                        lang({
                            'zh-CN': '重试任务失败',
                            'en-US': 'Failed to retry task',
                            'de-DE': 'Fehler beim Wiederholen der Aufgabe',
                            'es-ES': 'Error al reintentar la tarea',
                            'fr-FR': 'Échec de la nouvelle tentative de tâche',
                            'ja-JP': 'タスクの再試行に失敗しました',
                            'ko-KR': '작업 재시도 실패',
                            'pt-BR': 'Falha ao tentar novamente a tarefa',
                            'ru-RU': 'Не удалось повторить задачу',
                            'zh-TW': '重試任務失敗',
                        }),
                );
                return;
            }

            // 更新任务状态为PENDING
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, status: 'PENDING' as const } : task,
                ),
            );

            toast.success(
                lang({
                    'zh-CN': '任务已重新提交',
                    'en-US': 'Task has been resubmitted',
                    'de-DE': 'Aufgabe wurde erneut eingereicht',
                    'es-ES': 'La tarea ha sido reenviada',
                    'fr-FR': 'La tâche a été resoumise',
                    'ja-JP': 'タスクが再送信されました',
                    'ko-KR': '작업이 다시 제출되었습니다',
                    'pt-BR': 'Tarefa foi reenviada',
                    'ru-RU': 'Задача была повторно отправлена',
                    'zh-TW': '任務已重新提交',
                }),
            );
        } catch (error) {
            toast.error(
                lang({
                    'zh-CN': '网络错误，请稍后重试',
                    'en-US': 'Network error, please try again later',
                    'de-DE': 'Netzwerkfehler, bitte versuchen Sie es später erneut',
                    'es-ES': 'Error de red, inténtelo más tarde',
                    'fr-FR': 'Erreur réseau, veuillez réessayer plus tard',
                    'ja-JP': 'ネットワークエラーです。後でもう一度お試しください',
                    'ko-KR': '네트워크 오류, 나중에 다시 시도해주세요',
                    'pt-BR': 'Erro de rede, tente novamente mais tarde',
                    'ru-RU': 'Ошибка сети, попробуйте позже',
                    'zh-TW': '網路錯誤，請稍後重試',
                }),
            );
            console.error('Error retrying task:', error);
        } finally {
            setRetrying(null);
        }
    };

    const getProgressValue = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 10;
            case 'DONE':
                return 100;
            case 'FAIL':
                return 100;
            default:
                return 0;
        }
    };

    const getProgressClassName = (status: string) => {
        switch (status) {
            case 'FAIL':
                return '[&>div]:bg-red-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className='h-4 w-4 text-blue-500' />;
            case 'DONE':
                return <CheckCircle className='h-4 w-4 text-green-500' />;
            case 'FAIL':
                return <XCircle className='h-4 w-4 text-red-500' />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return lang({
                    'zh-CN': '正在处理',
                    'en-US': 'Processing',
                    'de-DE': 'Wird bearbeitet',
                    'es-ES': 'Procesando',
                    'fr-FR': 'Traitement en cours',
                    'ja-JP': '処理中',
                    'ko-KR': '처리 중',
                    'pt-BR': 'Processando',
                    'ru-RU': 'Обработка',
                    'zh-TW': '正在處理',
                });
            case 'DONE':
                return lang({
                    'zh-CN': '处理完成',
                    'en-US': 'Completed',
                    'de-DE': 'Abgeschlossen',
                    'es-ES': 'Completado',
                    'fr-FR': 'Terminé',
                    'ja-JP': '完了',
                    'ko-KR': '완료됨',
                    'pt-BR': 'Concluído',
                    'ru-RU': 'Завершено',
                    'zh-TW': '處理完成',
                });
            case 'FAIL':
                return lang({
                    'zh-CN': '处理失败',
                    'en-US': 'Failed',
                    'de-DE': 'Fehlgeschlagen',
                    'es-ES': 'Fallido',
                    'fr-FR': 'Échec',
                    'ja-JP': '失敗',
                    'ko-KR': '실패',
                    'pt-BR': 'Falhado',
                    'ru-RU': 'Не удалось',
                    'zh-TW': '處理失敗',
                });
            default:
                return lang({
                    'zh-CN': '未知状态',
                    'en-US': 'Unknown status',
                    'de-DE': 'Unbekannter Status',
                    'es-ES': 'Estado desconocido',
                    'fr-FR': 'Statut inconnu',
                    'ja-JP': '不明なステータス',
                    'ko-KR': '알 수 없는 상태',
                    'pt-BR': 'Status desconhecido',
                    'ru-RU': 'Неизвестный статус',
                    'zh-TW': '未知狀態',
                });
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const locale = navigator.language.startsWith('zh') ? zhCN : enUS;
        return formatDistanceToNow(date, { addSuffix: true, locale });
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);

        // 管理滚动锁定状态
        if (newOpen) {
            document.body.setAttribute('data-scroll-locked', 'true');
            setPage(1);
            setHasMore(true);
            fetchTasks(1, false);
        } else {
            document.body.removeAttribute('data-scroll-locked');
        }
    };

    // 组件卸载时清理滚动锁定状态
    useEffect(() => {
        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, []);

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
                <SheetHeader>
                    <SheetTitle>
                        {lang({
                            'zh-CN': '任务队列',
                            'en-US': 'Task Queue',
                            'de-DE': 'Aufgabenwarteschlange',
                            'es-ES': 'Cola de tareas',
                            'fr-FR': "File d'attente des tâches",
                            'ja-JP': 'タスクキュー',
                            'ko-KR': '작업 대기열',
                            'pt-BR': 'Fila de tarefas',
                            'ru-RU': 'Очередь задач',
                            'zh-TW': '任務隊列',
                        })}
                    </SheetTitle>
                    <SheetDescription>
                        {lang({
                            'zh-CN': '查看您的所有任务状态和进度',
                            'en-US': 'View all your task statuses and progress',
                            'de-DE': 'Alle Ihre Aufgabenstatus und Fortschritte anzeigen',
                            'es-ES': 'Ver todos los estados и progreso de sus tareas',
                            'fr-FR': 'Voir tous vos statuts de tâches et progrès',
                            'ja-JP': 'すべてのタスクの状態と進行状況を表示',
                            'ko-KR': '모든 작업 상태와 진행 상황 보기',
                            'pt-BR': 'Ver todos os status e progresso das suas tarefas',
                            'ru-RU': 'Просмотр всех статусов задач и прогресса',
                            'zh-TW': '查看您的所有任務狀態和進度',
                        })}
                    </SheetDescription>
                </SheetHeader>

                <div className='mt-6'>
                    {loading ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                        </div>
                    ) : (
                        <ScrollArea ref={scrollAreaRef} className='h-[calc(100vh-200px)]'>
                            {tasks.length === 0 ? (
                                <div className='text-center text-muted-foreground py-12'>
                                    <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                                    <p>
                                        {lang({
                                            'zh-CN': '暂无任务',
                                            'en-US': 'No tasks',
                                            'de-DE': 'Keine Aufgaben',
                                            'es-ES': 'Sin tareas',
                                            'fr-FR': 'Aucune tâche',
                                            'ja-JP': 'タスクなし',
                                            'ko-KR': '작업 없음',
                                            'pt-BR': 'Nenhuma tarefa',
                                            'ru-RU': 'Нет задач',
                                            'zh-TW': '暫無任務',
                                        })}
                                    </p>
                                </div>
                            ) : (
                                <div className='divide-y divide-border'>
                                    {tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className='py-4 px-4 hover:bg-muted/50 transition-colors'>
                                            {/* 任务类型和标题行 */}
                                            <div className='flex items-center gap-3 mb-3'>
                                                {task.post ? (
                                                    <FileText className='h-4 w-4 text-blue-500 flex-shrink-0' />
                                                ) : (
                                                    <MessageSquare className='h-4 w-4 text-green-500 flex-shrink-0' />
                                                )}
                                                <Badge
                                                    variant={task.post ? 'default' : 'secondary'}
                                                    className='text-xs'>
                                                    {task.post
                                                        ? lang({
                                                              'zh-CN': '帖子',
                                                              'en-US': 'Post',
                                                              'de-DE': 'Beitrag',
                                                              'es-ES': 'Publicación',
                                                              'fr-FR': 'Publication',
                                                              'ja-JP': '投稿',
                                                              'ko-KR': '게시물',
                                                              'pt-BR': 'Postagem',
                                                              'ru-RU': 'Пост',
                                                              'zh-TW': '帖子',
                                                          })
                                                        : lang({
                                                              'zh-CN': '回复',
                                                              'en-US': 'Reply',
                                                              'de-DE': 'Antwort',
                                                              'es-ES': 'Respuesta',
                                                              'fr-FR': 'Réponse',
                                                              'ja-JP': '返信',
                                                              'ko-KR': '답글',
                                                              'pt-BR': 'Resposta',
                                                              'ru-RU': 'Ответ',
                                                              'zh-TW': '回覆',
                                                          })}
                                                </Badge>
                                                {getStatusIcon(task.status)}
                                                <span className='text-xs text-muted-foreground'>
                                                    {formatTime(task.createdAt)}
                                                </span>
                                                {task.status === 'FAIL' && (
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        className='h-6 px-2 text-xs ml-auto'
                                                        onClick={() => retryTask(task.id)}
                                                        disabled={retrying === task.id}>
                                                        <RotateCcw className='h-3 w-3 mr-1' />
                                                        {retrying === task.id
                                                            ? lang({
                                                                  'zh-CN': '重试中...',
                                                                  'en-US': 'Retrying...',
                                                                  'de-DE': 'Wiederholung...',
                                                                  'es-ES': 'Reintentando...',
                                                                  'fr-FR': 'Nouvelle tentative...',
                                                                  'ja-JP': '再試行中...',
                                                                  'ko-KR': '재시도 중...',
                                                                  'pt-BR': 'Tentando novamente...',
                                                                  'ru-RU': 'Повтор...',
                                                                  'zh-TW': '重試中...',
                                                              })
                                                            : lang({
                                                                  'zh-CN': '重试',
                                                                  'en-US': 'Retry',
                                                                  'de-DE': 'Wiederholen',
                                                                  'es-ES': 'Reintentar',
                                                                  'fr-FR': 'Réessayer',
                                                                  'ja-JP': '再試行',
                                                                  'ko-KR': '재시도',
                                                                  'pt-BR': 'Tentar novamente',
                                                                  'ru-RU': 'Повторить',
                                                                  'zh-TW': '重試',
                                                              })}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* 任务内容 */}
                                            <div className='ml-7 mb-3 pr-2'>
                                                {task.post ? (
                                                    <h4 className='font-medium text-sm leading-relaxed'>
                                                        {task.post.title}
                                                    </h4>
                                                ) : (
                                                    <p className='text-sm text-muted-foreground leading-relaxed line-clamp-2'>
                                                        {task.reply?.content ||
                                                            lang({
                                                                'zh-CN': '回复内容',
                                                                'en-US': 'Reply content',
                                                                'de-DE': 'Antwortinhalt',
                                                                'es-ES': 'Contenido de respuesta',
                                                                'fr-FR': 'Contenu de la réponse',
                                                                'ja-JP': '返信内容',
                                                                'ko-KR': '답글 내용',
                                                                'pt-BR': 'Conteúdo da resposta',
                                                                'ru-RU': 'Содержание ответа',
                                                                'zh-TW': '回覆內容',
                                                            })}
                                                    </p>
                                                )}
                                            </div>

                                            {/* 状态和进度 */}
                                            <div className='ml-7 mr-2 space-y-2'>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-xs font-medium'>
                                                        {getStatusText(task.status)}
                                                    </span>
                                                    <span className='text-xs text-muted-foreground'>
                                                        {getProgressValue(task.status)}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={getProgressValue(task.status)}
                                                    className={cn(
                                                        'h-1.5',
                                                        getProgressClassName(task.status),
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* 加载更多指示器 */}
                                    {loadingMore && (
                                        <div className='flex items-center justify-center py-4'>
                                            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                                            <span className='ml-2 text-sm text-muted-foreground'>
                                                {lang({
                                                    'zh-CN': '加载更多...',
                                                    'en-US': 'Loading more...',
                                                    'de-DE': 'Mehr laden...',
                                                    'es-ES': 'Cargando más...',
                                                    'fr-FR': 'Chargement...',
                                                    'ja-JP': 'さらに読み込み中...',
                                                    'ko-KR': '더 불러오는 중...',
                                                    'pt-BR': 'Carregando mais...',
                                                    'ru-RU': 'Загрузка...',
                                                    'zh-TW': '載入更多...',
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {/* 没有更多数据提示 */}
                                    {!hasMore && tasks.length > 0 && (
                                        <div className='text-center py-4 text-sm text-muted-foreground'>
                                            {lang({
                                                'zh-CN': '没有更多任务了',
                                                'en-US': 'No more tasks',
                                                'de-DE': 'Keine weiteren Aufgaben',
                                                'es-ES': 'No hay más tareas',
                                                'fr-FR': 'Aucune autre tâche',
                                                'ja-JP': 'これ以上のタスクはありません',
                                                'ko-KR': '더 이상 작업이 없습니다',
                                                'pt-BR': 'Não há mais tarefas',
                                                'ru-RU': 'Больше задач нет',
                                                'zh-TW': '沒有更多任務了',
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>

                {/* 刷新按钮 */}
                <div className='absolute bottom-6 right-6'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                            setPage(1);
                            setHasMore(true);
                            fetchTasks(1, false);
                        }}
                        disabled={loading}>
                        {lang({
                            'zh-CN': '刷新',
                            'en-US': 'Refresh',
                            'de-DE': 'Aktualisieren',
                            'es-ES': 'Actualizar',
                            'fr-FR': 'Actualiser',
                            'ja-JP': '更新',
                            'ko-KR': '새로고침',
                            'pt-BR': 'Atualizar',
                            'ru-RU': 'Обновить',
                            'zh-TW': '刷新',
                        })}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
