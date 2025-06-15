'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as Ably from 'ably';
import { toast } from 'sonner';
import token from '@/utils/userToken';
import lang from '@/lib/lang';
import { useBroadcast } from '@/store/useBroadcast';

interface MessageData {
    title: string;
    content: string;
    link: string;
    locale: string;
    type?: string;
}

export default function Message() {
    const ablyRef = useRef<Ably.Realtime | null>(null);
    const isConnectedRef = useRef(false);
    const isInitializingRef = useRef(false);
    const mountedRef = useRef(true);
    const retryCountRef = useRef(0);
    const maxRetries = 5;
    const retryDelayRef = useRef(1000); // 初始重试延迟1秒
    const { broadcast } = useBroadcast();

    const cleanup = useCallback(async () => {
        console.log('Cleanup called, ablyRef.current exists:', !!ablyRef.current);
        if (ablyRef.current) {
            try {
                isConnectedRef.current = false;
                isInitializingRef.current = false;
                retryCountRef.current = 0;
                // 移除所有事件监听器
                ablyRef.current.connection.off();
                // 关闭连接
                await ablyRef.current.close();
                console.log('Ably connection closed successfully');
            } catch (error) {
                console.debug('Ably connection cleanup error:', error);
            } finally {
                ablyRef.current = null;
            }
        }
    }, []);

    const reconnect = useCallback(async () => {
        if (!mountedRef.current || retryCountRef.current >= maxRetries) {
            console.log(
                'Max retries reached or component unmounted, stopping reconnection attempts',
            );

            // 达到最大重试次数时显示最终错误提示
            if (retryCountRef.current >= maxRetries) {
                toast.error(
                    lang({
                        'zh-CN': '消息服务连接失败',
                        'en-US': 'Message service connection failed',
                        'de-DE': 'Nachrichtendienstverbindung fehlgeschlagen',
                        'fr-FR': 'Échec de la connexion au service de messagerie',
                        'es-ES': 'Error de conexión al servicio de mensajería',
                        'ru-RU': 'Ошибка подключения к службе сообщений',
                        'ja-JP': 'メッセージサービスの接続に失敗しました',
                        'pt-BR': 'Falha na conexão com o serviço de mensagens',
                        'ko-KR': '메시지 서비스 연결 실패',
                        'zh-TW': '消息服務連接失敗',
                    }),
                    {
                        description: lang({
                            'zh-CN': '已停止重试，请刷新页面或稍后再试',
                            'en-US': 'Stopped retrying, please refresh the page or try again later',
                            'de-DE':
                                'Wiederholungen gestoppt, bitte Seite neu laden oder später erneut versuchen',
                            'fr-FR':
                                'Réessais arrêtés, veuillez actualiser la page ou réessayer plus tard',
                            'es-ES':
                                'Reintentos detenidos, por favor actualiza la página o inténtalo de nuevo más tarde',
                            'ru-RU':
                                'Повторные попытки остановлены, пожалуйста, обновите страницу или попробуйте позже',
                            'ja-JP':
                                '再試行を停止しました。ページを更新するか、後でもう一度お試しください',
                            'pt-BR':
                                'Tentativas interrompidas, por favor, atualize a página ou tente novamente mais tarde',
                            'ko-KR': '재시도 중지, 페이지를 새로 고치거나 나중에 다시 시도하세요',

                            'zh-TW': '已停止重試，請刷新頁面或稍後再試',
                        }),
                    },
                );
            }

            return;
        }

        retryCountRef.current++;
        const delay = Math.min(
            retryDelayRef.current * Math.pow(2, retryCountRef.current - 1),
            30000,
        ); // 指数退避，最大30秒

        console.log(
            `Attempting reconnection ${retryCountRef.current}/${maxRetries} in ${delay}ms...`,
        );

        setTimeout(async () => {
            if (!mountedRef.current) return;

            try {
                // 清理现有连接
                if (ablyRef.current) {
                    await cleanup();
                }

                // 重新初始化
                await initializeAbly();
            } catch (error) {
                console.error('Reconnection attempt failed:', error);
                if (retryCountRef.current < maxRetries && mountedRef.current) {
                    reconnect();
                }
            }
        }, delay);
    }, [cleanup]);

    const initializeAbly = useCallback(async () => {
        console.log('=== initializeAbly START ===');
        console.log('initializeAbly called, checking conditions...');
        console.log('mountedRef.current:', mountedRef.current);
        console.log('isInitializingRef.current:', isInitializingRef.current);
        console.log('ablyRef.current exists:', !!ablyRef.current);
        console.log('isConnectedRef.current:', isConnectedRef.current);

        if (!mountedRef.current) {
            console.log('Component not mounted, skipping initialization');
            return;
        }

        // 防止重复初始化
        if (isInitializingRef.current || (ablyRef.current && isConnectedRef.current)) {
            console.log('Skipping initialization - already initializing or connected');
            return;
        }

        isInitializingRef.current = true;
        console.log('Starting Ably initialization...');

        try {
            // 获取 JWT token
            const jwtToken = token.get();
            if (!jwtToken) {
                console.warn('No JWT token found');
                return;
            }
            console.log('JWT token obtained, length:', jwtToken.length);

            // 获取用户 ID
            const userInfo = token.getObject();
            if (!userInfo || !userInfo.uid) {
                console.warn('No user info found');
                return;
            }
            console.log('User info obtained, uid:', userInfo.uid);

            // 检查组件是否还在挂载状态
            if (!mountedRef.current) {
                console.log('Component unmounted during initialization');
                return;
            }

            // 初始化 Ably 连接
            console.log('Creating Ably Realtime instance...');
            ablyRef.current = new Ably.Realtime({
                authUrl: '/api/message/auth',
                authMethod: 'POST',
                authHeaders: {
                    Authorization: `Bearer ${jwtToken}`,
                },
                clientId: userInfo.uid.toString(),
                autoConnect: true,
                disconnectedRetryTimeout: 15000,
                suspendedRetryTimeout: 30000,
                queryTime: true,
                realtimeRequestTimeout: 10000,
                httpRequestTimeout: 15000,
            });

            console.log('Ably instance created, setting up event listeners...');

            // 监听连接状态
            ablyRef.current.connection.on('connected', () => {
                if (!mountedRef.current) return;
                isConnectedRef.current = true;
                retryCountRef.current = 0; // 重置重试计数
                retryDelayRef.current = 1000; // 重置延迟
                console.log('Ably connection established');
            });

            ablyRef.current.connection.on('connecting', () => {
                console.log('Ably connecting...');
            });

            ablyRef.current.connection.on('disconnected', () => {
                isConnectedRef.current = false;
                console.log('Ably connection disconnected');

                // 如果不是主动断开连接，尝试重连
                if (mountedRef.current && ablyRef.current) {
                    console.log('Connection lost, attempting to reconnect...');
                    reconnect();
                }
            });

            ablyRef.current.connection.on('failed', (error) => {
                isConnectedRef.current = false;
                console.error('Ably connection failed:', error);

                // 首次连接失败时显示错误提示
                if (retryCountRef.current === 0) {
                    toast.error(
                        lang({
                            'zh-CN': '消息服务连接失败，正在尝试重连...',
                            'en-US':
                                'Message service connection failed, attempting to reconnect...',
                            'de-DE':
                                'Nachrichtendienstverbindung fehlgeschlagen, versuche erneut zu verbinden...',
                            'fr-FR':
                                'Échec de la connexion au service de messagerie, tentative de reconnexion...',
                            'es-ES':
                                'Error de conexión al servicio de mensajería, intentando reconectar...',
                            'ru-RU':
                                'Ошибка подключения к службе сообщений, попытка переподключения...',
                            'ja-JP':
                                'メッセージサービスの接続に失敗しました。再接続を試みています...',
                            'pt-BR':
                                'Falha na conexão com o serviço de mensagens, tentando reconectar...',
                            'ko-KR': '메시지 서비스 연결 실패, 재연결 시도 중...',
                            'zh-TW': '消息服務連接失敗，正在嘗試重新連接...',
                        }),
                        {
                            description: lang({
                                'zh-CN': '实时消息功能可能暂时不可用',
                                'en-US': 'Real-time messaging may be temporarily unavailable',
                                'de-DE':
                                    'Echtzeit-Nachrichtenfunktion könnte vorübergehend nicht verfügbar sein',
                                'fr-FR':
                                    'La fonction de messagerie en temps réel peut être temporairement indisponible',
                                'es-ES':
                                    'La función de mensajería en tiempo real puede estar temporalmente no disponible',
                                'ru-RU':
                                    'Функция обмена сообщениями в реальном времени может быть временно недоступна',
                                'ja-JP':
                                    'リアルタイムメッセージング機能は一時的に利用できない可能性があります',
                                'pt-BR':
                                    'A funcionalidade de mensagens em tempo real pode estar temporariamente indisponível',
                                'ko-KR':
                                    '실시간 메시징 기능이 일시적으로 사용할 수 없을 수 있습니다',
                                'zh-TW': '即時消息功能可能暫時無法使用',
                            }),
                        },
                    );
                }

                // 连接失败时尝试重连
                if (mountedRef.current) {
                    console.log('Connection failed, attempting to reconnect...');
                    reconnect();
                }
            });

            ablyRef.current.connection.on('suspended', () => {
                isConnectedRef.current = false;
                console.log('Ably connection suspended');
            });

            // 简化状态监听
            ablyRef.current.connection.on((stateChange) => {
                console.log(
                    'Ably connection state:',
                    stateChange.current,
                    'previous:',
                    stateChange.previous,
                );
                if (stateChange.reason) {
                    console.log('State change reason:', stateChange.reason);
                }
            });

            console.log('Waiting for connection...');
            // 等待连接建立，但不阻塞后续设置
            try {
                await Promise.race([
                    new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            console.log(
                                'Connection timeout after 15 seconds, but continuing with setup...',
                            );

                            // 初次连接超时时显示错误提示
                            if (retryCountRef.current === 0) {
                                toast.error(
                                    lang({
                                        'zh-CN': '消息服务连接超时，正在重试...',
                                        'en-US':
                                            'Message service connection timed out, retrying...',
                                        'de-DE':
                                            'Nachrichtendienstverbindung zeitüberschreitung, versuche erneut zu verbinden...',
                                        'fr-FR':
                                            'Échec de la connexion au service de messagerie, tentative de reconnexion...',
                                        'es-ES':
                                            'Error de conexión al servicio de mensajería, intentando reconectar...',
                                        'ru-RU':
                                            'Ошибка подключения к службе сообщений, попытка переподключения...',
                                        'ja-JP':
                                            'メッセージサービスの接続がタイムアウトしました。再接続を試みています...',
                                        'pt-BR':
                                            'Falha na conexão com o serviço de mensagens, tentando reconectar...',
                                        'ko-KR': '메시지 서비스 연결 시간 초과, 재연결 시도 중...',
                                        'zh-TW': '消息服務連接超時，正在重試...',
                                    }),
                                    {
                                        description: lang({
                                            'zh-CN': '请检查网络连接',
                                            'en-US': 'Please check your network connection',
                                            'de-DE': 'Bitte überprüfen Sie Ihre Netzwerkverbindung',
                                            'fr-FR': 'Veuillez vérifier votre connexion réseau',
                                            'es-ES': 'Por favor, verifica tu conexión de red',
                                            'ru-RU':
                                                'Пожалуйста, проверьте ваше сетевое подключение',
                                            'ja-JP': 'ネットワーク接続を確認してください',
                                            'pt-BR': 'Por favor, verifique sua conexão de rede',
                                            'ko-KR': '네트워크 연결을 확인하세요',
                                            'zh-TW': '請檢查您的網絡連接',
                                        }),
                                    },
                                );
                            }

                            resolve(); // 不阻塞后续设置
                        }, 15000);

                        ablyRef.current!.connection.on('connected', () => {
                            console.log('Connection promise resolved');

                            // 连接成功后，如果之前有重试，显示成功提示
                            if (retryCountRef.current > 0) {
                                toast.success(
                                    lang({
                                        'zh-CN': '消息服务已重新连接',
                                        'en-US': 'Message service reconnected successfully',
                                        'de-DE': 'Nachrichtendienst erfolgreich wieder verbunden',
                                        'fr-FR': 'Service de messagerie reconnecté avec succès',
                                        'es-ES': 'Servicio de mensajería reconectado con éxito',
                                        'ru-RU': 'Служба сообщений успешно переподключена',
                                        'ja-JP': 'メッセージサービスが再接続されました',
                                        'pt-BR': 'Serviço de mensagens reconectado com sucesso',
                                        'ko-KR': '메시지 서비스가 성공적으로 재연결되었습니다',
                                        'zh-TW': '消息服務已成功重新連接',
                                    }),
                                    {
                                        description: lang({
                                            'zh-CN': '实时消息功能已恢复',
                                            'en-US': 'Real-time messaging functionality restored',
                                            'de-DE':
                                                'Echtzeit-Nachrichtenfunktion wiederhergestellt',
                                            'fr-FR':
                                                'Fonctionnalité de messagerie en temps réel restaurée',
                                            'es-ES':
                                                'Funcionalidad de mensajería en tiempo real restaurada',
                                            'ru-RU':
                                                'Функция обмена сообщениями в реальном времени восстановлена',
                                            'ja-JP':
                                                'リアルタイムメッセージング機能が復元されました',
                                            'pt-BR':
                                                'Funcionalidade de mensagens em tempo real restaurada',
                                            'ko-KR': '실시간 메시징 기능이 복원되었습니다',
                                            'zh-TW': '即時消息功能已恢復',
                                        }),
                                    },
                                );
                            }

                            clearTimeout(timeout);
                            resolve();
                        });

                        ablyRef.current!.connection.on('failed', (error) => {
                            console.log('Connection promise rejected due to failure');
                            clearTimeout(timeout);
                            reject(error);
                        });
                    }),
                    // 添加一个备用的promise，确保不会永远等待
                    new Promise<void>((resolve) => {
                        setTimeout(() => resolve(), 20000);
                    }),
                ]);
            } catch (error) {
                console.warn('Initial connection failed, will retry:', error);

                // 初次连接失败时显示错误提示
                if (retryCountRef.current === 0) {
                    toast.error(
                        lang({
                            'zh-CN': '消息服务连接失败',
                            'en-US': 'Message service connection failed',
                            'de-DE': 'Nachrichtendienstverbindung fehlgeschlagen',
                            'fr-FR': 'Échec de la connexion au service de messagerie',
                            'es-ES': 'Error de conexión al servicio de mensajería',
                            'ru-RU': 'Ошибка подключения к службе сообщений',
                            'ja-JP': 'メッセージサービスの接続に失敗しました',
                            'pt-BR': 'Falha na conexão com o serviço de mensagens',
                            'ko-KR': '메시지 서비스 연결 실패',
                            'zh-TW': '消息服務連接失敗',
                        }),
                        {
                            description: lang({
                                'zh-CN': '正在尝试重新连接...',
                                'en-US': 'Attempting to reconnect...',
                                'de-DE': 'Versuche erneut zu verbinden...',
                                'fr-FR': 'Tentative de reconnexion...',
                                'es-ES': 'Intentando reconectar...',
                                'ru-RU': 'Попытка переподключения...',
                                'ja-JP': '再接続を試みています...',
                                'pt-BR': 'Tentando reconectar...',
                                'ko-KR': '재연결 시도 중...',
                                'zh-TW': '正在嘗試重新連接...',
                            }),
                        },
                    );
                }

                if (mountedRef.current) {
                    reconnect();
                }
            }

            // 检查组件是否还在挂载状态
            if (!mountedRef.current || !ablyRef.current) {
                console.log('Component unmounted or connection closed during setup');
                return;
            }

            console.log('Setting up channel subscriptions...');
            // 监听 broadcast 频道
            const broadcastChannel = ablyRef.current.channels.get('broadcast');
            broadcastChannel.subscribe('new-message', (message) => {
                console.log('Received broadcast message:', message);
                if (!isConnectedRef.current || !mountedRef.current) return;

                try {
                    const messageData = message.data.message as MessageData;
                    if (messageData?.content) {
                        broadcast({
                            action: 'broadcast',
                            data: messageData.content,
                            type: messageData.type,
                        });
                    }
                } catch (error) {
                    console.error('Error processing broadcast message:', error);
                }
            });
            await broadcastChannel.presence.enter();

            // 监听用户专属频道
            const userChannel = ablyRef.current.channels.get(`user-${userInfo.uid}`);
            userChannel.subscribe((message) => {
                console.log('Received user message:', message);
                if (!isConnectedRef.current || !mountedRef.current) return;

                try {
                    const messageData = message.data as MessageData;
                    if (messageData?.content) {
                        toast(messageData.content);
                    }
                } catch (error) {
                    console.error('Error processing user message:', error);
                }
            });

            console.log('Ably subscriptions initialized');
        } catch (error) {
            console.error('Failed to initialize Ably connection:', error);
            if (mountedRef.current) {
                reconnect();
            }
        } finally {
            isInitializingRef.current = false;
            console.log('=== initializeAbly END ===');
        }
    }, [reconnect]);

    useEffect(() => {
        console.log('useEffect triggered - setting up initialization');

        let initTimeout: NodeJS.Timeout;

        const startInitialization = () => {
            console.log('startInitialization called, mountedRef.current:', mountedRef.current);
            if (mountedRef.current) {
                initializeAbly();
            }
        };

        if (process.env.NODE_ENV === 'development') {
            console.log('Development mode - setting 200ms delay');
            initTimeout = setTimeout(startInitialization, 200);
        } else {
            console.log('Production mode - initializing immediately');
            startInitialization();
        }

        return () => {
            console.log('useEffect cleanup called');
            if (initTimeout) {
                clearTimeout(initTimeout);
            }
            mountedRef.current = false;
            cleanup();
        };
    }, []);

    useEffect(() => {
        console.log('Component mounted, setting mountedRef to true');
        mountedRef.current = true;

        return () => {
            console.log('Component unmounting, setting mountedRef to false');
            mountedRef.current = false;
        };
    }, []);

    return null;
}
