# SoundSlice UI/UX design system

Last updated: 2026-09-08.
Status: canonical guidance for the current SoundSlice site and future media tools. Exact implemented values were verified against `app/globals.css`; product and UX intent comes from Abhishek's explicit feedback from 2026-09-05 through 2026-09-08.

Related product decisions: [SoundSlice — Discord media tools](soundslice.md).

## 1. Experience principles

1. **Focused, not sparse.** Keep screens visually calm while retaining the labels and short guidance needed to understand unfamiliar media operations.
2. **Discord-oriented, not Discord-branded.** Use language and workflows familiar to server moderators without implying that SoundSlice is an official Discord product.
3. **One obvious primary task.** Each tool page should emphasize its working surface and primary export action rather than behave like a marketing page.
4. **Consistent state geometry.** Uploading, loading, editing, and success states must not unexpectedly move shared page elements or change the overall layout without a functional reason.
5. **Progressive disclosure.** Show essential controls by default. Avoid expert audio/media options unless users clearly need them.
6. **Direct manipulation.** Prefer draggable ranges, handles, sliders, previews, and immediate feedback for media editing.
7. **Restrained motion.** Interaction feedback should clarify state without bouncing, jumping, or adding ornamental animation.

## 2. Visual character

- Modern dark interface with a compact, tool-like silhouette.
- Gamer-friendly through strong contrast, waveform/media surfaces, and coral accents—not through neon backgrounds, cyberpunk effects, or arcade clutter.
- Mostly flat dark surfaces with thin borders and one restrained offset shadow on major cards.
- Rounded corners are compact rather than pill-heavy.
- Use icons to improve scanning, not as decoration or substitutes for unclear labels.

## 3. Color system

The current code uses direct values rather than named CSS variables. Future work should map these values to semantic tokens before introducing additional colors.

| Semantic role | Current value | Usage |
| --- | --- | --- |
| Page background | `#16151b` | Global app background |
| Deep inset background | `#17151b` | Video/media preview |
| Waveform background | `#19171f` | Waveform and timeline |
| Export background | `#1d1a23` | Export/action footer |
| Primary card | `#24212b` | Upload, tool tile, editor shell |
| Secondary control background | `#352731` | Play/pause, Replace file, tool icon surface |
| Secondary control hover | `#47313e` | Hovered muted controls |
| Drag-active surface | `#30232d` | Active upload drop state |
| Primary accent | `#fa6377` | Primary actions, handles, current values, key icons |
| Accent hover | `#ff7c8e` | Primary action hover |
| Accent-soft text | `#ffb3be` | Success or gentle emphasized text |
| Accent-light | `#ffe4e9` | Handle/thumb border and highlight |
| Primary text | `#f7f2e8` | Headings and high-priority content |
| Secondary bright text | `#eee8f2` | Control headings and strong secondary labels |
| Secondary text | `#b7aebf` | Descriptions, limits, metadata, guidance |
| Tertiary text | `#83798b` / `#8f8698` | Separators and low-priority scale labels |
| Main border | `#453e4e` | Card divisions and main surfaces |
| Control border | `#554c61` | Secondary controls and icon tiles |
| Media border | `#413a49` | Video/audio preview |
| Input underline | `#706477` | Minimal time and filename inputs |
| Dark shadow | `#0f0e13` | Major-card offset shadow |
| Error background | `#3a2028` | Inline error alert |
| Error border | `#884251` | Inline error alert |
| Error text | `#ffd7dd` | Inline error alert |
| Playback marker | `#f2f3f5` | Non-interactive current-time handle |

### Color rules

- Coral is the only primary accent. Do not introduce yellow, blue, green, or unrelated accent families without an explicit product reason and approval.
- Use coral for primary actions, selected/current values, trim handles, active slider segments, and small identifying icons.
- Do not color large background areas coral; preserve the dark working surface.
- Muted text should remain visibly readable against dark surfaces. Avoid using tertiary colors for essential instructions or labels.
- Errors use the same red family but need a darker background and clear text, not merely a red outline.
- Success currently uses coral-soft text to remain on-brand. If future flows require stronger success differentiation, choose an accessible semantic treatment deliberately rather than introducing green ad hoc.

## 4. Typography

### Families

- Primary UI: Geist Sans via `--font-geist-sans`.
- Numeric/media metadata: Geist Mono via `--font-geist-mono`.
- Fallbacks: `Arial, Helvetica, sans-serif` for UI and `monospace` for numeric data.

### Hierarchy

| Role | Recommended specification | Notes |
| --- | --- | --- |
| Homepage hero | `clamp(1.75rem, 4vw, 3rem)`, 800 | Compact marketing headline; centered |
| Tool hero | `clamp(2rem, 4vw, 3.2rem)`, 800 | Centered; stable between states |
| Section heading | About `1.25rem`, 700 | Example: Choose your moment |
| Card/tool title | `1.05–1.2rem`, 700 | Use for upload and tool tiles |
| Main body | `1rem`, 400–500, line-height `1.6–1.65` | Explanations and hero supporting copy |
| Control text | `0.875rem`, 600–800 as needed | Buttons, fields, and active labels |
| Supporting metadata | `0.75–0.875rem`, 400–600 | File details, limits, scales |
| Current numeric value | `1rem`, 700, Geist Mono | Coral; example `2.69s` |
| Numeric limit | `0.875rem`, 500, Geist Mono | Muted; example `5s max` |

### Typography rules

- Prefer sentence case for buttons, labels, headings, and status text.
- Use monospace only where aligned numeric scanning helps: timestamps, durations, dB scales, progress, and sizes.
- Avoid all-caps eyebrow labels; the removed homepage eyebrow must not return.
- Keep headings short. Supporting text should usually be one sentence and no more than two visual lines on wide screens.
- Primary body copy should remain 16px or larger. Text below 14px is secondary metadata only, never the sole explanation of an action.
- Use strong negative letter spacing only on large headings; keep labels and body copy neutral.

## 5. Layout and spacing

### Page frame

- Main content width: `min(100% - 2rem, 72rem)`.
- Mobile page width below 700px: `min(100% - 1.25rem, 72rem)`.
- Shared upload/editor vertical padding: `clamp(1.75rem, 4vw, 3rem) 0 3rem`.
- Header uses the same maximum width as the page and `1.15rem` vertical padding.
- Homepage/tool hero, upload state, and editor state should align to the same page grid.

### Spacing rhythm

Use a compact 4px-based rhythm:

- `0.25rem` (4px): icon/text micro-gap or tightly related metadata.
- `0.5rem` (8px): label-to-control and compact inline gaps.
- `0.75rem` (12px): brand/control group gaps.
- `1rem` (16px): standard internal spacing.
- `1.25rem` (20px): card padding and workspace gaps.
- `1.5rem` (24px): major control-group separation.
- `2–3rem` (32–48px): section/hero separation only.

Avoid adding margins to compensate for state-dependent layout. Shared elements should use shared containers and spacing rules.

### Working surface

- Desktop editor grid: video/audio preview at roughly one-third width, editing controls at roughly two-thirds.
- Current grid: `minmax(12rem, .65fr) minmax(0, 1.35fr)` with `1.25rem` gap and padding.
- At 700px and below, stack the editor into one column.
- MP4 and MP3 states retain the same grid and preview-panel dimensions.

## 6. Borders, radii, and elevation

| Element | Radius | Border/elevation |
| --- | --- | --- |
| Major cards/shells | `0.8rem` | `1px #453e4e`; `5px 5px 0 #0f0e13` |
| Media panel | `0.55rem` | `1px #413a49` |
| Tool/icon surface | `0.55rem` | `1px #554c61` |
| Secondary button | `0.35–0.4rem` | `1px #554c61` |
| Waveform | `0.45rem` | No extra shadow |
| Circular icon control | `50%` | Thin control border |
| Minimal inputs | `0` | Bottom border only |

### Border and elevation rules

- Major cards may use the offset shadow; nested controls should not.
- Do not combine heavy blur shadows, strong glows, and offset shadows on one component.
- Hover may slightly strengthen border/accent shadow without moving the element.
- Use borders to separate file header, working area, and export footer inside the editor shell.

## 7. Component specifications

### Header brand

- `SS` monogram: `2.1rem` square, coral background, compact radius, dark text, Geist Mono.
- Brand name: 16px, 700 weight.
- Entire brand is one link to the homepage with a pointer cursor and visible focus state.
- No per-tool subtitle beneath the brand name.

### Back navigation

- Small inline link with left arrow and label `All tools`.
- Muted by default; coral on hover/focus.
- Place above the tool hero without shifting between upload/editor states.

### Tool tile

- Entire card is clickable, keyboard focusable, and has one destination.
- Layout: identifying icon, title/description group, directional arrow.
- Use the primary card surface, main border, compact radius, and offset shadow.
- Hover uses a slightly lighter dark background and stronger border; no vertical translation.

### Upload drop zone

- Entire area opens the file chooser and supports drag/drop.
- Use a dashed internal border within the major card.
- Primary upload button is coral and visually dominant.
- Drag-active state changes border/background, and copy may change to `Drop it here`.
- Keep supported-file guidance short; do not add multiple badges or redundant file-limit claims.

### File row

- Show file-type icon, truncated filename, concise size/duration/type metadata, and `Replace file`.
- `Replace file` is secondary: dark plum background, coral text, thin border.
- Keep this row inside the editor shell.

### Media preview

- Dark inset surface with `15rem` minimum height on desktop and `13rem` on small screens.
- MP4 uses `object-fit: contain`.
- MP3 retains the same panel and shows centered `Audio-only file` / `No video preview available` copy.
- If a play button is shown over video, use a centered circular control with an accessible play/pause label.

### Waveform and trim range

- Waveform height: 108px; fill the complete timeline height.
- Base waveform: muted purple-gray bars on `#19171f`.
- Selected range: translucent coral overlay with coral boundary edges.
- Two user-draggable coral trim handles are visually above the selected range.
- Playback handle: white, about 3px wide with a small top marker; display-only.
- Use `grab`/`grabbing` for the selected region and `ew-resize` for handles.
- Start/end handles support arrow-key adjustments of 0.10 seconds.

### Play/pause control

- Icon-only circular control, `2.75rem` square.
- Background `#352731`, coral icon, thin plum-gray border.
- Hover changes color/background/border only; no movement.
- Provide an accessible label that changes between play and pause.
- Disabled state must be visibly and programmatically disabled before media is ready.

### Time fields and duration status

- Labels: `Start`, `End`.
- Inputs: transparent background, bottom border, Geist Mono, 16px value.
- Numeric step: 0.10 seconds; enforce valid ordering and five-second maximum.
- Duration status: dynamic `2.69s / 5s max` format.
- Current value: coral, 16px, 700. Separator: tertiary gray. Limit: muted, 14px, 500.

### Volume slider

- One horizontal range from -12 dB to +12 dB with 1 dB increments.
- Labels at -12, -8, -4, 0, +4, +8, +12 dB; center marked `Default`.
- `Quieter`, slider, and `Louder` share one vertically centered row.
- Track is muted outside the active gain/reduction span and coral between the thumb and center.
- Thumb is coral with a light border and restrained focus/hover ring.
- Entire track is clickable; thumb remains draggable.

### Export footer

- Lives inside the editor shell and uses the darker export surface.
- Left/leading area: output filename field.
- Right/trailing area: final duration/size, compact progress or success, and one primary action.
- Primary action: coral `Create MP3`; after success, clearly labeled `Download MP3`.
- Progress is compact and placed beside the action, not in a large standalone panel.
- Success copy: `MP3 ready` or equivalent concise confirmation.
- Do not add a separate exported-audio preview.

### Alerts

- Inline near the affected workflow, with `role="alert"` for errors.
- Use icon + concise recovery-oriented sentence.
- Do not expose raw FFmpeg/browser errors when a plain explanation is available.

## 8. Interaction states

Every interactive element needs:

- Default state with sufficient contrast.
- Pointer cursor for mouse users.
- Hover state that changes color, border, or restrained shadow.
- Visible keyboard focus state.
- Active/pressed feedback where meaningful.
- Disabled state that prevents interaction and communicates unavailability.
- Loading state that prevents duplicate work.

Do not animate layout position on hover. Transition colors, borders, opacity, and shadow in roughly 160ms.

## 9. Workflow-state behavior

### Upload → edit

- Header, back link, and hero remain geometrically stable.
- Replace only the upload card with the editor shell.
- Metadata loading may show a waveform skeleton without moving the page frame.

### Editing

- Any trim change invalidates an existing output and resets preview to the trim start.
- Dragging the selected range preserves its duration, including against source boundaries.
- Volume changes affect both live preview and the exported MP3.

### Processing

- Disable repeat export while working.
- Show short status text, progress percentage, and compact progress bar.
- Keep the editor visible so users retain context.

### Success

- Replace the create action with an obvious download action.
- Show only useful final metadata: duration and file size.
- Changing trim, volume, file, or other output-affecting state invalidates the previous result.

### Error

- Preserve the user's file and settings whenever recovery is possible.
- Explain unsupported formats, missing audio tracks, invalid duration, browser decoding problems, conversion failure, and Discord file-size overflow in plain language.

## 10. Responsive behavior

- Main breakpoint: 700px for stacked editor/export/volume layouts.
- Compact breakpoint: 460px for smaller headings, full-width time fields, and tighter scale labels.
- Desktop two-column editor becomes one column; media preview remains visible for both MP4 and MP3.
- Export controls become full width and stack in logical reading order.
- Upload text and button stack; the choose-file action becomes full width.
- Time inputs share available width rather than overflow.
- The volume slider must remain usable without horizontal scrolling. Reduce decorative label density before reducing the control's touch target.
- Do not rely on a hard desktop line break if it causes three or more awkward mobile lines; responsive CSS may hide or override manual breaks when needed.

## 11. Accessibility and usability

- Use semantic buttons, links, labels, and headings.
- Icon-only controls require changing accessible labels, such as `Play selected clip` and `Pause selected clip`.
- Do not rely on color alone for errors, selection boundaries, or control state.
- Keep primary controls at least about 44px in one dimension when practical; current play/pause and primary actions meet this intent.
- Trim handles require visible focus and keyboard arrows.
- Dynamic progress should use a polite live region; errors should use an alert region.
- Decorative icons and waveform graphics should be hidden from assistive technology when nearby text conveys the meaning.
- Preserve browser zoom and 200% text enlargement without clipping essential actions.
- The whole red selection range currently has no keyboard movement equivalent by explicit product decision; do not describe the overall editor as fully keyboard-operable unless this changes.

## 12. Content design

- Prefer direct verbs: `Choose`, `Trim`, `Replace`, `Create`, `Download`.
- Explain outcomes, not implementation details, unless the implementation affects trust or compatibility.
- Avoid repeated claims in the hero, file row, controls, and export footer.
- Use `Discord-ready` descriptively, but avoid `official`, Discord logos, or copy that implies endorsement.
- Keep advanced audio terminology out of the default UI. Controls such as normalization and edge fades remain intentionally omitted.
- Labels should stay stable while values/statuses update beside them.

## 13. Template for future tools

Future sticker, emoji, icon, GIF, or video tools should reuse this page structure where it fits:

1. Shared SoundSlice header with no changing subtitle.
2. Explicit `All tools` navigation.
3. Centered tool name and one-sentence outcome description.
4. Stable upload state using the primary card style.
5. Editor shell divided into file row, preview/workspace, tool-specific controls, and export footer.
6. One visually dominant export action.
7. Compact loading, success, and recovery-oriented error states.

Do not force waveform, time, volume, or five-second constraints onto tools that do not need them. Reuse the visual and behavioral language, not every Soundboard Editor control.

## 14. Design QA checklist

Before publishing a new or changed SoundSlice workflow, verify:

- Uses only approved palette roles; no accidental yellow/neon/unrelated accents.
- Shared header, page width, hero alignment, and spacing match existing tools.
- Tool name, route links, metadata, and tile copy agree.
- Upload and editor states do not shift shared elements.
- MP4/MP3 or equivalent supported-type states preserve layout consistency.
- Every interactive element has pointer, hover, focus, active, disabled, and loading behavior where applicable.
- Primary action is visually strongest; preview and secondary actions remain subordinate.
- Error, loading, empty, and success states are covered.
- Mobile layouts work at and below 700px and 460px without overflow.
- Text hierarchy follows 16px body/14px regular-label guidance; smaller text is secondary metadata only.
- No intentionally removed copy or controls have returned.
- Lint and production build pass for application-owned code.
- Browser workflow testing is performed when explicitly requested; do not claim untested workflows were exercised.

