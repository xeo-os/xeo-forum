"use server";

import lang from "@/lib/lang";
import prisma from "../api/_utils/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Pin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "@/app/globals.css";

type Props = {
  params: { locale: string };
  searchParams: { page?: string };
};

type Post = {
  id: number;
  title: string;
  origin: string;
  createdAt: Date;
  published: boolean;
  pin: boolean;
  originLang: string | null;
  titleDEDE: string | null;
  titleENUS: string | null;
  titleESES: string | null;
  titleFRFR: string | null;
  titleJAJP: string | null;
  titleKOKR: string | null;
  titlePTBR: string | null;
  titleRURU: string | null;
  titleZHCN: string | null;
  titleZHTW: string | null;
  User: {
    uid: number;
    nickname: string;
    username: string;
    profileEmoji: string | null;
    avatar: { id: string; emoji: string; background: string }[];
  } | null;
  _count: {
    likes: number;
    Reply: number;
  };
  topics: {
    name: string;
    emoji: string;
    nameZHCN?: string | null;
    nameENUS?: string | null;
    nameZHTW?: string | null;
    nameESES?: string | null;
    nameFRFR?: string | null;
    nameRURU?: string | null;
    nameJAJP?: string | null;
    nameDEDE?: string | null;
    namePTBR?: string | null;
    nameKOKR?: string | null;
  }[];
};

const POSTS_PER_PAGE = 20;

function getLocalizedTitle(post: Post, locale: string): string {
  const titleMap: Record<string, string | null> = {
    "zh-CN": post.titleZHCN,
    "en-US": post.titleENUS,
    "zh-TW": post.titleZHTW,
    "es-ES": post.titleESES,
    "fr-FR": post.titleFRFR,
    "ru-RU": post.titleRURU,
    "ja-JP": post.titleJAJP,
    "de-DE": post.titleDEDE,
    "pt-BR": post.titlePTBR,
    "ko-KR": post.titleKOKR,
  };

  return titleMap[locale] || post.title;
}

function getLocalizedTopicName(
  topic: Post["topics"][0],
  locale: string
): string {
  const nameMap: Record<string, string | null | undefined> = {
    "zh-CN": topic.nameZHCN,
    "en-US": topic.nameENUS,
    "zh-TW": topic.nameZHTW,
    "es-ES": topic.nameESES,
    "fr-FR": topic.nameFRFR,
    "ru-RU": topic.nameRURU,
    "ja-JP": topic.nameJAJP,
    "de-DE": topic.nameDEDE,
    "pt-BR": topic.namePTBR,
    "ko-KR": topic.nameKOKR,
  };

  return nameMap[locale] || topic.name;
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const page = parseInt(searchParams.page || "1");
  const skip = (page - 1) * POSTS_PER_PAGE;

  const [posts, totalPosts]: [Post[], number] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        originLang: {
          not: null,
        },
      },
      include: {
        User: {
          select: {
            uid: true,
            nickname: true,
            username: true,
            profileEmoji: true,
            avatar: {
              select: {
                id: true,
                emoji: true,
                background: true,
              },
              take: 1,
            },
          },
        },
        _count: {
          select: {
            likes: true,
            Reply: true,
          },
        },
        topics: {
          select: {
            name: true,
            emoji: true,
            nameZHCN: true,
            nameENUS: true,
            nameZHTW: true,
            nameESES: true,
            nameFRFR: true,
            nameRURU: true,
            nameJAJP: true,
            nameDEDE: true,
            namePTBR: true,
            nameKOKR: true,
          },
          take: 3,
        },
      },
      orderBy: [{ pin: "desc" }, { createdAt: "desc" }],
      skip,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({
      where: {
        published: true,
        originLang: {
          not: null,
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const labels = {
    title: lang(
      {
        "zh-CN": "XEO OS - 交流每个人的观点",
        "en-US": "XEO OS - Xchange Everyone's Opinions",
        "zh-TW": "XEO OS - 交流每個人的觀點",
        "es-ES": "XEO OS - Intercambia las opiniones de todos",
        "fr-FR": "XEO OS - Échangez les opinions de chacun",
        "ru-RU": "XEO OS - Обменивайтесь мнениями всех",
        "ja-JP": "XEO OS - みんなの意見を交換",
        "de-DE": "XEO OS - Teile die Meinungen aller",
        "pt-BR": "XEO OS - Troque as opiniões de todos",
        "ko-KR": "XEO OS - 모두의 의견을 교환하세요",
      },
      locale
    ),
    latestPosts: lang(
      {
        "zh-CN": "最新帖子",
        "en-US": "Latest Posts",
        "zh-TW": "最新貼文",
        "es-ES": "Últimas publicaciones",
        "fr-FR": "Derniers messages",
        "ru-RU": "Последние сообщения",
        "ja-JP": "最新の投稿",
        "de-DE": "Neueste Beiträge",
        "pt-BR": "Postagens mais recentes",
        "ko-KR": "최신 게시물",
      },
      locale
    ),
    replies: lang(
      {
        "zh-CN": "回复",
        "en-US": "replies",
        "zh-TW": "回覆",
        "es-ES": "respuestas",
        "fr-FR": "réponses",
        "ru-RU": "ответы",
        "ja-JP": "返信",
        "de-DE": "Antworten",
        "pt-BR": "respostas",
        "ko-KR": "답글",
      },
      locale
    ),
    likes: lang(
      {
        "zh-CN": "点赞",
        "en-US": "likes",
        "zh-TW": "按讚",
        "es-ES": "me gusta",
        "fr-FR": "j'aime",
        "ru-RU": "лайки",
        "ja-JP": "いいね",
        "de-DE": "Gefällt mir",
        "pt-BR": "curtidas",
        "ko-KR": "좋아요",
      },
      locale
    ),
    previous: lang(
      {
        "zh-CN": "上一页",
        "en-US": "Previous",
        "zh-TW": "上一頁",
        "es-ES": "Anterior",
        "fr-FR": "Précédent",
        "ru-RU": "Предыдущая",
        "ja-JP": "前へ",
        "de-DE": "Vorherige",
        "pt-BR": "Anterior",
        "ko-KR": "이전",
      },
      locale
    ),
    next: lang(
      {
        "zh-CN": "下一页",
        "en-US": "Next",
        "zh-TW": "下一頁",
        "es-ES": "Siguiente",
        "fr-FR": "Suivant",
        "ru-RU": "Следующая",
        "ja-JP": "次へ",
        "de-DE": "Nächste",
        "pt-BR": "Próximo",
        "ko-KR": "다음",
      },
      locale
    ),
  };

  return (
    <main className="mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{labels.latestPosts}</h1>
        <p className="text-sm text-muted-foreground">
          {lang(
            {
              "zh-CN": `第 ${page} 页，共 ${totalPages} 页`,
              "en-US": `Page ${page} of ${totalPages}`,
              "zh-TW": `第 ${page} 頁，共 ${totalPages} 頁`,
              "es-ES": `Página ${page} de ${totalPages}`,
              "fr-FR": `Page ${page} sur ${totalPages}`,
              "ru-RU": `Страница ${page} из ${totalPages}`,
              "ja-JP": `${totalPages}ページ中${page}ページ`,
              "de-DE": `Seite ${page} von ${totalPages}`,
              "pt-BR": `Página ${page} de ${totalPages}`,
              "ko-KR": `${totalPages}페이지 중 ${page}페이지`,
            },
            locale
          )}
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="divide-y">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage
                      src={
                        post.User?.avatar[0]?.id
                          ? `/api/dynamicImage/emoji/?emoji=${post.User.avatar[0].emoji}&background=${encodeURIComponent(
                              post.User.avatar[0].background.replaceAll(
                                "%",
                                "%25"
                              )
                            )}`
                          : undefined
                      }
                      alt={
                        post.User?.nickname ||
                        post.User?.username ||
                        "User Avatar"
                      }
                    />
                    <AvatarFallback
                      style={{
                        backgroundColor:
                          post.User?.avatar[0]?.background || "#e5e7eb",
                        fontSize: "0.8rem",
                      }}
                    >
                      {post.User?.avatar[0]?.emoji ||
                        post.User?.profileEmoji ||
                        post.User?.nickname?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${locale}/post/${post.id}`}
                        className="font-medium hover:text-primary transition-colors truncate text-sm"
                      >
                        {getLocalizedTitle(post, locale)}
                      </Link>
                      {post.pin && (
                        <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="truncate max-w-16">
                        {post.User?.nickname || "Anonymous"}
                      </span>
                      <span>•</span>
                      <time dateTime={post.createdAt.toISOString()}>
                        {new Date(post.createdAt).toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                          year:
                            new Date(post.createdAt).getFullYear() !==
                            new Date().getFullYear()
                              ? "numeric"
                              : undefined,
                        })}
                      </time>
                      <span>•</span>
                      <span className="text-xs line-clamp-1 max-w-24 sm:max-w-40">
                        {post.topics.length > 0 && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {post.topics.slice(0, 2).map((topic) => (
                              <Badge
                                key={topic.name}
                                variant="secondary"
                                className="text-xs px-1 py-0.5 h-auto"
                              >
                                <span className="mr-0.5">{topic.emoji}</span>
                                <span className="hidden sm:inline text-xs">
                                  {getLocalizedTopicName(topic, locale)}
                                </span>
                              </Badge>
                            ))}
                            {post.topics.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{post.topics.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{post._count.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post._count.Reply}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/page/${page - 1}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {labels.previous}
              </Link>
            </Button>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  asChild
                  className="w-8 h-8 p-0"
                >
                  <Link href={`/${locale}/page/${pageNum}`}>{pageNum}</Link>
                </Button>
              );
            })}
          </div>

          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/page/${page + 1}`}>
                {labels.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
