import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

const emojis = [
  "🌐",
  "🏠",
  "⭐",
  "📰",
  "💬",
  "📢",
  "🤝",
  "📚",
  "📘",
  "🧠",
  "💻",
  "🧪",
  "🎮",
  "🎬",
  "🎵",
  "📷",
  "📚",
  "🎨",
  "✈",
  "🍳",
  "🏃",
  "🏡",
  "🐶",
  "💄",
  "💼",
  "🧑‍💼",
  "💸",
  "🧳",
  "📈",
  "🖥",
  "📱",
  "🌐",
  "✍",
  "🧩",
  "🚨",
  "🚀",
  "🌟",
  "🌈",
  "🔥",
  "⚡",
  "🌊",
  "🍎",
  "🍕",
  "🍩",
  "🎉",
  "🎁",
  "🎈",
  "🎂",
  "🧹",
  "🪴",
  "🛏",
  "🚗",
  "🚲",
  "🌋",
  "📀",
  "💡",
  "🔒",
  "🔑",
  "📌",
  "📐",
  "📏",
  "🧷",
  "🧵",
  "🧶",
  "🎨",
  "🎤",
  "🎧",
  "🎹",
  "🥁",
  "🎷",
  "🎺",
  "🎻",
  "🪕",
  "📯",
];

const EmojiArea: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [emojiRows, setEmojiRows] = useState<string[][]>([]);
  const [rowCount, setRowCount] = useState(6);

  useEffect(() => {
    const calculateRows = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight || 400; // 默认高度
        const rowHeight = 55; // 行高度 + margin
        const padding = 40; // 上下padding
        const availableHeight = containerHeight - padding;
        const calculatedRows = Math.max(
          1,
          Math.floor(availableHeight / rowHeight)
        );
        setRowCount(calculatedRows);
      }
    };

    // 初始计算
    calculateRows();

    // 监听窗口大小变化
    const handleResize = () => {
      setTimeout(calculateRows, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // 随机重新排列表情符号
    const shuffledEmojis = [...emojis].sort(() => Math.random() - 0.5);
    
    // 根据行数动态分配表情符号，确保每行都有足够的图标
    const minEmojisPerRow = 15; // 增加每行最少表情符号数量
    const emojisPerRow = Math.max(minEmojisPerRow, Math.ceil(shuffledEmojis.length * 1.5 / rowCount));
    const newRows: string[][] = [];

    for (let i = 0; i < rowCount; i++) {
      const rowEmojis: string[] = [];
      
      // 为每行生成足够的表情符号，使用随机排列的数组
      for (let j = 0; j < emojisPerRow; j++) {
        const emojiIndex = (i * emojisPerRow + j) % shuffledEmojis.length;
        rowEmojis.push(shuffledEmojis[emojiIndex]);
      }
      newRows.push(rowEmojis);
    }
    
    setEmojiRows(newRows);
  }, [rowCount]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" ,delay: 0.25}}
    >
      <div ref={containerRef} className="emoji-marquee-container">
        {emojiRows.map((row, index) => (
          <div key={index} className={`emoji-row emoji-row-${(index % 6) + 1}`}>
            <div className="emoji-content">
              {/* 重复两次内容以实现无缝循环 */}
              {row.map((emoji, emojiIndex) => (
                <span key={`first-${emojiIndex}`} className="emoji-item">
                  {emoji}
                </span>
              ))}
              {row.map((emoji, emojiIndex) => (
                <span key={`second-${emojiIndex}`} className="emoji-item">
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        ))}

        <style jsx>{`
          .emoji-marquee-container {
            width: 100%;
            height: 100%;
            min-height: 300px;
            overflow: hidden;
            background: rgb(240, 177, 0);
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
          }

          .emoji-row {
            height: 50px;
            display: flex;
            align-items: center;
            margin: 2.5px 0;
            overflow: hidden;
            flex-shrink: 0;
          }

          .emoji-content {
            display: flex;
            animation: marquee 80s linear infinite;
            white-space: nowrap;
          }

          .emoji-row-1 .emoji-content {
            animation-duration: 90s;
          }

          .emoji-row-2 .emoji-content {
            animation-duration: 100s;
            animation-direction: reverse;
          }

          .emoji-row-3 .emoji-content {
            animation-duration: 84s;
          }

          .emoji-row-4 .emoji-content {
            animation-duration: 96s;
            animation-direction: reverse;
          }

          .emoji-row-5 .emoji-content {
            animation-duration: 88s;
          }

          .emoji-row-6 .emoji-content {
            animation-duration: 92s;
            animation-direction: reverse;
          }

          .emoji-item {
            font-size: 2rem;
            margin: 0 12px;
            display: inline-block;
            transition: transform 0.3s ease;
          }

          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          /* 响应式设计 */
          @media (max-width: 768px) {
            .emoji-item {
              font-size: 1.5rem;
              margin: 0 8px;
            }

            .emoji-row {
              height: 40px;
              margin: 3px 0;
            }
          }
        `}</style>
      </div>
    </motion.div>
  );
};

export { EmojiArea };
