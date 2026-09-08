# SoundSlice — Discord media tools

Last updated: 2026-09-08.
Source: Abhishek's explicit decisions and feedback during the SoundSlice design and implementation conversation, 2026-09-05 through 2026-09-08. Implementation details were verified in the local project during that work.

Detailed UI specifications: [SoundSlice UI/UX design system](soundslice-design-system.md).

## Product direction

- SoundSlice is intended to grow into an all-in-one destination for Discord-oriented media tools used by server moderators.
- Planned categories include soundboards, stickers, emojis, icons, GIFs, video, and other media workflows. Do not treat the current soundboard tool as the site's final scope.
- The current product name, `SoundSlice`, and `SS` monogram are temporary enough that naming and logo work remains open. Do not rename or redesign the brand without Abhishek's approval.
- Avoid implying official Discord ownership or affiliation. `Discord-ready` is approved descriptive wording.
- Homepage information architecture takes inspiration from iLovePDF: one clear, broad hero followed by clickable tool tiles that open focused workflows.

## Current locations and state

- Live site: https://soundslice-discord.abhisheksharma532.chatgpt.site
- Primary editor route: `/soundboard-editor`.
- Legacy `/soundboard-maker` route remains available for old bookmarks, but new links should use `/soundboard-editor`.
- Sticker Formatter route: `/sticker-formatter`.
- Canonical project folder: `/Users/abhishek.sharma1/Documents/SoundSlice`.
- Product and design documentation lives in `/Users/abhishek.sharma1/Documents/SoundSlice/docs`.
- All future SoundSlice code, documentation, design assets, test fixtures, and durable project-specific outputs must be created or updated within this canonical folder.
- Do not create another working copy under a dated Codex folder. Temporary build or deployment archives may use system temporary storage, but the canonical source and durable project artifacts remain here.
- Local Git repository uses branch `main`. No permanent GitHub/GitLab remote is configured; Sites uses a private internal source repository during publishing.
- The site was owner-private at the last verified deployment. Abhishek intends to share it publicly/with friends later, but that intent is not authorization to change access.

## Audience and design thesis

- Primary audience: Discord server moderators and people preparing media for Discord servers.
- Visual direction: modern and minimalist, but not so sparse that the workflow becomes ambiguous. Descriptive labels and short guidance should remain where they prevent confusion.
- The product should feel appropriate for gamers without becoming noisy, gimmicky, or arcade-heavy.
- Use a consistent dark gray/black base with the established coral red-pink accent. Avoid yellow and unrelated accent colors. Avoid neon-hue background effects and decorative color clutter.
- Prefer calm, compact surfaces, restrained shadows, consistent rounded corners, and clear hierarchy.
- Use the coral accent for important actions and selected/current values. Supporting copy and limits should remain muted gray.
- Avoid jumping/translation hover animations. Use pointer cursors and restrained color, border, or shadow hover feedback on interactive elements.

## Shared header and navigation

- Header brand contains the `SS` monogram and `SoundSlice` name.
- The brand is clickable and returns to the homepage.
- Do not show a changing tool/category subtitle beneath `SoundSlice`; this was intentionally removed.
- Focused tool pages retain a subtle `All tools` back link. It is useful even though the logo also returns home because its destination is explicit.
- If navigation grows, the back link may evolve into a compact breadcrumb such as `All tools / Soundboard Editor`.

## Homepage

- Approved hero heading: `Every tool you need for Discord-ready media, in one place.`
- Approved supporting copy: `Fast, free tools for soundboards, stickers, emojis, icons, GIFs, and video. Trim, resize, compress, convert, and export in just a few clicks.`
- Do not add the removed eyebrow `MEDIA TOOLS FOR DISCORD SERVERS`.
- Keep hero typography compact with limited top margin; it should not dominate the working surface.
- Tool tiles must be fully clickable, have clear hover/focus behavior, and navigate directly to the tool.
- Current tile name: `Soundboard Editor`.
- Current tile description: `Drop an MP4 or MP3, trim it, and make it ready for your soundboard.` Do not reintroduce `to five seconds` in this tile description.
- Current tile name: `Sticker Formatter`.
- Current tile description: `Crop, resize, and compress a sticker for Discord in a few clicks.`

## Sticker Formatter

- The Sticker Formatter uses the shared SoundSlice header, `All tools` link, centered hero, upload card, editor shell, and compact export footer.
- Accepted source files: JPG, PNG, GIF, and APNG. Its upload copy reflects Discord’s sticker requirements: exactly 320 × 320 pixels and no larger than 512 KB.
- Users can choose `Fill` to crop edges and fill the square, or `Fit` to keep the full image in frame; they can also zoom, drag to reposition, and reset the crop.
- Static sources export as PNG where possible, falling back to JPG if needed to meet the 512 KB limit. Animated GIF/APNG sources export as optimized animated GIFs, preserving animation when they can fit the same limit.
- The editor shows live 320 × 320 crop preview, source dimensions/type, concise processing state, recovery-oriented file-size errors, and a clearly labeled download control after completion.
- Keep the editable filename field in the Sticker Formatter export footer, matching the Soundboard Editor pattern. Its extension reflects the planned or completed output format.

## Soundboard Editor hero

- Use `Soundboard Editor` everywhere user-facing and in page/social metadata. Do not call it `Soundboard Maker`.
- Approved hero copy: `Trim an MP4 or MP3, adjust its volume, and download a Discord-ready soundboard clip.`
- On wide screens the intended manual break is after `download a`, producing:
  - `Trim an MP4 or MP3, adjust its volume, and download a`
  - `Discord-ready soundboard clip.`
- Hero heading and description are center-aligned.
- Upload and editor states must use identical hero position and spacing; uploading a file must not move the hero vertically.

## Upload and media states

- Accept MP4 video and MP3 audio, up to 250 MB.
- Upload prompt remains simple and supports click-to-choose and drag-and-drop.
- `Replace file` belongs inside the editor/file section, not in the hero.
- Do not show `Start Over` separately; it duplicated `Replace file`.
- Do not show the removed header/footer claims such as `Local processing`, `Your files stay on this device`, `Up to 250 MB`, `5 sec output`, or `MP3 too` unless Abhishek explicitly asks to restore them.
- MP4 and MP3 uploads use the same two-column editor layout for visual consistency.
- For MP3 files, preserve the video panel's dimensions and show the quiet empty state `Audio-only file` / `No video preview available`; do not collapse or remove that column.

## Trim and waveform interaction

- The waveform has exactly two user-draggable trim handles: start and end.
- The red selected region between them is draggable as a whole and must preserve its duration when moved against either boundary.
- A white playback handle appears when preview starts. It is display-only and must never be draggable.
- Preview begins at the trim start. Pausing leaves playback at its current point; resuming continues from that point.
- Moving either trim handle or dragging the selected range must pause playback and reset the white playback handle to the new trim start.
- Keep the two trim handles visually distinct from the waveform and easy to grab.
- Use the waveform area's full height; avoid unexplained blank space below it.
- Approved help text: `Drag the selection to move your clip. Use the two handles to trim.`
- The red selection range remains pointer-draggable only. A keyboard equivalent for moving the whole range was discussed and Abhishek explicitly chose to ignore it; do not add it unless requested later. The individual trim handles do support keyboard arrow movement.

## Timing controls

- The maximum exported clip length is five seconds.
- Time inputs are labeled simply `Start` and `End`; do not append `· sec`.
- Time input spinner increments are 0.10 seconds. Keyboard trim-handle increments are also 0.10 seconds.
- Compact duration status format: `2.69s / 5s max` (values are dynamic).
- Current duration is the primary value: about 16px, bold, coral red-pink.
- `/ 5s max` is supporting metadata: about 14px, medium/regular weight, muted gray.

## Preview controls

- Use a simple play/pause icon rather than a button labeled `Preview`.
- Preview controls should not visually compete with the primary export action.
- Approved play/pause styling uses the same muted `#352731` family as the secondary `Replace file` control, with a bright coral red-pink icon.
- Include pointer cursor, focus treatment, and restrained hover feedback. Do not use a jumping hover animation.
- Volume changes must be audible in preview, not only applied during export.

## Volume control

- Keep a single horizontal volume bar supporting both reduction and boost.
- Range: -12 dB to +12 dB, with 1 dB increments.
- Visible labels/markers occur every 4 dB: -12, -8, -4, 0, +4, +8, +12; include `dB` on the labels and identify the center as the default.
- `Quieter`, the bar, and `Louder` stay on the same row and are vertically centered.
- The bar must respond both to dragging and clicking a position.
- Do not show changing explanatory text below `Volume`.
- Do not show the removed sentence `Preview and exported MP3 use this setting.`
- Do not add separate `Normalize volume` or `Fade edges` controls; Abhishek considered them unnecessary and unclear for this workflow.

## Export UI and processing

- Processing is client-side using FFmpeg WebAssembly. Uploaded media does not need to be sent to an application server for trimming, gain adjustment, or MP3 conversion.
- Export format is mono MP3 at 48 kHz and 128 kbps, with a 512 KB maximum enforced for Discord compatibility.
- Keep the processing/loading UI compact and adjacent to the export action.
- The primary button reads `Create MP3`; it needs pointer cursor and restrained hover feedback.
- After processing, show a concise success state such as `MP3 ready` and a clearly labeled `Download MP3` button.
- Do not show a separate exported-audio preview player in the success box.
- Keep only final duration and final file size near the export/download action. Do not repeat format metadata or `Discord-ready` status text there.
- The output filename field remains available before export.

## Copy intentionally removed

Do not restore these without a new request:

- `Start with`
- `Soundboard clip maker.`
- `Your next soundboard hit.`
- `Find the moment. Keep the reaction.`
- `Edit the times for a precise trim.`
- `Preview and exported MP3 use this setting.`
- `Your file never leaves this browser`
- Header `Local processing`
- Export `Discord-ready`

## Implementation and quality notes

- Main implementation currently lives in `app/soundboard-maker/page.tsx`; `app/soundboard-editor/page.tsx` re-exports it so new links use the renamed route without breaking the legacy route.
- Shared visual styling is in `app/globals.css`; homepage and metadata are in `app/page.tsx` and `app/layout.tsx`.
- Preserve direct browser anchors for the brand, back link, and homepage tile; this fixed navigation failures observed with the previous routing approach in the hosted build.
- Generated Shadcn component sources and the vendored FFmpeg core are excluded from app lint scope. Application lint and the production build passed after this cleanup.
- A placeholder captions `<track>` exists on the media element but has no real user-provided caption source. It does not affect trimming, playback, or export. This was explained to Abhishek and not changed.
- Preserve existing functionality while making future tools visually consistent. Do not generalize Soundboard Editor-only workflow details to unrelated tools when they do not fit.

## Deferred decisions

- Final site name and logo remain undecided.
- Public/shared hosting access has not been authorized yet.
- Future tools and their exact priority remain unspecified.
- The dedicated `All tools` back link is currently preferred; revisit only when navigation grows enough to justify breadcrumbs or a fuller header.
