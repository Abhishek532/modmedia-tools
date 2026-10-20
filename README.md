# ModMedia Tools

ModMedia Tools is a growing collection of Discord-oriented media tools for server moderators. The current product includes a client-side Soundboard Editor and Sticker Formatter for producing Discord-ready media files.

## Canonical workspace

All ModMedia Tools development must be performed and saved in the legacy project folder `/Users/abhishek.sharma1/Documents/SoundSlice`.

Keep source code, documentation, design assets, test fixtures, and durable project-specific outputs in this folder. Do not recreate or use the former dated Codex project folder as a working copy. Temporary build or deployment archives may use system temporary storage, but they are not the project source of truth.

## Project references

- [Product context and decisions](docs/modmedia-tools.md)
- [UI/UX design system](docs/modmedia-tools-design-system.md)

## Application

- Homepage: `app/page.tsx`
- Soundboard Editor implementation: `app/soundboard-maker/page.tsx`
- Primary route entry: `app/soundboard-editor/page.tsx`
- Sticker Formatter: `app/sticker-formatter/page.tsx`
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

Live site (legacy URL): https://soundslice-discord.abhisheksharma532.chatgpt.site
