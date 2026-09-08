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
  title: 'SoundSlice — Discord Soundboard Editor',
  description: 'Trim MP4 videos or MP3 audio into Discord-ready soundboard clips without uploading your files.',
  openGraph: {
    title: 'SoundSlice — Discord Soundboard Editor',
    description: 'Cut the moment. Keep the chaos. Create Discord-ready MP3 clips locally in your browser.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'SoundSlice audio waveform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoundSlice — Discord Soundboard Editor',
    description: 'Cut the moment. Keep the chaos. Create Discord-ready MP3 clips locally in your browser.',
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
