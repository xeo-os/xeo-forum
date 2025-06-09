import { ImageResponse } from "next/og";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const emojis = ["😀", "😎", "🤖", "👻", "🐱", "🐶", "🦄", "🐼", "🐸", "🐵"];
    const backgrounds = [
      "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
      "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
      "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
      "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
      "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    ];
    const emoji = searchParams.get("emoji")
      ? decodeURIComponent(searchParams.get("emoji"))
      : emojis[Math.floor(Math.random() * emojis.length)];
    const background = searchParams.get("background")
      ? decodeURIComponent(searchParams.get("background"))
      : backgrounds[Math.floor(Math.random() * backgrounds.length)];

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
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
