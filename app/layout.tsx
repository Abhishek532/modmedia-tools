import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://soundslice-discord.warm-okapi-4710.chatgpt.site'),
  title: 'ModMedia Tools — Discord Media Tools',
  description: 'Format soundboard clips, stickers, and other Discord-ready media directly in your browser.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'ModMedia Tools — Discord Media Tools',
    description: 'Create Discord-ready soundboard clips, stickers, and more directly in your browser.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'ModMedia Tools media editing preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModMedia Tools — Discord Media Tools',
    description: 'Create Discord-ready soundboard clips, stickers, and more directly in your browser.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
