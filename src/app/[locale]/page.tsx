"use server"

import prisma from "../api/_utils/prisma";

import "@/app/globals.css";
type Props = {
  params: { locale: string };
};

type Post = {
  id: number;
  title: string;
  origin: string;
  createdAt: Date;
  published: boolean;
};

export default async function HomePage({ params }: Props) {
  // 与布局文件保持一致的 params 处理方式
  const { locale } = await params;

  // 读取最近文章
  const posts: Post[] = await prisma.post.findMany({
    where: {
      published: true, // Adjusted to match the correct field name
    },
    orderBy: {
      createdAt: "desc", // Adjusted to match the correct field name
    },
    take: 50,
  });

  return (
    <main>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.origin}</p>
          <time dateTime={post.createdAt.toISOString()}>
            {new Date(post.createdAt).toLocaleDateString(locale)}
          </time>
        </article>
      ))}
    </main>
  );
}
