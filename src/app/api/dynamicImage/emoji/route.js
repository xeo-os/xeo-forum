import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const emojis = [
      "😀", "😎", "🤖", "👻", "🐱", "🐶", "🦄", "🐼", "🐸", "🐵",
      "🦊", "🦁", "🐯", "🐨", "🐮", "🐷", "🐻", "🐰", "🦉", "🦝",
      "🐙", "🐢", "🐬", "🦈", "🐳", "🐊", "🦋", "🦔", "🦒", "🐘",
      "👽", "🤡", "👾", "🎃", "💀", "👑", "🌟", "⭐", "🔥", "💫"
    ];
    const backgrounds = [
      "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
      "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
      "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
      "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
      "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
      "linear-gradient(135deg, #1d976c 0%, #93f9b9 100%)",
      "linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f83600 0%, #f9d423 100%)",
      "linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)",
      "linear-gradient(135deg, #ba5370 0%, #f4e2d8 100%)",
      "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)"
    ];
    const emoji = searchParams.get("emoji")
      ? decodeURIComponent(searchParams.get("emoji"))
      : emojis[Math.floor(Math.random() * emojis.length)];
    const background = searchParams.get("background")
      ? decodeURIComponent(searchParams.get("background"))
      : backgrounds[Math.floor(Math.random() * backgrounds.length)];

    console.log(
      `Generating image with emoji: ${emoji} and background: ${background}`
    );

    const headers = searchParams.get("emoji") || searchParams.get("background")
      ? {
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: `"${Buffer.from(emoji + background).toString("base64")}"`,
        }
      : {};

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: background,
            fontSize: 128,
          }}
        >
          <div>{emoji}</div>
        </div>
      ),
      {
        width: 256,
        height: 256,
        headers,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
