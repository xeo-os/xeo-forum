import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xeo Forum",
  description: "International forum platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
