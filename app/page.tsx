/* oxlint-disable next/no-html-link-for-pages */
import { ArrowRight, Music2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="arcade-app">
      <header className="arcade-header">
        <a className="arcade-brand" href="/" aria-label="SoundSlice home"><span className="arcade-monogram">SS</span><span className="arcade-brand-copy">SoundSlice</span></a>
      </header>
      <section className="arcade-tools-page">
        <div className="arcade-upload-intro"><h1>Every tool you need for Discord-ready media, in one place.</h1><p>Fast, free tools for soundboards, stickers, emojis, icons, GIFs, and video. Trim, resize, compress, convert, and export in just a few clicks.</p></div>
        <div className="arcade-tool-grid" aria-label="Media tools">
          <a className="arcade-tool-tile" href="/soundboard-maker">
            <span className="arcade-tool-icon"><Music2 /></span>
            <span className="arcade-tool-copy"><strong>Soundboard Editor</strong><span>Drop an MP4 or MP3, trim it to five seconds, and make it ready for your soundboard.</span></span>
            <ArrowRight className="arcade-tool-arrow" />
          </a>
        </div>
      </section>
    </main>
  );
}
