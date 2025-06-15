import { Metadata } from 'next';
import lang from '@/lib/lang';
import { UserPostsManagement } from '@/components/user-posts-management';
import '@/app/globals.css';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    const title = lang(
        {
            'zh-CN': '我的帖子 | XEO OS',
            'en-US': 'My Posts | XEO OS',
            'zh-TW': '我的帖子 | XEO OS',
            'es-ES': 'Mis Publicaciones | XEO OS',
            'fr-FR': 'Mes Messages | XEO OS',
            'ru-RU': 'Мои Посты | XEO OS',
            'ja-JP': '私の投稿 | XEO OS',
            'de-DE': 'Meine Beiträge | XEO OS',
            'pt-BR': 'Minhas Postagens | XEO OS',
            'ko-KR': '내 게시물 | XEO OS',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '管理您在XEO OS上发布的所有帖子，查看统计数据并进行编辑操作。',
            'en-US': 'Manage all your posts on XEO OS, view statistics and perform editing operations.',
            'zh-TW': '管理您在XEO OS上發布的所有帖子，查看統計數據並進行編輯操作。',
            'es-ES': 'Gestiona todas tus publicaciones en XEO OS, ve estadísticas y realiza operaciones de edición.',
            'fr-FR': 'Gérez tous vos posts sur XEO OS, consultez les statistiques et effectuez des opérations d\'édition.',
            'ru-RU': 'Управляйте всеми своими постами на XEO OS, просматривайте статистику и выполняйте операции редактирования.',
            'ja-JP': 'XEO OSで公開したすべての投稿を管理し、統計を確認して編集操作を実行します。',
            'de-DE': 'Verwalten Sie alle Ihre Beiträge auf XEO OS, sehen Sie sich Statistiken an und führen Sie Bearbeitungsvorgänge durch.',
            'pt-BR': 'Gerencie todas as suas postagens no XEO OS, visualize estatísticas e execute operações de edição.',
            'ko-KR': 'XEO OS에서 게시한 모든 게시물을 관리하고 통계를 확인하며 편집 작업을 수행합니다.',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default async function UserPostsPage({ params }: Props) {
    const { locale } = await params;

    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
            <UserPostsManagement locale={locale} />
        </main>
    );
}
