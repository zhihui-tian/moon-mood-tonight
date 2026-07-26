import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://moon-mood-tonight.zhihui2031.chatgpt.site",
  ),
  title: {
    default: "Moon Mood Tonight",
    template: "%s · Moon Mood Tonight",
  },
  description:
    "Classical Chinese poetry for the way you feel tonight. Choose a mood and receive a poem.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Moon Mood Tonight",
    description:
      "Choose a state of mind, and receive a classical Chinese poem.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1733,
        height: 907,
        alt: "Moon Mood Tonight over a moonlit ink-wash river landscape",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moon Mood Tonight",
    description:
      "Classical Chinese poetry for the way you feel tonight.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
