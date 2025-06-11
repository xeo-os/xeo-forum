import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';

type TimelineItem = {
    id: string;
    type: 'post' | 'reply' | 'like';
    createdAt: Date;
    content: any;
};

type Props = {
    item: TimelineItem;
    locale: string;
};

export function TimelineCard({ item, locale }: Props) {
    const getIcon = () => {
        switch (item.type) {
            case 'post':
                return <FileText className='h-4 w-4' />;
            case 'reply':
                return <MessageSquare className='h-4 w-4' />;
            case 'like':
                return <Heart className='h-4 w-4 fill-current' />;
        }
    };

    const getTypeText = () => {
        switch (item.type) {
            case 'post':
                return '发布了帖子';
            case 'reply':
                return '发表了回复';
            case 'like':
                return '点赞了';
        }
    };

    const getContent = () => {
        switch (item.type) {
            case 'post':
                return (
                    <div>
                        <Link
                            href={`/${locale}/post/${item.content.id}`}
                            className='font-medium hover:underline'
                        >
                            {item.content.title}
                        </Link>
                        <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                            {item.content.origin}
                        </p>
                        <div className='flex gap-4 mt-2 text-xs text-muted-foreground'>
                            <span>{item.content._count.Reply} 回复</span>
                            <span>{item.content._count.likes} 点赞</span>
                        </div>
                    </div>
                );
            case 'reply':
                return (
                    <div>
                        {item.content.post && (
                            <Link
                                href={`/${locale}/post/${item.content.post.id}`}
                                className='text-sm text-muted-foreground hover:underline'
                            >
                                回复帖子: {item.content.post.title}
                            </Link>
                        )}
                        <p className='mt-1 line-clamp-3'>{item.content.content}</p>
                        <div className='flex gap-4 mt-2 text-xs text-muted-foreground'>
                            <span>{item.content._count.likes} 点赞</span>
                        </div>
                    </div>
                );
            case 'like':
                return (
                    <div>
                        {item.content.post && (
                            <Link
                                href={`/${locale}/post/${item.content.post.id}`}
                                className='hover:underline'
                            >
                                {item.content.post.title}
                            </Link>
                        )}
                        {item.content.reply && (
                            <p className='line-clamp-2'>{item.content.reply.content}</p>
                        )}
                    </div>
                );
        }
    };

    return (
        <Card className='border-l-4 border-l-primary/20'>
            <CardContent className='pt-4'>
                <div className='flex items-start gap-3'>
                    <div className='flex items-center gap-2 mt-1'>
                        {getIcon()}
                        <Badge variant='outline' className='text-xs'>
                            {getTypeText()}
                        </Badge>
                    </div>
                    <div className='flex-1 min-w-0'>
                        {getContent()}
                        <time className='text-xs text-muted-foreground block mt-2'>
                            {new Date(item.createdAt).toLocaleString(locale)}
                        </time>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
