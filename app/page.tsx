'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { type Region } from 'wavesurfer.js/dist/plugins/regions.esm.js';
import {
  Check,
  CircleAlert,
  Download,
  FileVideo,
  LockKeyhole,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Sparkles,
  UploadCloud,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

const MAX_FILE_BYTES = 250 * 1024 * 1024;
const MAX_CLIP_SECONDS = 5;
const MAX_OUTPUT_BYTES = 512 * 1024;

const DESIGNS = [
  { id: 'void', name: 'Neon Void', note: 'Clean neon', swatch: '#8b7cff' },
  { id: 'carbon', name: 'Carbon Ops', note: 'Tactical mono', swatch: '#ff9d4d' },
  { id: 'pulse', name: 'Pulse Grid', note: 'Cyber arcade', swatch: '#ff4fd8' },
  { id: 'cryo', name: 'Cryo Arena', note: 'Frosted competitive', swatch: '#38d9ff' },
] as const;

type DesignId = (typeof DESIGNS)[number]['id'];

type Stage = 'idle' | 'loading' | 'converting' | 'done' | 'error';

function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safe / 60);
  const remainder = (safe % 60).toFixed(2).padStart(5, '0');
  return `${minutes}:${remainder}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function safeName(name: string) {
  return (
    name
      .replace(/\.(mp4|mp3)$/i, '')
      .trim()
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 56) || 'soundboard-clip'
  );
}

export default function Home() {
  const [design, setDesign] = useState<DesignId>('void');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 5 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [normalize, setNormalize] = useState(true);
  const [fade, setFade] = useState(true);
  const [outputName, setOutputName] = useState('soundboard-clip');
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [outputSize, setOutputSize] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<Region | null>(null);
  const ffmpegRef = useRef<import('@ffmpeg/ffmpeg').FFmpeg | null>(null);
  const selectionRef = useRef(selection);
  const isAudioFile = file?.name.toLowerCase().endsWith('.mp3') || file?.type === 'audio/mpeg';

  const resetOutput = useCallback(() => {
    setStage('idle');
    setProgress(0);
    setError('');
    setOutputSize(0);
    setOutputUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return '';
    });
  }, []);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  useEffect(() => () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }, [outputUrl]);

  useEffect(() => {
    if (!fileUrl || !duration || !waveformRef.current || !videoRef.current) return;

    const regions = RegionsPlugin.create();
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      media: videoRef.current,
      url: fileUrl,
      height: 88,
      waveColor: '#4d5679',
      progressColor: '#9aa4ff',
      cursorColor: '#ffffff',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 3,
      barMinHeight: 2,
      normalize: true,
      dragToSeek: true,
      plugins: [regions],
    });

    wavesurferRef.current = wavesurfer;
    wavesurfer.on('ready', (readyDuration) => {
      const end = Math.min(MAX_CLIP_SECONDS, readyDuration);
      const region = regions.addRegion({
        start: 0,
        end,
        minLength: 0.1,
        maxLength: MAX_CLIP_SECONDS,
        color: 'rgba(88, 101, 242, .34)',
        drag: true,
        resize: true,
      });
      regionRef.current = region;
      setSelection({ start: 0, end });
    });
    regions.on('region-update', (region) => {
      setSelection({ start: region.start, end: region.end });
      resetOutput();
    });
    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));
    wavesurfer.on('timeupdate', (time) => {
      const current = selectionRef.current;
      if (time >= current.end && !videoRef.current?.paused) {
        wavesurfer.pause();
        wavesurfer.setTime(current.start);
      }
    });
    wavesurfer.on('error', () => {
      setError('This file could not be decoded in your browser. Try a standard MP3 or H.264 MP4.');
    });

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
      regionRef.current = null;
    };
  }, [duration, fileUrl, resetOutput]);

  const acceptFile = useCallback(
    (nextFile?: File) => {
      if (!nextFile) return;
      resetOutput();
      setError('');

      const lowerName = nextFile.name.toLowerCase();
      const isMp4 = lowerName.endsWith('.mp4') || nextFile.type === 'video/mp4';
      const isMp3 = lowerName.endsWith('.mp3') || nextFile.type === 'audio/mpeg';
      if (!isMp4 && !isMp3) {
        setError('Please choose an MP4 video or MP3 audio file.');
        return;
      }
      if (nextFile.size > MAX_FILE_BYTES) {
        setError('That file is larger than 250 MB. Choose a smaller MP4 or MP3.');
        return;
      }

      setFileUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(nextFile);
      });
      setFile(nextFile);
      setDuration(0);
      setSelection({ start: 0, end: 5 });
      setOutputName(safeName(nextFile.name));
    },
    [resetOutput],
  );

  const clearFile = () => {
    setFileUrl('');
    setFile(null);
    setDuration(0);
    setSelection({ start: 0, end: 5 });
    setIsPlaying(false);
    resetOutput();
  };

  const updateBoundary = (side: 'start' | 'end', raw: string) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;

    let start = selection.start;
    let end = selection.end;
    if (side === 'start') {
      start = Math.max(0, Math.min(value, end - 0.1));
      if (end - start > MAX_CLIP_SECONDS) end = start + MAX_CLIP_SECONDS;
    } else {
      end = Math.min(duration, Math.max(value, start + 0.1));
      if (end - start > MAX_CLIP_SECONDS) start = end - MAX_CLIP_SECONDS;
    }

    const next = { start, end };
    setSelection(next);
    regionRef.current?.setOptions(next);
    resetOutput();
  };

  const togglePreview = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;
    if (isPlaying) {
      wavesurfer.pause();
    } else {
      wavesurfer.setTime(selection.start);
      regionRef.current?.play(true);
    }
  };

  const convert = async () => {
    if (!file) return;
    resetOutput();
    setStage('loading');
    setProgress(5);

    let progressHandler: ((event: { progress: number }) => void) | null = null;
    let activeFfmpeg: import('@ffmpeg/ffmpeg').FFmpeg | null = null;

    try {
      const [{ FFmpeg }, { fetchFile }] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
      ]);

      let ffmpeg = ffmpegRef.current;
      if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
      }

      activeFfmpeg = ffmpeg;

      const onProgress = ({ progress: ratio }: { progress: number }) => {
        if (Number.isFinite(ratio)) setProgress(42 + Math.max(0, Math.min(1, ratio)) * 48);
      };
      progressHandler = onProgress;
      ffmpeg.on('progress', onProgress);

      if (!ffmpeg.loaded) {
        const chunkUrls = [
          '/ffmpeg/ffmpeg-core.wasm.partaa',
          '/ffmpeg/ffmpeg-core.wasm.partab',
        ];
        const chunkResponses = await Promise.all(chunkUrls.map((url) => fetch(url)));
        if (chunkResponses.some((response) => !response.ok)) {
          throw new Error('The audio engine could not be downloaded.');
        }
        const wasmParts = await Promise.all(chunkResponses.map((response) => response.arrayBuffer()));
        const wasmUrl = URL.createObjectURL(new Blob(wasmParts, { type: 'application/wasm' }));
        try {
          await ffmpeg.load({
            coreURL: '/ffmpeg/ffmpeg-core.js',
            wasmURL: wasmUrl,
          });
        } finally {
          URL.revokeObjectURL(wasmUrl);
        }
      }

      setProgress(28);
      setStage('converting');
      const inputName = isAudioFile ? 'input.mp3' : 'input.mp4';
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      setProgress(42);

      const clipDuration = Math.min(MAX_CLIP_SECONDS, selection.end - selection.start);
      const filters: string[] = [];
      if (normalize) filters.push('loudnorm=I=-16:TP=-1.5:LRA=11');
      if (fade) {
        const fadeLength = Math.min(0.08, clipDuration / 3);
        filters.push(
          `afade=t=in:st=0:d=${fadeLength.toFixed(3)}`,
          `afade=t=out:st=${Math.max(0, clipDuration - fadeLength).toFixed(3)}:d=${fadeLength.toFixed(3)}`,
        );
      }

      const args = [
        '-ss',
        selection.start.toFixed(3),
        '-t',
        clipDuration.toFixed(3),
        '-i',
        inputName,
        '-map',
        '0:a:0',
        '-vn',
        '-ac',
        '1',
        '-ar',
        '48000',
        '-codec:a',
        'libmp3lame',
        '-b:a',
        '128k',
      ];
      if (filters.length) args.push('-af', filters.join(','));
      args.push('-id3v2_version', '3', 'output.mp3');

      const exitCode = await ffmpeg.exec(args);
      if (exitCode !== 0) throw new Error('FFmpeg could not create the MP3.');

      const data = await ffmpeg.readFile('output.mp3');
      if (typeof data === 'string') throw new Error('Unexpected audio output.');
      const blob = new Blob([new Uint8Array(data)], { type: 'audio/mpeg' });
      if (blob.size > MAX_OUTPUT_BYTES) {
        throw new Error('The resulting MP3 is over Discord’s 512 KB limit.');
      }

      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      setProgress(100);
      setStage('done');

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile('output.mp3'),
      ]);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Conversion failed.';
      setError(
        message.includes('0:a:0')
          ? 'No audio track was found in this video.'
          : `${message} Try another MP4 or MP3, or choose a shorter source file.`,
      );
      setStage('error');
      setProgress(0);
    } finally {
      if (activeFfmpeg && progressHandler) activeFfmpeg.off('progress', progressHandler);
    }
  };

  const clipDuration = Math.max(0, selection.end - selection.start);
  const isBusy = stage === 'loading' || stage === 'converting';

  return (
    <main className="sound-design min-h-screen overflow-hidden bg-background text-foreground" data-design={design}>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button className="flex items-center gap-3 text-left" onClick={clearFile} type="button">
          <span className="brand-mark grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_32px_rgba(88,101,242,.35)]">
            <Music2 className="size-5" strokeWidth={2.4} />
          </span>
          <span>
            <span className="block text-[15px] font-bold tracking-[-0.02em]">SoundSlice</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">Discord clip maker</span>
          </span>
        </button>
        <span className="privacy-pill hidden items-center gap-2 rounded-full border border-white/8 bg-white/[.035] px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <LockKeyhole className="size-3.5 text-emerald-400" />
          Files stay on your device
        </span>
      </header>

      <nav className="design-switcher mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-5 pb-2 sm:px-8" aria-label="Choose a design direction">
        {DESIGNS.map((option, index) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={design === option.id}
            onClick={() => setDesign(option.id)}
            className="design-option flex min-w-fit items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition"
          >
            <span className="design-number text-[10px] font-bold tabular-nums">0{index + 1}</span>
            <span className="size-2 rounded-full" style={{ backgroundColor: option.swatch }} />
            <span>
              <span className="block text-xs font-bold">{option.name}</span>
              <span className="block text-[9px] uppercase tracking-[.12em] text-muted-foreground">{option.note}</span>
            </span>
          </button>
        ))}
      </nav>

      {!file ? (
        <section className="landing-grid mx-auto grid w-full max-w-7xl gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:gap-16 lg:pt-16">
          <div className="max-w-xl">
            <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-[#aeb5ff]">
              <span className="size-1.5 rounded-full bg-[#7cffb2] shadow-[0_0_10px_#7cffb2]" />
              Built for Discord’s 5-second limit
            </div>
            <h1 className="text-balance text-5xl font-black leading-[.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Cut the moment.<br />
              <span className="hero-accent text-[#8e9aff]">Keep the chaos.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Turn any MP4 or MP3 into a clean, Discord-ready sound. Pick the exact moment, preview it, and download—no uploads to a server.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#afb5cc]">
              <span className="flex items-center gap-2"><span className="text-[#7cffb2]">✓</span> Max 5 seconds</span>
              <span className="flex items-center gap-2"><span className="text-[#7cffb2]">✓</span> Under 512 KB</span>
              <span className="flex items-center gap-2"><span className="text-[#7cffb2]">✓</span> MP3 output</span>
            </div>
          </div>

          <div
            className="relative"
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (event.currentTarget === event.target) setIsDragging(false);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              acceptFile(event.dataTransfer.files[0]);
            }}
          >
            <div className="pointer-events-none absolute -inset-20 -z-0 rounded-full bg-primary/15 blur-3xl" />
            <div className="upload-shell game-panel relative rounded-[28px] border border-white/10 bg-[#11162c]/90 p-3 shadow-[0_30px_100px_rgba(0,0,0,.4)] backdrop-blur sm:p-4">
              <label className={`upload-zone group flex min-h-[390px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed px-6 text-center transition ${isDragging ? 'border-primary bg-primary/10' : 'border-white/15 bg-[radial-gradient(circle_at_50%_0%,rgba(88,101,242,.16),transparent_48%)] hover:border-primary/70 hover:bg-primary/[.045]'}`}>
                <input
                  className="sr-only"
                  type="file"
                  accept="video/mp4,audio/mpeg,.mp4,.mp3"
                  onChange={(event) => {
                    acceptFile(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
                <span className="upload-icon relative mb-6 grid size-20 place-items-center rounded-2xl border border-white/10 bg-white/[.055] text-[#9ca6ff] shadow-xl transition group-hover:-translate-y-1 group-hover:scale-105">
                  <FileVideo className="size-9" />
                  <span className="absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full bg-primary text-white ring-4 ring-[#11162c]">
                    <UploadCloud className="size-4" />
                  </span>
                </span>
                <h2 className="text-xl font-bold tracking-tight">{isDragging ? 'Drop it here' : 'Drop your MP4 or MP3 here'}</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">or click to choose a file from your device</p>
                <span className="mt-7 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(88,101,242,.28)]">Choose file</span>
                <p className="mt-5 text-xs text-[#747b94]">MP4 or MP3 · up to 250 MB</p>
              </label>
            </div>
          </div>
          {error && (
            <div className="lg:col-start-2 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">
              <CircleAlert className="size-4 shrink-0" /> {error}
            </div>
          )}
        </section>
      ) : (
        <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-5 sm:px-8">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#8e9aff]">Create your clip</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Find the perfect five seconds.</h1>
            </div>
            <Button variant="outline" className="h-10 self-start rounded-xl border-white/10 bg-white/[.03] px-4" onClick={clearFile}>
              <RotateCcw /> Start over
            </Button>
          </div>

          <div className="workspace-grid grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
            <div className="editor-column space-y-5">
              <section className="game-panel overflow-hidden rounded-3xl border border-white/10 bg-[#11162c] shadow-2xl">
                <div className={`relative aspect-video ${isAudioFile ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(88,101,242,.3),transparent_55%),#090c19]' : 'bg-black'}`}>
                  <video
                    ref={videoRef}
                    src={fileUrl}
                    className={isAudioFile ? 'sr-only' : 'size-full object-contain'}
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      const nextDuration = event.currentTarget.duration;
                      if (!Number.isFinite(nextDuration) || nextDuration < 0.1) {
                        setError('This file has an invalid duration.');
                        return;
                      }
                      setDuration(nextDuration);
                      setSelection({ start: 0, end: Math.min(MAX_CLIP_SECONDS, nextDuration) });
                    }}
                  >
                    <track kind="captions" srcLang="en" label="User-provided video" />
                  </video>
                  {isAudioFile && (
                    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
                      <span className="grid size-28 place-items-center rounded-full border border-primary/25 bg-primary/15 text-[#aeb5ff] shadow-[0_0_70px_rgba(88,101,242,.35)]">
                        <Music2 className="size-12" />
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={isPlaying ? 'Pause selected clip' : 'Play selected clip'}
                    onClick={togglePreview}
                    className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#0b0e1b]/70 text-white shadow-2xl backdrop-blur transition hover:scale-105 hover:bg-primary"
                  >
                    {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="ml-1 size-6 fill-current" />}
                  </button>
                </div>

                <div className="border-t border-white/8 p-4 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{file.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatBytes(file.size)} · {formatTime(duration)}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-[#aeb5ff]">
                      {clipDuration.toFixed(2)}s selected
                    </span>
                  </div>

                  <div className="game-subpanel rounded-2xl border border-white/8 bg-[#0b0f20] p-4">
                    {!duration && <div className="h-[88px] animate-pulse rounded-xl bg-white/5" />}
                    <div ref={waveformRef} className={duration ? 'block' : 'hidden'} aria-label="Audio waveform with draggable trim handles" />
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button className="h-10 rounded-xl px-4 font-bold" onClick={togglePreview} disabled={!duration}>
                        {isPlaying ? <Pause /> : <Play />} {isPlaying ? 'Pause clip' : 'Preview clip'}
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Scissors className="size-4 text-[#8e9aff]" />
                        Drag the purple region or its edges
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="game-panel grid gap-3 rounded-2xl border border-white/10 bg-[#11162c] p-4 sm:grid-cols-2 sm:p-5">
                <label className="block" htmlFor="clip-start">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Starts at</span>
                  <div className="relative">
                    <Input
                      id="clip-start"
                      type="number"
                      min={0}
                      max={Math.max(0, selection.end - 0.1)}
                      step={0.01}
                      value={selection.start.toFixed(2)}
                      onChange={(event) => updateBoundary('start', event.target.value)}
                      className="h-11 rounded-xl border-white/10 bg-white/[.035] pr-12 text-base font-bold tabular-nums"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">sec</span>
                  </div>
                </label>
                <label className="block" htmlFor="clip-end">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Ends at</span>
                  <div className="relative">
                    <Input
                      id="clip-end"
                      type="number"
                      min={selection.start + 0.1}
                      max={duration}
                      step={0.01}
                      value={selection.end.toFixed(2)}
                      onChange={(event) => updateBoundary('end', event.target.value)}
                      className="h-11 rounded-xl border-white/10 bg-white/[.035] pr-12 text-base font-bold tabular-nums"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">sec</span>
                  </div>
                </label>
              </section>
            </div>

            <aside className="finish-column space-y-5">
              <section className="game-panel rounded-3xl border border-white/10 bg-[#11162c] p-5 shadow-xl sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-[#9ca6ff]"><WandSparkles className="size-5" /></span>
                  <div>
                    <h2 className="font-bold">Finish your sound</h2>
                    <p className="text-xs text-muted-foreground">Optimized for Discord</p>
                  </div>
                </div>

                <label className="mt-6 block" htmlFor="output-name">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">File name</span>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/[.035] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/20">
                    <input
                      id="output-name"
                      value={outputName}
                      onChange={(event) => setOutputName(safeName(event.target.value))}
                      className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none"
                      aria-label="Output file name"
                    />
                    <span className="pr-3 text-xs text-muted-foreground">.mp3</span>
                  </div>
                </label>

                <div className="game-subpanel mt-5 divide-y divide-white/8 rounded-2xl border border-white/8 bg-[#0b0f20] px-4">
                  <div className="flex items-center justify-between gap-4 py-4">
                    <span id="normalize-label">
                      <span className="flex items-center gap-2 text-sm font-bold"><Sparkles className="size-4 text-[#8e9aff]" /> Normalize volume</span>
                      <span className="mt-1 block text-xs text-muted-foreground">Clear and consistent loudness</span>
                    </span>
                    <Switch checked={normalize} onCheckedChange={(checked) => { setNormalize(checked); resetOutput(); }} aria-labelledby="normalize-label" />
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <span id="fade-label">
                      <span className="flex items-center gap-2 text-sm font-bold"><Music2 className="size-4 text-[#8e9aff]" /> Smooth edges</span>
                      <span className="mt-1 block text-xs text-muted-foreground">Tiny fade to prevent clicks</span>
                    </span>
                    <Switch checked={fade} onCheckedChange={(checked) => { setFade(checked); resetOutput(); }} aria-labelledby="fade-label" />
                  </div>
                </div>

                {isBusy && (
                  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/8 p-4" aria-live="polite">
                    <div className="mb-3 flex items-center justify-between text-xs">
                      <span className="font-bold">{stage === 'loading' ? 'Preparing audio engine…' : 'Creating your MP3…'}</span>
                      <span className="tabular-nums text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="[&_[data-slot=progress-track]]:h-2" />
                  </div>
                )}

                {error && (
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-3 text-xs leading-5 text-red-200" role="alert">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
                  </div>
                )}

                {stage === 'done' && outputUrl && (
                  <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.07] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-300"><Check className="size-4" /> Discord-ready</div>
                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                      <span>{clipDuration.toFixed(2)} sec</span>
                      <span>•</span>
                      <span>{formatBytes(outputSize)}</span>
                      <span>•</span>
                      <span>MP3</span>
                    </div>
                    <audio className="mt-4 h-9 w-full" controls src={outputUrl}>
                      <track kind="captions" srcLang="en" label="Generated sound clip" />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {stage === 'done' && outputUrl ? (
                  <Button
                    className="mt-5 h-12 w-full rounded-xl text-sm font-black shadow-[0_12px_30px_rgba(88,101,242,.3)]"
                    render={<a href={outputUrl} download={`${outputName || 'soundboard-clip'}.mp3`} aria-label="Download generated MP3"><span className="sr-only">Download generated MP3</span></a>}
                  >
                    <Download /> Download MP3
                  </Button>
                ) : (
                  <Button
                    className="mt-5 h-12 w-full rounded-xl text-sm font-black shadow-[0_12px_30px_rgba(88,101,242,.3)]"
                    onClick={convert}
                    disabled={!duration || isBusy || clipDuration <= 0 || clipDuration > MAX_CLIP_SECONDS}
                  >
                    <Scissors /> {isBusy ? 'Working…' : 'Create MP3'}
                  </Button>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    ['Length', '≤ 5 sec'],
                    ['Size', '< 512 KB'],
                    ['Format', 'MP3'],
                  ].map(([label, value]) => (
                    <div className="rounded-xl border border-white/8 bg-white/[.025] px-2 py-3 text-center" key={label}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                      <p className="mt-1 text-xs font-bold text-[#dce0f4]">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex items-center justify-center gap-2 text-center text-xs text-[#747b94]">
                <LockKeyhole className="size-3.5" /> Your file never leaves this browser
              </div>
            </aside>
          </div>
        </section>
      )}

      <footer className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2 border-t border-white/6 px-5 py-5 text-xs text-[#666d88] sm:px-8">
        <span>Made for quick reactions, questionable timing, and good friends.</span>
      </footer>
    </main>
  );
}
