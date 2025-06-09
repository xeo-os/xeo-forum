import prisma from "@/app/api/_utils/prisma";

import "@/app/globals.css";
type Props = {
  params: { locale: string; uid: string };
};

type Post = {
  id: number;
  title: string;
  origin: string;
  createdAt: Date;
  published: boolean;
};

const metadata = {
  title: "Home",
}

export default async function HomePage({ params }: Props) {
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
            {new Date(post.createdAt).toLocaleDateString(params.locale)}
          </time>
        </article>
      ))}
    </main>
  );
}

export { metadata };