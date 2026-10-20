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
pnpm test:analytics
pnpm build
```

## Analytics

Production analytics uses PostHog EU and is intentionally narrow: anonymous page views plus successful Soundboard Editor and Sticker Formatter exports. It uses memory-only persistence (no analytics cookies), creates no person profiles, disables autocapture, session replay, heatmaps, performance and exception capture, and opts every event out of GeoIP enrichment. Localhost, loopback, `.local`, development, unconfigured, and test builds do not send events.

Copy `.env.example` to `.env.local` for local configuration, and set the same public browser variables in the production environment:

```sh
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

The exact event contract is documented in [docs/modmedia-tools.md](docs/modmedia-tools.md#privacy-conscious-analytics).

Live site (legacy URL): https://soundslice-discord.abhisheksharma532.chatgpt.site
