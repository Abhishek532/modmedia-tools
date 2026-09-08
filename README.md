# SoundSlice

SoundSlice is a growing collection of Discord-oriented media tools for server moderators. The current product includes a client-side Soundboard Editor for trimming MP4 or MP3 files, adjusting volume, and exporting Discord-ready MP3 clips.

## Project references

- [Product context and decisions](docs/soundslice.md)
- [UI/UX design system](docs/soundslice-design-system.md)

## Application

- Homepage: `app/page.tsx`
- Soundboard Editor implementation: `app/soundboard-maker/page.tsx`
- Primary route entry: `app/soundboard-editor/page.tsx`
- Shared styling: `app/globals.css`
- Site metadata: `app/layout.tsx`
- Hosting configuration: `.openai/hosting.json`

## Local development

```sh
pnpm dev
```

Validate changes with:

```sh
pnpm lint
pnpm build
```

Live site: https://soundslice-discord.abhisheksharma532.chatgpt.site

