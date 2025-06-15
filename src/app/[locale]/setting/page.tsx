'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Settings, Save, Loader2, Palette, Mail, Smile } from 'lucide-react';
import lang from '@/lib/lang';
import token from '@/utils/userToken';
import "@/app/globals.css";
import { EmojiPicker } from '@/components/emoji-picker';

// 头像背景预设
const backgroundPresets = [
    'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
    'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    'linear-gradient(135deg, #45b7d1 0%, #96c93d 100%)',
    'linear-gradient(135deg, #96ceb4 0%, #ffeaa7 100%)',
    'radial-gradient(circle, #ff6b6b 0%, #ee5a52 100%)',
    'radial-gradient(circle, #4ecdc4 0%, #44a08d 100%)',
];

// 常用表情符号
const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
    '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱',
    '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶',
    '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
    '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷',
    '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩',
];

// 渐变类型选项
const gradientTypes = [
    { value: 'linear', label: '线性渐变' },
    { value: 'radial', label: '径向渐变' },
    { value: 'conic', label: '圆锥渐变' },
];

type UserData = {
    uid: number;
    username: string;
    nickname: string;
    bio: string | null;
    birth: string | null;
    country: string | null;
    timearea: string | null;
    profileEmoji: string | null;
    emailNotice: boolean;
    avatar: {
        emoji: string;
        background: string;
    }[];
};

export default function SettingPage(props: { params: Promise<{ locale: string }> }) {
    const params = use(props.params);
    const { locale } = params;
    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // 表单数据
    const [formData, setFormData] = useState({
        nickname: '',
        bio: '',
        birth: '',
        country: '',
        timearea: '',
        profileEmoji: '',
        emailNotice: true,
        avatar: {
            emoji: '😀',
            background: backgroundPresets[0],
        },
    });

    // 自定义头像创作
    const [customEmoji, setCustomEmoji] = useState('');
    const [gradientCreator, setGradientCreator] = useState({
        type: 'linear',
        angle: 135,
        color1: '#ff7e5f',
        color2: '#feb47b',
    });

    // 改进的Emoji验证函数
    const isEmoji = (str: string) => {
        const emojiRegex = /([\u2700-\u27BF]|[\u1F600-\u1F64F]|[\u1F300-\u1F5FF]|[\u1F680-\u1F6FF]|[\u1F1E0-\u1F1FF])/g;
        const matches = str.match(emojiRegex);
        return matches && matches.join('') === str;
    };

    const texts = {
        title: lang({
            'zh-CN': '个人设置',
            'en-US': 'Personal Settings',
            'zh-TW': '個人設置',
            'es-ES': 'Configuración Personal',
            'fr-FR': 'Paramètres Personnels',
            'ru-RU': 'Личные Настройки',
            'ja-JP': '個人設定',
            'de-DE': 'Persönliche Einstellungen',
            'pt-BR': 'Configurações Pessoais',
            'ko-KR': '개인 설정',
        }, locale),
        basicInfo: lang({
            'zh-CN': '基本信息',
            'en-US': 'Basic Information',
            'zh-TW': '基本資訊',
            'es-ES': 'Información Básica',
            'fr-FR': 'Informations de Base',
            'ru-RU': 'Основная Информация',
            'ja-JP': '基本情報',
            'de-DE': 'Grundlegende Informationen',
            'pt-BR': 'Informações Básicas',
            'ko-KR': '기본 정보',
        }, locale),
        nickname: lang({
            'zh-CN': '昵称',
            'en-US': 'Nickname',
            'zh-TW': '暱稱',
            'es-ES': 'Apodo',
            'fr-FR': 'Pseudo',
            'ru-RU': 'Никнейм',
            'ja-JP': 'ニックネーム',
            'de-DE': 'Spitzname',
            'pt-BR': 'Apelido',
            'ko-KR': '닉네임',
        }, locale),
        bio: lang({
            'zh-CN': '个人简介',
            'en-US': 'Bio',
            'zh-TW': '個人簡介',
            'es-ES': 'Biografía',
            'fr-FR': 'Bio',
            'ru-RU': 'О себе',
            'ja-JP': '自己紹介',
            'de-DE': 'Bio',
            'pt-BR': 'Bio',
            'ko-KR': '자기소개',
        }, locale),
        birth: lang({
            'zh-CN': '出生日期',
            'en-US': 'Birth Date',
            'zh-TW': '出生日期',
            'es-ES': 'Fecha de Nacimiento',
            'fr-FR': 'Date de Naissance',
            'ru-RU': 'Дата Рождения',
            'ja-JP': '生年月日',
            'de-DE': 'Geburtsdatum',
            'pt-BR': 'Data de Nascimento',
            'ko-KR': '생년월일',
        }, locale),
        country: lang({
            'zh-CN': '国家/地区',
            'en-US': 'Country/Region',
            'zh-TW': '國家/地區',
            'es-ES': 'País/Región',
            'fr-FR': 'Pays/Région',
            'ru-RU': 'Страна/Регион',
            'ja-JP': '国/地域',
            'de-DE': 'Land/Region',
            'pt-BR': 'País/Região',
            'ko-KR': '국가/지역',
        }, locale),
        profileEmoji: lang({
            'zh-CN': '个人表情符号',
            'en-US': 'Profile Emoji',
            'zh-TW': '個人表情符號',
            'es-ES': 'Emoji del Perfil',
            'fr-FR': 'Emoji du Profil',
            'ru-RU': 'Эмодзи Профиля',
            'ja-JP': 'プロフィール絵文字',
            'de-DE': 'Profil-Emoji',
            'pt-BR': 'Emoji do Perfil',
            'ko-KR': '프로필 이모지',
        }, locale),
        avatar: lang({
            'zh-CN': '头像设置',
            'en-US': 'Avatar Settings',
            'zh-TW': '頭像設置',
            'es-ES': 'Configuración de Avatar',
            'fr-FR': 'Paramètres d\'Avatar',
            'ru-RU': 'Настройки Аватара',
            'ja-JP': 'アバター設定',
            'de-DE': 'Avatar-Einstellungen',
            'pt-BR': 'Configurações de Avatar',
            'ko-KR': '아바타 설정',
        }, locale),
        save: lang({
            'zh-CN': '保存更改',
            'en-US': 'Save Changes',
            'zh-TW': '保存更改',
            'es-ES': 'Guardar Cambios',
            'fr-FR': 'Enregistrer les Modifications',
            'ru-RU': 'Сохранить Изменения',
            'ja-JP': '変更を保存',
            'de-DE': 'Änderungen Speichern',
            'pt-BR': 'Salvar Alterações',
            'ko-KR': '변경사항 저장',
        }, locale),
        preview: lang({
            'zh-CN': '预览',
            'en-US': 'Preview',
            'zh-TW': '預覽',
            'es-ES': 'Vista Previa',
            'fr-FR': 'Aperçu',
            'ru-RU': 'Предпросмотр',
            'ja-JP': 'プレビュー',
            'de-DE': 'Vorschau',
            'pt-BR': 'Visualização',
            'ko-KR': '미리보기',
        }, locale),
        selectEmoji: lang({
            'zh-CN': '选择表情符号',
            'en-US': 'Select Emoji',
            'zh-TW': '選擇表情符號',
            'es-ES': 'Seleccionar Emoji',
            'fr-FR': 'Sélectionner Emoji',
            'ru-RU': 'Выбрать Эмодзи',
            'ja-JP': '絵文字を選択',
            'de-DE': 'Emoji Auswählen',
            'pt-BR': 'Selecionar Emoji',
            'ko-KR': '이모지 선택',
        }, locale),
        customEmoji: lang({
            'zh-CN': '输入自定义表情符号',
            'en-US': 'Enter custom emoji',
            'zh-TW': '輸入自定義表情符號',
            'es-ES': 'Ingrese emoji personalizado',
            'fr-FR': 'Entrez un emoji personnalisé',
            'ru-RU': 'Введите пользовательский эмодзи',
            'ja-JP': 'カスタム絵文字を入力',
            'de-DE': 'Benutzerdefiniertes Emoji eingeben',
            'pt-BR': 'Digite emoji personalizado',
            'ko-KR': '사용자 정의 이모지 입력',
        }, locale),
        use: lang({
            'zh-CN': '使用',
            'en-US': 'Use',
            'zh-TW': '使用',
            'es-ES': 'Usar',
            'fr-FR': 'Utiliser',
            'ru-RU': 'Использовать',
            'ja-JP': '使用',
            'de-DE': 'Verwenden',
            'pt-BR': 'Usar',
            'ko-KR': '사용',
        }, locale),
        selectBackground: lang({
            'zh-CN': '选择背景',
            'en-US': 'Select Background',
            'zh-TW': '選擇背景',
            'es-ES': 'Seleccionar Fondo',
            'fr-FR': 'Sélectionner Arrière-plan',
            'ru-RU': 'Выбрать Фон',
            'ja-JP': '背景を選択',
            'de-DE': 'Hintergrund Auswählen',
            'pt-BR': 'Selecionar Fundo',
            'ko-KR': '배경 선택',
        }, locale),
        customGradient: lang({
            'zh-CN': '自定义渐变',
            'en-US': 'Custom Gradient',
            'zh-TW': '自定義漸變',
            'es-ES': 'Gradiente Personalizado',
            'fr-FR': 'Dégradé Personnalisé',
            'ru-RU': 'Пользовательский Градиент',
            'ja-JP': 'カスタムグラデーション',
            'de-DE': 'Benutzerdefinierter Gradient',
            'pt-BR': 'Gradiente Personalizado',
            'ko-KR': '사용자 정의 그라데이션',
        }, locale),
        gradientType: lang({
            'zh-CN': '渐变类型',
            'en-US': 'Gradient Type',
            'zh-TW': '漸變類型',
            'es-ES': 'Tipo de Gradiente',
            'fr-FR': 'Type de Dégradé',
            'ru-RU': 'Тип Градиента',
            'ja-JP': 'グラデーション種類',
            'de-DE': 'Gradient-Typ',
            'pt-BR': 'Tipo de Gradiente',
            'ko-KR': '그라데이션 유형',
        }, locale),
        angleDirection: lang({
            'zh-CN': '角度/方向',
            'en-US': 'Angle/Direction',
            'zh-TW': '角度/方向',
            'es-ES': 'Ángulo/Dirección',
            'fr-FR': 'Angle/Direction',
            'ru-RU': 'Угол/Направление',
            'ja-JP': '角度/方向',
            'de-DE': 'Winkel/Richtung',
            'pt-BR': 'Ângulo/Direção',
            'ko-KR': '각도/방향',
        }, locale),
        color1: lang({
            'zh-CN': '颜色1',
            'en-US': 'Color 1',
            'zh-TW': '顏色1',
            'es-ES': 'Color 1',
            'fr-FR': 'Couleur 1',
            'ru-RU': 'Цвет 1',
            'ja-JP': '色1',
            'de-DE': 'Farbe 1',
            'pt-BR': 'Cor 1',
            'ko-KR': '색상 1',
        }, locale),
        color2: lang({
            'zh-CN': '颜色2',
            'en-US': 'Color 2',
            'zh-TW': '顏色2',
            'es-ES': 'Color 2',
            'fr-FR': 'Couleur 2',
            'ru-RU': 'Цвет 2',
            'ja-JP': '色2',
            'de-DE': 'Farbe 2',
            'pt-BR': 'Cor 2',
            'ko-KR': '색상 2',
        }, locale),
        realtimeSync: lang({
            'zh-CN': '实时同步',
            'en-US': 'Real-time Sync',
            'zh-TW': '即時同步',
            'es-ES': 'Sincronización en Tiempo Real',
            'fr-FR': 'Synchronisation en Temps Réel',
            'ru-RU': 'Синхронизация в Реальном Времени',
            'ja-JP': 'リアルタイム同期',
            'de-DE': 'Echtzeit-Synchronisation',
            'pt-BR': 'Sincronização em Tempo Real',
            'ko-KR': '실시간 동기화',
        }, locale),
        onlyEmojiAllowed: lang({
            'zh-CN': '只能输入表情符号',
            'en-US': 'Only emoji characters allowed',
            'zh-TW': '只能輸入表情符號',
            'es-ES': 'Solo se permiten caracteres emoji',
            'fr-FR': 'Seuls les caractères emoji sont autorisés',
            'ru-RU': 'Разрешены только символы эмодзи',
            'ja-JP': '絵文字のみ入力可能',
            'de-DE': 'Nur Emoji-Zeichen erlaubt',
            'pt-BR': 'Apenas caracteres emoji permitidos',
            'ko-KR': '이모지 문자만 허용됩니다',
        }, locale),
        bioPlaceholder: lang({
            'zh-CN': '介绍一下自己...',
            'en-US': 'Tell us about yourself...',
            'zh-TW': '介紹一下自己...',
            'es-ES': 'Cuéntanos sobre ti...',
            'fr-FR': 'Parlez-nous de vous...',
            'ru-RU': 'Расскажите о себе...',
            'ja-JP': '自己紹介をしてください...',
            'de-DE': 'Erzählen Sie uns von sich...',
            'pt-BR': 'Conte-nos sobre você...',
            'ko-KR': '자신에 대해 알려주세요...',
        }, locale),
        saving: lang({
            'zh-CN': '保存中...',
            'en-US': 'Saving...',
            'zh-TW': '保存中...',
            'es-ES': 'Guardando...',
            'fr-FR': 'Enregistrement...',
            'ru-RU': 'Сохранение...',
            'ja-JP': '保存中...',
            'de-DE': 'Speichern...',
            'pt-BR': 'Salvando...',
            'ko-KR': '저장 중...',
        }, locale),
        emailNotification: lang({
            'zh-CN': '邮箱通知',
            'en-US': 'Email Notification',
            'zh-TW': '郵箱通知',
            'es-ES': 'Notificación por Email',
            'fr-FR': 'Notification par Email',
            'ru-RU': 'Уведомления по Email',
            'ja-JP': 'メール通知',
            'de-DE': 'E-Mail-Benachrichtigung',
            'pt-BR': 'Notificação por Email',
            'ko-KR': '이메일 알림',
        }, locale),
        emailNotificationDesc: lang({
            'zh-CN': '接收重要更新和通知到您的邮箱',
            'en-US': 'Receive important updates and notifications to your email',
            'zh-TW': '接收重要更新和通知到您的郵箱',
            'es-ES': 'Recibir actualizaciones importantes y notificaciones en su email',
            'fr-FR': 'Recevoir des mises à jour importantes et des notifications par email',
            'ru-RU': 'Получать важные обновления и уведомления на вашу почту',
            'ja-JP': '重要なアップデートと通知をメールで受信',
            'de-DE': 'Wichtige Updates und Benachrichtigungen per E-Mail erhalten',
            'pt-BR': 'Receber atualizações importantes e notificações no seu email',
            'ko-KR': '중요한 업데이트와 알림을 이메일로 받기',
        }, locale),
    };

    // 解析CSS渐变字符串为渐变参数
    const parseGradientString = (gradientString: string) => {
        try {
            // 解析线性渐变
            const linearMatch = gradientString.match(/linear-gradient\((\d+)deg,\s*([^,]+)\s+\d+%,\s*([^)]+)\s+\d+%\)/);
            if (linearMatch) {
                return {
                    type: 'linear',
                    angle: parseInt(linearMatch[1]),
                    color1: linearMatch[2].trim(),
                    color2: linearMatch[3].trim(),
                };
            }

            // 解析径向渐变
            const radialMatch = gradientString.match(/radial-gradient\(circle,\s*([^,]+)\s+\d+%,\s*([^)]+)\s+\d+%\)/);
            if (radialMatch) {
                return {
                    type: 'radial',
                    angle: 0,
                    color1: radialMatch[1].trim(),
                    color2: radialMatch[2].trim(),
                };
            }

            // 解析圆锥渐变
            const conicMatch = gradientString.match(/conic-gradient\(from\s+(\d+)deg,\s*([^,]+)\s+\d+%,\s*([^)]+)\s+\d+%\)/);
            if (conicMatch) {
                return {
                    type: 'conic',
                    angle: parseInt(conicMatch[1]),
                    color1: conicMatch[2].trim(),
                    color2: conicMatch[3].trim(),
                };
            }

            // 如果无法解析，返回默认值
            return {
                type: 'linear',
                angle: 135,
                color1: '#ff7e5f',
                color2: '#feb47b',
            };
        } catch (error) {
            console.error('Error parsing gradient:', error);
            return {
                type: 'linear',
                angle: 135,
                color1: '#ff7e5f',
                color2: '#feb47b',
            };
        }
    };

    // 获取用户数据
    const fetchUserData = useCallback(async () => {
        try {
            const userToken = token.get();
            if (!userToken) {
                router.push('/signin');
                return;
            }

            const userInfo = token.getObject();
            if (!userInfo) {
                router.push('/signin');
                return;
            }

            const avatarBackground = userInfo.avatar?.background || backgroundPresets[0];
            
            setFormData({
                nickname: userInfo.nickname || '',
                bio: userInfo.bio || '',
                birth: userInfo.birth || '',
                country: userInfo.country || '',
                timearea: userInfo.timearea || '',
                profileEmoji: userInfo.profileEmoji || '',
                emailNotice: userInfo.emailNotice !== undefined ? userInfo.emailNotice : true,
                avatar: {
                    emoji: userInfo.avatar?.emoji || '😀',
                    background: avatarBackground,
                },
            });

            // 自动解析当前背景到渐变创建器
            const parsedGradient = parseGradientString(avatarBackground);
            setGradientCreator(parsedGradient);
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load user data');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // 保存设置
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const userToken = token.get();
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    ...formData,
                    lang: locale,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success(data.message);
                // 刷新token中的用户信息
                await token.refresh();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            toast.error('Network error, please try again');
        } finally {
            setIsSaving(false);
        }
    };

    // 处理Profile Emoji输入 - 优化toast提示
    const handleProfileEmojiChange = (value: string) => {
        if (value === '' || isEmoji(value)) {
            setFormData(prev => ({ ...prev, profileEmoji: value }));
        } else {
            // 减少toast频率，只在用户停止输入时提示
            const timeoutId = setTimeout(() => {
                toast.error(texts.onlyEmojiAllowed);
            }, 500);
            
            // 清理定时器以避免重复提示
            return () => clearTimeout(timeoutId);
        }
    };

    // 从emoji picker选择Profile Emoji
    const handleProfileEmojiSelect = (emoji: string) => {
        setFormData(prev => ({ ...prev, profileEmoji: prev.profileEmoji + emoji }));
    };

    // 选择背景
    const handleBackgroundSelect = (background: string) => {
        setFormData(prev => ({
            ...prev,
            avatar: { ...prev.avatar, background }
        }));
        
        // 解析选中的背景并更新渐变创建器
        const parsedGradient = parseGradientString(background);
        setGradientCreator(parsedGradient);
    };

    // 选择表情符号
    const handleEmojiSelect = (emoji: string) => {
        setFormData(prev => ({
            ...prev,
            avatar: { ...prev.avatar, emoji }
        }));
    };

    // 添加自定义表情符号 - 优化提示
    const handleAddCustomEmoji = () => {
        if (customEmoji && isEmoji(customEmoji)) {
            handleEmojiSelect(customEmoji);
            setCustomEmoji('');
            toast.success('表情符号已添加');
        } else if (customEmoji) {
            toast.error('请输入有效的表情符号');
        }
    };

    // 更新渐变创建器并实时同步到头像
    const updateGradientCreator = (updates: Partial<typeof gradientCreator>) => {
        const newGradientCreator = { ...gradientCreator, ...updates };
        setGradientCreator(newGradientCreator);
        
        // 立即更新头像背景
        const { type, angle, color1, color2 } = newGradientCreator;
        let gradient = '';
        
        switch (type) {
            case 'linear':
                gradient = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
                break;
            case 'radial':
                gradient = `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
                break;
            case 'conic':
                gradient = `conic-gradient(from ${angle}deg, ${color1} 0%, ${color2} 100%)`;
                break;
        }
        
        setFormData(prev => ({
            ...prev,
            avatar: { ...prev.avatar, background: gradient }
        }));
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Settings className="h-8 w-8" />
                    {texts.title}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{texts.basicInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* 基本信息表单 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nickname">{texts.nickname} *</Label>
                            <Input
                                id="nickname"
                                value={formData.nickname}
                                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                                maxLength={50}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birth">{texts.birth}</Label>
                            <Input
                                id="birth"
                                type="date"
                                value={formData.birth}
                                onChange={(e) => setFormData(prev => ({ ...prev, birth: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="country">{texts.country}</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                maxLength={20}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">{texts.bio}</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            maxLength={255}
                            rows={3}
                            placeholder={texts.bioPlaceholder}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profileEmoji">{texts.profileEmoji}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="profileEmoji"
                                value={formData.profileEmoji}
                                onChange={(e) => handleProfileEmojiChange(e.target.value)}
                                maxLength={30}
                                placeholder="🌟 ✨ 🎯"
                                className="flex-1"
                            />
                            <EmojiPicker
                                onEmojiSelect={handleProfileEmojiSelect}
                                locale={locale}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">{texts.onlyEmojiAllowed}</p>
                    </div>

                    {/* 邮箱通知设置 */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            {texts.emailNotification}
                        </h3>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <Label className="text-base font-medium">{texts.emailNotification}</Label>
                                <p className="text-sm text-muted-foreground">{texts.emailNotificationDesc}</p>
                            </div>
                            <Switch
                                checked={formData.emailNotice}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotice: checked }))
                                }
                            />
                        </div>
                    </div>

                    {/* 头像设置 */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            {texts.avatar}
                        </h3>
                        
                        {/* 头像预览 - 修复emoji居中问题 */}
                        <div className="flex justify-center mb-6">
                            <div className="text-center space-y-2">
                                <div 
                                    className="w-24 h-24 mx-auto rounded-full"
                                    style={{ 
                                        background: formData.avatar.background,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '48px',
                                        lineHeight: '1',
                                        fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
                                    }}
                                >
                                    {formData.avatar.emoji}
                                </div>
                                <p className="text-sm text-muted-foreground">{texts.preview}</p>
                            </div>
                        </div>

                        {/* 表情符号选择 */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <Label>{texts.selectEmoji}</Label>
                                <EmojiPicker
                                    onEmojiSelect={handleEmojiSelect}
                                    locale={locale}
                                    trigger={
                                        <Button variant="outline" size="sm">
                                            <Smile className="h-4 w-4 mr-2" />
                                            {lang({
                                                'zh-CN': '打开表情面板',
                                                'en-US': 'Open Emoji Panel',
                                                'zh-TW': '打開表情面板',
                                                'es-ES': 'Abrir Panel de Emojis',
                                                'fr-FR': 'Ouvrir le Panel d\'Emojis',
                                                'ru-RU': 'Открыть Панель Эмодзи',
                                                'ja-JP': '絵文字パネルを開く',
                                                'de-DE': 'Emoji-Panel öffnen',
                                                'pt-BR': 'Abrir Painel de Emojis',
                                                'ko-KR': '이모지 패널 열기',
                                            }, locale)}
                                        </Button>
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-10 gap-2 p-4 border rounded-lg max-h-32 overflow-y-auto">
                                {commonEmojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`text-2xl p-2 rounded hover:bg-muted transition-colors ${
                                            formData.avatar.emoji === emoji ? 'bg-primary text-primary-foreground' : ''
                                        }`}
                                        onClick={() => handleEmojiSelect(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            
                            {/* 自定义表情符号输入 */}
                            <div className="flex gap-2">
                                <Input
                                    value={customEmoji}
                                    onChange={(e) => setCustomEmoji(e.target.value)}
                                    placeholder={texts.customEmoji}
                                    maxLength={2}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddCustomEmoji}
                                >
                                    {texts.use}
                                </Button>
                                <EmojiPicker
                                    onEmojiSelect={(emoji) => setCustomEmoji(emoji)}
                                    locale={locale}
                                />
                            </div>
                        </div>

                        {/* 背景选择 */}
                        <div className="space-y-4">
                            <Label>{texts.selectBackground}</Label>
                            <div className="grid grid-cols-6 gap-3 mb-4">
                                {backgroundPresets.map((bg, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`h-12 w-full rounded-lg border-2 transition-all ${
                                            formData.avatar.background === bg 
                                                ? 'border-primary scale-105' 
                                                : 'border-muted hover:border-primary/50'
                                        }`}
                                        style={{ background: bg }}
                                        onClick={() => handleBackgroundSelect(bg)}
                                    />
                                ))}
                            </div>

                            {/* 渐变创建器 */}
                            <div className="border rounded-lg p-4 space-y-4">
                               
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{texts.gradientType}</Label>
                                        <Select
                                            value={gradientCreator.type}
                                            onValueChange={(value) => updateGradientCreator({ type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradientTypes.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>{texts.angleDirection}: {gradientCreator.angle}°</Label>
                                        <Slider
                                            value={[gradientCreator.angle]}
                                            onValueChange={(value) => updateGradientCreator({ angle: value[0] })}
                                            max={360}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>{texts.color1}</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="color"
                                                value={gradientCreator.color1}
                                                onChange={(e) => updateGradientCreator({ color1: e.target.value })}
                                                className="w-16 h-10 p-1 border rounded"
                                            />
                                            <Input
                                                type="text"
                                                value={gradientCreator.color1}
                                                onChange={(e) => updateGradientCreator({ color1: e.target.value })}
                                                className="flex-1"
                                                placeholder="#ff7e5f"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>{texts.color2}</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="color"
                                                value={gradientCreator.color2}
                                                onChange={(e) => updateGradientCreator({ color2: e.target.value })}
                                                className="w-16 h-10 p-1 border rounded"
                                            />
                                            <Input
                                                type="text"
                                                value={gradientCreator.color2}
                                                onChange={(e) => updateGradientCreator({ color2: e.target.value })}
                                                className="flex-1"
                                                placeholder="#feb47b"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 保存按钮 */}
            <div className="flex justify-end mt-8">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {texts.saving}
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {texts.save}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
