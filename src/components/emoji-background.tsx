import React from 'react';

interface EmojiBackgroundProps {
    primaryColor?: string;
    userEmojis?: string | null;
}

const EmojiBackground: React.FC<EmojiBackgroundProps> = ({
    primaryColor = '#f0b100',
    userEmojis,
}) => {
    // 默认表情符号
    const defaultEmojis = [
        '🌟',
        '💭',
        '🌍',
        '💬',
        '🚀',
        '✨',
        '🎯',
        '💡',
        '🔥',
        '🎉',
        '🎨',
        '🌈',
        '⚽',
        '🏀',
        '🏈',
        '🎮',
        '🎸',
        '🎧',
        '📱',
        '💻',
        '🖥️',
        '🕹️',
        '🎁',
        '📦',
        '📚',
        '📝',
        '📷',
        '🎬',
    ];

    // 简单的伪随机函数，基于种子确保一致性
    const seededRandom = (seed: number): number => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    // 解析用户表情符号
    const parseUserEmojis = (emojiString: string | null): string[] => {
        if (!emojiString || emojiString.trim() === '') {
            return defaultEmojis;
        }

        // 使用正则表达式拆分表情符号，支持Unicode表情符号
        const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
        const matches = emojiString.match(emojiRegex);
        
        // 如果没有匹配到表情符号，尝试按空格分割
        const userEmojiList = matches || emojiString.split(' ').filter((emoji) => emoji.trim() !== '');

        // 如果用户表情符号太少，用默认表情符号补充
        if (userEmojiList.length < 20) {
            const needed = 28 - userEmojiList.length;
            // 使用固定种子确保服务端和客户端一致
            const shuffledDefaults = [...defaultEmojis]
                .map((emoji, index) => ({
                    emoji,
                    sort: seededRandom(index + (userEmojis?.length || 0)),
                }))
                .sort((a, b) => a.sort - b.sort)
                .map((item) => item.emoji);
            return [...userEmojiList, ...shuffledDefaults.slice(0, needed)];
        }

        return userEmojiList.slice(0, 28); // 最多28个表情符号
    };

    const emojis = parseUserEmojis(userEmojis ?? null);

    return (
        <div className='absolute inset-0 overflow-hidden'>
            {/* 主渐变背景 */}
            <div
                className='absolute inset-0'
                style={{
                    background: `linear-gradient(135deg, 
            ${primaryColor}f5 0%, 
            ${primaryColor}e8 30%, 
            ${primaryColor}dd 60%, 
            ${primaryColor}cc 100%)`,
                }}
            />

            {/* 飘落的emoji */}
            {emojis.map((emoji, index) => (
                <div
                    key={`${emoji}-${index}`}
                    className='absolute text-2xl pointer-events-none select-none'
                    style={{
                        left: `${(index * 8.33) % 100}%`,
                        bottom: '-50px',
                        animation: `emoji-float-${index % 4} ${8 + (index % 3) * 2}s linear infinite`,
                        animationDelay: `${index * 0.8}s`,
                        opacity: 0,
                    }}
                >
                    {emoji}
                </div>
            ))}

            <style
                dangerouslySetInnerHTML={{
                    __html: `
          @keyframes emoji-float-0 {
            0% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            90% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(-270px) translateX(30px) rotate(180deg);
              opacity: 0;
            }
          }
          
          @keyframes emoji-float-1 {
            0% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            90% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(-270px) translateX(-40px) rotate(-180deg);
              opacity: 0;
            }
          }
          
          @keyframes emoji-float-2 {
            0% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            90% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(-270px) translateX(60px) rotate(270deg);
              opacity: 0;
            }
          }
          
          @keyframes emoji-float-3 {
            0% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            90% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(-270px) translateX(-20px) rotate(90deg);
              opacity: 0;
            }
          }
        `,
                }}
            />
        </div>
    );
};

export default EmojiBackground;
