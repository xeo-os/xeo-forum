import '@/app/globals.css';
import { Metadata } from 'next';
import lang from '@/lib/lang';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { RiGithubFill } from '@remixicon/react';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({
    params,
}: {
    params: { locale: string };
}): Promise<Metadata> {
    const locale = params.locale || 'en-US';

    const title = lang(
        {
            'zh-CN': '隐私政策 | XEO OS - 交流每个人的观点',
            'en-US': "Privacy Policy | XEO OS - Exchange Everyone's Views",
            'ja-JP': 'プライバシーポリシー | XEO OS - みんなの意見を交換する',
            'ko-KR': '개인정보 처리방침 | XEO OS - 모두의 의견을 교환하다',
            'fr-FR': 'Politique de confidentialité | XEO OS - Échanger les opinions de chacun',
            'es-ES': 'Política de privacidad | XEO OS - Intercambiar las opiniones de todos',
            'de-DE': 'Datenschutzrichtlinie | XEO OS - Meinungen austauschen',
            'pt-BR': 'Política de Privacidade | XEO OS - Trocar as Opiniões de Todos',
            'ru-RU': 'Политика конфиденциальности | XEO OS - Обмен мнениями',
            'zh-TW': '隱私政策 | XEO OS - 交流每個人的觀點',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN':
                '本页面以中文的格式，给出最新的隐私政策。您也可以在 Github 仓库中查阅相关的修改记录。',
            'en-US':
                'This page provides the latest privacy policy in Chinese format. You can also check the modification records in the Github repository.',
            'ja-JP':
                'このページは中国語の形式で最新のプライバシーポリシーを提供します。また、Githubリポジトリで変更履歴を確認することもできます。',
            'ko-KR':
                '이 페이지는 중국어 형식으로 최신 개인정보 처리방침을 제공합니다. 또한 Github 저장소에서 수정 기록을 확인할 수 있습니다.',
            'fr-FR':
                'Cette page fournit la dernière politique de confidentialité au format chinois. Vous pouvez également consulter les enregistrements de modification dans le dépôt Github.',
            'es-ES':
                'Esta página proporciona la última política de privacidad en formato chino. También puede consultar los registros de modificaciones en el repositorio de Github.',
            'de-DE':
                'Diese Seite bietet die neueste Datenschutzrichtlinie im chinesischen Format. Sie können auch die Änderungsprotokolle im Github-Repository einsehen.',
            'pt-BR':
                'Esta página fornece a política de privacidade mais recente no formato chinês. Você também pode verificar os registros de modificação no repositório do Github.',
            'ru-RU':
                'На этой странице представлена последняя политика конфиденциальности в китайском формате. Вы также можете проверить записи изменений в репозитории Github.',
            'zh-TW':
                '本頁面以中文的格式，給出最新的隱私政策。您也可以在 Github 倉庫中查閱相關的修改記錄。',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

async function getPrivacyPolicy() {
    try {
        const response = await fetch(
            'https://markdown.api.ravelloh.top?url=https://raw.githubusercontent.com/xeo-os/xeoos-policies/refs/heads/main/privacy-policy.md',
            {
                next: { revalidate: 86400 }, // 缓存24小时
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch privacy policy');
        }

        const html = await response.text();
        const cacheTime = new Date().toISOString();

        return { html, cacheTime };
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        return {
            html: '<p>加载隐私政策时出现错误，请稍后重试。</p>',
            cacheTime: new Date().toISOString(),
        };
    }
}

export default async function PrivacyPolicyPage({ params }: Props) {
    const locale = params.locale || 'en-US';
    const { html, cacheTime } = await getPrivacyPolicy();

    const languageNotice = lang(
        {
            'zh-CN': '本隐私政策以中文编写，具有法律效力。为确保准确性，我们不提供翻译版本。',
            'en-US':
                'This privacy policy is written in Chinese and has legal effect. To ensure accuracy, we do not provide translated versions.',
            'ja-JP':
                'このプライバシーポリシーは中国語で書かれており、法的効力があります。正確性を確保するため、翻訳版は提供していません。',
            'ko-KR':
                '이 개인정보 처리방침은 중국어로 작성되어 법적 효력이 있습니다. 정확성을 보장하기 위해 번역본을 제공하지 않습니다.',
            'fr-FR':
                "Cette politique de confidentialité est rédigée en chinois et a un effet juridique. Pour garantir l'exactitude, nous ne fournissons pas de versions traduites.",
            'es-ES':
                'Esta política de privacidad está escrita en chino y tiene efecto legal. Para garantizar la precisión, no proporcionamos versiones traducidas.',
            'de-DE':
                'Diese Datenschutzrichtlinie ist auf Chinesisch verfasst und hat rechtliche Wirkung. Um Genauigkeit zu gewährleisten, stellen wir keine übersetzten Versionen zur Verfügung.',
            'pt-BR':
                'Esta política de privacidade é escrita em chinês e tem efeito legal. Para garantir a precisão, não fornecemos versões traduzidas.',
            'ru-RU':
                'Данная политика конфиденциальности написана на китайском языке и имеет юридическую силу. Для обеспечения точности мы не предоставляем переведенные версии.',
            'zh-TW': '本隱私政策以中文編寫，具有法律效力。為確保準確性，我們不提供翻譯版本。',
        },
        locale,
    );

    const githubNotice = lang(
        {
            'zh-CN': '您可以在GitHub仓库中查看隐私政策的完整修改历史，确保透明度。',
            'en-US':
                'You can view the complete modification history of the privacy policy in the GitHub repository to ensure transparency.',
            'ja-JP':
                'GitHubリポジトリでプライバシーポリシーの完全な変更履歴を確認して、透明性を確保できます。',
            'ko-KR':
                'GitHub 저장소에서 개인정보 처리방침의 완전한 수정 기록을 확인하여 투명성을 보장할 수 있습니다.',
            'fr-FR':
                "Vous pouvez consulter l'historique complet des modifications de la politique de confidentialité dans le dépôt GitHub pour assurer la transparence.",
            'es-ES':
                'Puede ver el historial completo de modificaciones de la política de privacidad en el repositorio de GitHub para garantizar la transparencia.',
            'de-DE':
                'Sie können die vollständige Änderungshistorie der Datenschutzrichtlinie im GitHub-Repository einsehen, um Transparenz zu gewährleisten.',
            'pt-BR':
                'Você pode visualizar o histórico completo de modificações da política de privacidade no repositório do GitHub para garantir transparência.',
            'ru-RU':
                'Вы можете просмотреть полную историю изменений политики конфиденциальности в репозитории GitHub, чтобы обеспечить прозрачность.',
            'zh-TW': '您可以在GitHub倉庫中查看隱私政策的完整修改歷史，確保透明度。',
        },
        locale,
    );

    const lastUpdated = lang(
        {
            'zh-CN': '页面缓存更新时间',
            'en-US': 'Page Cache Last Updated',
            'ja-JP': 'ページキャッシュの最終更新日時',
            'ko-KR': '페이지 캐시 마지막 업데이트',
            'fr-FR': 'Dernière mise à jour du cache de la page',
            'es-ES': 'Última actualización de la caché de la página',
            'de-DE': 'Letzte Aktualisierung des Seiten-Caches',
            'pt-BR': 'Última atualização do cache da página',
            'ru-RU': 'Последнее обновление кэша страницы',
            'zh-TW': '頁面快取最後更新時間',
        },
        locale,
    );

    return (
        <div className='container mx-auto px-4 py-8 max-w-4xl'>
            <div className='space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            {lang(
                                {
                                    'zh-CN': '隐私政策',
                                    'en-US': 'Privacy Policy',
                                    'ja-JP': 'プライバシーポリシー',
                                    'ko-KR': '개인정보 처리방침',
                                    'fr-FR': 'Politique de confidentialité',
                                    'es-ES': 'Política de privacidad',
                                    'de-DE': 'Datenschutzrichtlinie',
                                    'pt-BR': 'Política de Privacidade',
                                    'ru-RU': 'Политика конфиденциальности',
                                    'zh-TW': '隱私政策',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {locale !== 'zh-CN' && locale !== 'zh-TW' && (
                            <Alert>
                                <AlertDescription>{languageNotice}</AlertDescription>
                            </Alert>
                        )}

                        <Alert>
                            <AlertDescription className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0'>
                                <div className='flex items-center gap-2'>
                                    <RiGithubFill />
                                    <span>{githubNotice}</span>
                                </div>
                                <Button variant='outline' size='sm' asChild>
                                    <Link
                                        href='https://github.com/xeo-os/xeoos-policies/blob/main/privacy-policy.md'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        GitHub <ExternalLink className='ml-1 h-3 w-3' />
                                    </Link>
                                </Button>
                            </AlertDescription>
                        </Alert>

                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <RefreshCw className='h-4 w-4' />
                            <span>
                                {lastUpdated}: {new Date(cacheTime).toLocaleString(locale)}
                            </span>
                        </div>

                        <div
                            className='prose prose-base prose-slate dark:prose-invert max-w-none 
                         prose-headings:font-bold prose-headings:text-foreground
                         prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                         prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                         prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5
                         prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
                         prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-4
                         prose-strong:text-foreground prose-strong:font-semibold
                         prose-ul:my-4 prose-ul:pl-6 prose-li:my-2 prose-li:text-muted-foreground
                         prose-ol:my-4 prose-ol:pl-6
                         prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 
                         prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:my-4
                         prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                         prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-table:border-collapse prose-table:border prose-table:border-border
                         prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:p-3 prose-th:text-left
                         prose-td:border prose-td:border-border prose-td:p-3
                         prose-hr:border-border prose-hr:my-8'
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
