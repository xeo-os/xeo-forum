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
            'zh-CN': '服务条款 | XEO OS - 交流每个人的观点',
            'en-US': "Terms of Service | XEO OS - Exchange Everyone's Views",
            'ja-JP': '利用規約 | XEO OS - みんなの意見を交換する',
            'ko-KR': '서비스 약관 | XEO OS - 모두의 의견을 교환하다',
            'fr-FR': 'Conditions de service | XEO OS - Échanger les opinions de chacun',
            'es-ES': 'Términos de servicio | XEO OS - Intercambiar las opiniones de todos',
            'de-DE': 'Nutzungsbedingungen | XEO OS - Meinungen austauschen',
            'pt-BR': 'Termos de Serviço | XEO OS - Trocar as Opiniões de Todos',
            'ru-RU': 'Условия обслуживания | XEO OS - Обмен мнениями',
            'zh-TW': '服務條款 | XEO OS - 交流每個人的觀點',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN':
                '本页面以中文的格式，给出最新的服务条款。您也可以在 Github 仓库中查阅相关的修改记录。',
            'en-US':
                'This page provides the latest terms of service in Chinese format. You can also check the modification records in the Github repository.',
            'ja-JP':
                'このページは中国語の形式で最新の利用規約を提供します。また、Githubリポジトリで変更履歴を確認することもできます。',
            'ko-KR':
                '이 페이지는 중국어 형식으로 최신 서비스 약관을 제공합니다. 또한 Github 저장소에서 수정 기록을 확인할 수 있습니다.',
            'fr-FR':
                'Cette page fournit les dernières conditions de service au format chinois. Vous pouvez également consulter les enregistrements de modification dans le dépôt Github.',
            'es-ES':
                'Esta página proporciona los últimos términos de servicio en formato chino. También puede consultar los registros de modificaciones en el repositorio de Github.',
            'de-DE':
                'Diese Seite bietet die neuesten Nutzungsbedingungen im chinesischen Format. Sie können auch die Änderungsprotokolle im Github-Repository einsehen.',
            'pt-BR':
                'Esta página fornece os termos de serviço mais recentes no formato chinês. Você também pode verificar os registros de modificação no repositório do Github.',
            'ru-RU':
                'На этой странице представлены последние условия обслуживания в китайском формате. Вы также можете проверить записи изменений в репозитории Github.',
            'zh-TW':
                '本頁面以中文的格式，給出最新的服務條款。您也可以在 Github 倉庫中查閱相關的修改記錄。',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

async function getTermsOfService() {
    try {
        const response = await fetch(
            'https://markdown.api.ravelloh.top?url=https://raw.githubusercontent.com/xeo-os/xeoos-policies/refs/heads/main/terms-of-service.md',
            {
                next: { revalidate: 86400 }, // 缓存24小时
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch terms of service');
        }

        const html = await response.text();
        const cacheTime = new Date().toISOString();

        return { html, cacheTime };
    } catch (error) {
        console.error('Error fetching terms of service:', error);
        return {
            html: '<p>加载服务条款时出现错误，请稍后重试。</p>',
            cacheTime: new Date().toISOString(),
        };
    }
}

export default async function TermsOfServicePage({ params }: Props) {
    const locale = params.locale || 'en-US';
    const { html, cacheTime } = await getTermsOfService();

    const languageNotice = lang(
        {
            'zh-CN': '本服务条款以中文编写，具有法律效力。为确保准确性，我们不提供翻译版本。',
            'en-US':
                'These terms of service are written in Chinese and have legal effect. To ensure accuracy, we do not provide translated versions.',
            'ja-JP':
                'この利用規約は中国語で書かれており、法的効力があります。正確性を確保するため、翻訳版は提供していません。',
            'ko-KR':
                '이 서비스 약관은 중국어로 작성되어 법적 효력이 있습니다. 정확성을 보장하기 위해 번역본을 제공하지 않습니다.',
            'fr-FR':
                "Ces conditions de service sont rédigées en chinois et ont un effet juridique. Pour garantir l'exactitude, nous ne fournissons pas de versions traduites.",
            'es-ES':
                'Estos términos de servicio están escritos en chino y tienen efecto legal. Para garantizar la precisión, no proporcionamos versiones traducidas.',
            'de-DE':
                'Diese Nutzungsbedingungen sind auf Chinesisch verfasst und haben rechtliche Wirkung. Um Genauigkeit zu gewährleisten, stellen wir keine übersetzten Versionen zur Verfügung.',
            'pt-BR':
                'Estes termos de serviço são escritos em chinês e têm efeito legal. Para garantir a precisão, não fornecemos versões traduzidas.',
            'ru-RU':
                'Данные условия обслуживания написаны на китайском языке и имеют юридическую силу. Для обеспечения точности мы не предоставляем переведенные версии.',
            'zh-TW': '本服務條款以中文編寫，具有法律效力。為確保準確性，我們不提供翻譯版本。',
        },
        locale,
    );

    const githubNotice = lang(
        {
            'zh-CN': '您可以在GitHub仓库中查看服务条款的完整修改历史，确保透明度。',
            'en-US':
                'You can view the complete modification history of the terms of service in the GitHub repository to ensure transparency.',
            'ja-JP': 'GitHubリポジトリで利用規約の完全な変更履歴を確認して、透明性を確保できます。',
            'ko-KR':
                'GitHub 저장소에서 서비스 약관의 완전한 수정 기록을 확인하여 투명성을 보장할 수 있습니다.',
            'fr-FR':
                "Vous pouvez consulter l'historique complet des modifications des conditions de service dans le dépôt GitHub pour assurer la transparence.",
            'es-ES':
                'Puede ver el historial completo de modificaciones de los términos de servicio en el repositorio de GitHub para garantizar la transparencia.',
            'de-DE':
                'Sie können die vollständige Änderungshistorie der Nutzungsbedingungen im GitHub-Repository einsehen, um Transparenz zu gewährleisten.',
            'pt-BR':
                'Você pode visualizar o histórico completo de modificações dos termos de serviço no repositório do GitHub para garantir transparência.',
            'ru-RU':
                'Вы можете просмотреть полную историю изменений условий обслуживания в репозитории GitHub, чтобы обеспечить прозрачность.',
            'zh-TW': '您可以在GitHub倉庫中查看服務條款的完整修改歷史，確保透明度。',
        },
        locale,
    );

    const lastUpdated = lang(
        {
            'zh-CN': '最后更新时间',
            'en-US': 'Last Updated',
            'ja-JP': '最終更新日',
            'ko-KR': '마지막 업데이트',
            'fr-FR': 'Dernière mise à jour',
            'es-ES': 'Última actualización',
            'de-DE': 'Zuletzt aktualisiert',
            'pt-BR': 'Última atualização',
            'ru-RU': 'Последнее обновление',
            'zh-TW': '最後更新時間',
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
                                    'zh-CN': '服务条款',
                                    'en-US': 'Terms of Service',
                                    'ja-JP': '利用規約',
                                    'ko-KR': '서비스 약관',
                                    'fr-FR': 'Conditions de service',
                                    'es-ES': 'Términos de servicio',
                                    'de-DE': 'Nutzungsbedingungen',
                                    'pt-BR': 'Termos de Serviço',
                                    'ru-RU': 'Условия обслуживания',
                                    'zh-TW': '服務條款',
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
                                        href='https://github.com/xeo-os/xeoos-policies/blob/main/terms-of-service.md'
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
