import lang from '@/lib/lang';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const title = lang(
        {
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
        },
        locale,
    );
    return {
        title,
    };
}

export default function SettingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
