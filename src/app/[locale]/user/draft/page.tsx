import { Metadata } from 'next';
import lang from '@/lib/lang';
import { UserDraftsManagement } from '@/components/user-drafts-management';
import '@/app/globals.css';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    const title = lang(
        {
            'zh-CN': '我的草稿 | XEO OS',
            'en-US': 'My Drafts | XEO OS',
            'zh-TW': '我的草稿 | XEO OS',
            'es-ES': 'Mis Borradores | XEO OS',
            'fr-FR': 'Mes Brouillons | XEO OS',
            'ru-RU': 'Мои Черновики | XEO OS',
            'ja-JP': '私の下書き | XEO OS',
            'de-DE': 'Meine Entwürfe | XEO OS',
            'pt-BR': 'Meus Rascunhos | XEO OS',
            'ko-KR': '내 초안 | XEO OS',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '管理您在XEO OS上的所有草稿，继续编辑或发布您的内容。',
            'en-US': 'Manage all your drafts on XEO OS, continue editing or publish your content.',
            'zh-TW': '管理您在XEO OS上的所有草稿，繼續編輯或發布您的內容。',
            'es-ES': 'Gestiona todos tus borradores en XEO OS, continúa editando o publica tu contenido.',
            'fr-FR': 'Gérez tous vos brouillons sur XEO OS, continuez à éditer ou publiez votre contenu.',
            'ru-RU': 'Управляйте всеми своими черновиками на XEO OS, продолжайте редактирование или публикуйте контент.',
            'ja-JP': 'XEO OSですべての下書きを管理し、編集を続けるかコンテンツを公開します。',
            'de-DE': 'Verwalten Sie alle Ihre Entwürfe auf XEO OS, setzen Sie die Bearbeitung fort oder veröffentlichen Sie Ihren Inhalt.',
            'pt-BR': 'Gerencie todos os seus rascunhos no XEO OS, continue editando ou publique seu conteúdo.',
            'ko-KR': 'XEO OS에서 모든 초안을 관리하고 편집을 계속하거나 콘텐츠를 게시합니다.',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default async function UserDraftsPage({ params }: Props) {
    const { locale } = await params;

    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
            <UserDraftsManagement locale={locale} />
        </main>
    );
}
