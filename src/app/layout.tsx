import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xeo OS",
  description: "Exchange everyone's opinions, just by words.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
  