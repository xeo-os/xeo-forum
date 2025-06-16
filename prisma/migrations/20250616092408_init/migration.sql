-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODERATOR', 'USER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'INTERSEX', 'UNSET');

-- CreateTable
CREATE TABLE "User" (
    "uid" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailNotice" BOOLEAN NOT NULL DEFAULT true,
    "emailNoticeLang" VARCHAR(10),
    "username" VARCHAR(20) NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "bio" VARCHAR(255),
    "birth" VARCHAR(10),
    "country" VARCHAR(20),
    "timearea" VARCHAR(10),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gender" "Gender" DEFAULT 'UNSET',
    "password" TEXT NOT NULL,
    "emailVerifyCode" VARCHAR(30),
    "exp" INTEGER NOT NULL DEFAULT 0,
    "lastUseAt" TIMESTAMP(3),
    "profileEmoji" VARCHAR(30),

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "origin" VARCHAR(200) NOT NULL,
    "userUid" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReplyAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originLang" VARCHAR(10),
    "published" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR(50) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pin" BOOLEAN NOT NULL DEFAULT false,
    "contentDEDE" TEXT,
    "contentENUS" TEXT,
    "contentESES" TEXT,
    "contentFRFR" TEXT,
    "contentJAJP" TEXT,
    "contentKOKR" TEXT,
    "contentPTBR" TEXT,
    "contentRURU" TEXT,
    "contentZHCN" TEXT,
    "contentZHTW" TEXT,
    "titleDEDE" TEXT,
    "titleENUS" TEXT,
    "titleESES" TEXT,
    "titleFRFR" TEXT,
    "titleJAJP" TEXT,
    "titleKOKR" TEXT,
    "titlePTBR" TEXT,
    "titleRURU" TEXT,
    "titleZHCN" TEXT,
    "titleZHTW" TEXT,
    "unsafeTags" JSONB,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "uuid" TEXT NOT NULL,
    "userUid" INTEGER NOT NULL,
    "postId" INTEGER,
    "replyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Topic" (
    "name" VARCHAR(100) NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "index" INTEGER NOT NULL DEFAULT 0,
    "nameZHCN" VARCHAR(100),
    "nameENUS" VARCHAR(100),
    "nameZHTW" VARCHAR(100),
    "nameESES" VARCHAR(100),
    "nameFRFR" VARCHAR(100),
    "nameRURU" VARCHAR(100),
    "nameJAJP" VARCHAR(100),
    "nameDEDE" VARCHAR(100),
    "namePTBR" VARCHAR(100),
    "nameKOKR" VARCHAR(100),
    "classificationName" VARCHAR(100) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Classification" (
    "name" VARCHAR(100) NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "index" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nameZHCN" VARCHAR(100),
    "nameENUS" VARCHAR(100),
    "nameZHTW" VARCHAR(100),
    "nameESES" VARCHAR(100),
    "nameFRFR" VARCHAR(100),
    "nameRURU" VARCHAR(100),
    "nameJAJP" VARCHAR(100),
    "nameDEDE" VARCHAR(100),
    "namePTBR" VARCHAR(100),
    "nameKOKR" VARCHAR(100),

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Reply" (
    "id" TEXT NOT NULL,
    "content" VARCHAR(200) NOT NULL,
    "originLang" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postUid" INTEGER,
    "commentUid" TEXT,
    "userUid" INTEGER NOT NULL,
    "likeUserUid" INTEGER[],
    "belongPostid" INTEGER,
    "childReplay" BOOLEAN NOT NULL DEFAULT false,
    "contentDEDE" TEXT,
    "contentENUS" TEXT,
    "contentESES" TEXT,
    "contentFRFR" TEXT,
    "contentJAJP" TEXT,
    "contentKOKR" TEXT,
    "contentPTBR" TEXT,
    "contentRURU" TEXT,
    "contentZHCN" TEXT,
    "contentZHTW" TEXT,
    "unsafeTags" JSONB,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "userUid" INTEGER,
    "postId" INTEGER,
    "replyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "userUid" INTEGER NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "background" VARCHAR(100) NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendShip" (
    "id" SERIAL NOT NULL,
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendShip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "content" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostTopics" (
    "A" INTEGER NOT NULL,
    "B" VARCHAR(100) NOT NULL,

    CONSTRAINT "_PostTopics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "_PostTopics_B_index" ON "_PostTopics"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_classificationName_fkey" FOREIGN KEY ("classificationName") REFERENCES "Classification"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_commentUid_fkey" FOREIGN KEY ("commentUid") REFERENCES "Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_postUid_fkey" FOREIGN KEY ("postUid") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostTopics" ADD CONSTRAINT "_PostTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostTopics" ADD CONSTRAINT "_PostTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("name") ON DELETE CASCADE ON UPDATE CASCADE;
