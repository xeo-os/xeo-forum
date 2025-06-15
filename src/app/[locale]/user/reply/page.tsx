import { Metadata } from 'next';
import lang from '@/lib/lang';
import { UserRepliesManagement } from '@/components/user-replies-management';
import '@/app/globals.css';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    const title = lang(
        {
            'zh-CN': '我的回复 | XEO OS',
            'de-DE': 'Meine Antworten | XEO OS',
            'en-US': 'My Replies | XEO OS',
            'es-ES': 'Mis Respuestas | XEO OS',
            'fr-FR': 'Mes Réponses | XEO OS',
            'ru-RU': 'Мои Ответы | XEO OS',
            'ja-JP': '私の返信 | XEO OS',
            'pt-BR': 'Minhas Respostas | XEO OS',
            'ko-KR': '내 답변 | XEO OS',
            'zh-TW': '我的回覆 | XEO OS',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '管理您在 XEO OS 上发布的所有回复，查看统计数据并进行编辑操作。',
            'de-DE': 'Verwalten Sie alle Ihre Antworten auf XEO OS, sehen Sie Statistiken und bearbeiten Sie sie.',
            'en-US': 'Manage all your replies on XEO OS, view statistics, and perform editing operations.',
            'es-ES': 'Administra todas tus respuestas en XEO OS, visualiza estadísticas y realiza operaciones de edición.',
            'fr-FR': 'Gérez toutes vos réponses sur XEO OS, consultez les statistiques et effectuez des opérations d\'édition.',
            'ru-RU': 'Управляйте всеми своими ответами на XEO OS, просматривайте статистику и выполняйте операции редактирования.',
            'ja-JP': 'XEO OS でのすべての返信を管理し、統計を表示し、編集操作を行います。',
            'pt-BR': 'Gerencie todas as suas respostas no XEO OS, visualize estatísticas e execute operações de edição.',
            'ko-KR': 'XEO OS에서 작성한 모든 답변을 관리하고 통계를 확인하며 편집 작업을 수행하세요.',
            'zh-TW': '管理您在 XEO OS 上發佈的所有回覆，查看統計數據並進行編輯操作。',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default async function UserRepliesPage({ params }: Props) {
    const { locale } = await params;

    return (
        <main className='container mx-auto px-4 py-8 max-w-4xl'>
            <UserRepliesManagement locale={locale} />
        </main>
    );
}
