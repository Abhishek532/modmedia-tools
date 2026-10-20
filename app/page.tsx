/* oxlint-disable next/no-html-link-for-pages */
import { ArrowRight, Music2, Sticker } from 'lucide-react';

export default function Home() {
  return (
    <main className="arcade-app">
      <header className="arcade-header">
        <a className="arcade-brand" href="/" aria-label="ModMedia Tools home"><span className="arcade-monogram">MM</span><span className="arcade-brand-copy"><span>ModMedia</span><span className="arcade-brand-suffix">Tools</span></span></a>
      </header>
      <section className="arcade-tools-page">
        <div className="arcade-upload-intro"><h1>Every tool you need for Discord-ready media, in one place.</h1><p>Fast, free tools for soundboards, stickers, emojis, icons, GIFs, and video. Trim, resize, compress, convert, and export in just a few clicks.</p></div>
        <div className="arcade-tool-grid" aria-label="Media tools">
          <a className="arcade-tool-tile" href="/soundboard-editor">
            <span className="arcade-tool-icon"><Music2 /></span>
            <span className="arcade-tool-copy"><strong>Soundboard Editor</strong><span>Drop an MP4 or MP3, trim it, and make it ready for your soundboard.</span></span>
            <ArrowRight className="arcade-tool-arrow" />
          </a>
          <a className="arcade-tool-tile" href="/sticker-formatter">
            <span className="arcade-tool-icon"><Sticker /></span>
            <span className="arcade-tool-copy"><strong>Sticker Formatter</strong><span>Crop, resize, and compress a sticker for Discord in a few clicks.</span></span>
            <ArrowRight className="arcade-tool-arrow" />
          </a>
        </div>
      </section>
    </main>
  );
}
