'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { PostContent } from '@/components/post-content';
import { ReplyList } from '@/components/reply-list';
import { EmojiPicker } from '@/components/emoji-picker';
import token from '@/utils/userToken';

interface PostDetailWrapperProps {
    post: {
        id: number;
        title: string;
        likes: number;
        replies: number;
        isTranslated: boolean;
    };
    initialContent: string;
    replies: any[];
    locale: string;
    currentPage: number;
    totalPages: number;
    initialLikeStatus?: {
        postLiked: boolean;
        replyLikes: Record<string, boolean>;
    };
}

export function PostDetailWrapper({ 
    post, 
    initialContent, 
    replies, 
    locale,
    currentPage,
    totalPages,
    initialLikeStatus 
}: PostDetailWrapperProps) {
    // 点赞相关状态
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [likeStatusLoaded, setLikeStatusLoaded] = useState(false);
    
    // 回复相关状态
    const [showReplyEditor, setShowReplyEditor] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyLikes, setReplyLikes] = useState<Record<string, boolean>>({});
    
    // 原文相关状态
    const [showOriginal, setShowOriginal] = useState(false);
    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);

    const MAX_REPLY_LENGTH = 200;

    // ... 这里需要从 PostDetailClient 复制所有的函数逻辑
    // 为了简化，我将直接修改现有的结构

    return (
        <div className='space-y-6'>
            {/* 帖子内容卡片 */}
            <Card>
                <CardContent className='p-6'>
                    <PostContent 
                        initialContent={initialContent}
                        showOriginal={showOriginal}
                        originalContent={originalContent}
                    />
                </CardContent>
            </Card>

            {/* 其他内容 */}
        </div>
    );
}
