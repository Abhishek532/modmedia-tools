'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import {
  Check,
  CircleAlert,
  Download,
  FileVideo,
  LockKeyhole,
  Music2,
  Pause,
  Play,
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
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 5 });
  const [playhead, setPlayhead] = useState(0);
  const [showPlayhead, setShowPlayhead] = useState(false);
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const rangeDragRef = useRef<{ offset: number; length: number } | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
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

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      media: videoRef.current,
      url: fileUrl,
      height: 108,
      waveColor: '#71667c',
      progressColor: '#71667c',
      cursorWidth: 0,
      barWidth: 3,
      barGap: 3,
      barRadius: 2,
      barMinHeight: 2,
      normalize: true,
      interact: false,
    });

    wavesurferRef.current = wavesurfer;
    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));
    wavesurfer.on('timeupdate', (time) => {
      setPlayhead(time);
      const current = selectionRef.current;
      if (time >= current.end && !videoRef.current?.paused) {
        wavesurfer.pause();
        wavesurfer.setTime(current.start);
        setPlayhead(current.start);
      }
    });
    wavesurfer.on('error', () => {
      setError('This file could not be decoded in your browser. Try a standard MP3 or H.264 MP4.');
    });

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
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
      setPlayhead(0);
      setShowPlayhead(false);
      setOutputName(safeName(nextFile.name));
    },
    [resetOutput],
  );

  const clearFile = () => {
    setFileUrl('');
    setFile(null);
    setDuration(0);
    setSelection({ start: 0, end: 5 });
    setPlayhead(0);
    setShowPlayhead(false);
    setIsPlaying(false);
    resetOutput();
  };

  const applySelection = (next: { start: number; end: number }) => {
    selectionRef.current = next;
    setSelection(next);
    setPlayhead(next.start);
    setShowPlayhead(false);
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
    applySelection(next);
  };

  const moveTrimHandle = (side: 'start' | 'end', clientX: number) => {
    const timeline = timelineRef.current;
    if (!timeline || !duration) return;
    const bounds = timeline.getBoundingClientRect();
    const time = Math.max(0, Math.min(duration, ((clientX - bounds.left) / bounds.width) * duration));
    updateBoundary(side, String(time));
  };

  const startRangeDrag = (clientX: number) => {
    const timeline = timelineRef.current;
    if (!timeline || !duration) return;
    const bounds = timeline.getBoundingClientRect();
    const time = Math.max(0, Math.min(duration, ((clientX - bounds.left) / bounds.width) * duration));
    rangeDragRef.current = { offset: time - selection.start, length: selection.end - selection.start };
  };

  const moveRange = (clientX: number) => {
    const timeline = timelineRef.current;
    const drag = rangeDragRef.current;
    if (!timeline || !drag || !duration) return;
    const bounds = timeline.getBoundingClientRect();
    const time = Math.max(0, Math.min(duration, ((clientX - bounds.left) / bounds.width) * duration));
    const start = Math.max(0, Math.min(time - drag.offset, duration - drag.length));
    applySelection({ start, end: start + drag.length });
  };

  const togglePreview = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;
    if (isPlaying) {
      wavesurfer.pause();
    } else {
      const resumeAt = showPlayhead && playhead >= selection.start && playhead < selection.end ? playhead : selection.start;
      wavesurfer.setTime(resumeAt);
      setPlayhead(resumeAt);
      setShowPlayhead(true);
      wavesurfer.play(resumeAt, selection.end);
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
    <main className="arcade-app">
      <header className="arcade-header">
        <button className="arcade-brand" onClick={clearFile} type="button" aria-label="SoundSlice home"><span className="arcade-monogram">SS</span><span>SoundSlice</span></button>
        <span className="arcade-private"><LockKeyhole /> Files stay on your device</span>
      </header>
      {!file ? (
        <section className="arcade-upload-page">
          <div className="arcade-upload-intro"><p className="arcade-eyebrow">Discord soundboard clip maker</p><h1>Your next soundboard hit.</h1><p>Trim an MP4 or MP3 to five seconds, tune the sound, and download a Discord-ready MP3.</p></div>
          <div className={`arcade-drop-shell ${isDragging ? 'is-dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={(event) => { event.preventDefault(); if (event.currentTarget === event.target) setIsDragging(false); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setIsDragging(false); acceptFile(event.dataTransfer.files[0]); }}>
            <label className="arcade-drop-zone">
              <input className="sr-only" type="file" accept="video/mp4,audio/mpeg,.mp4,.mp3" onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ''; }} />
              <span className="arcade-upload-icon"><UploadCloud /></span><span className="arcade-drop-title">{isDragging ? 'Drop it here' : 'Drop an MP4 or MP3'}</span><span className="arcade-drop-copy">Drag a file here or choose one from your device</span><span className="arcade-choose-button">Choose file</span><span className="arcade-upload-limits">Up to 250 MB · processed locally</span>
            </label>
          </div>
          {error && <div className="arcade-alert" role="alert"><CircleAlert /> {error}</div>}
          <div className="arcade-specs" aria-label="Output requirements"><span><b>5 sec</b><small>Maximum length</small></span><span><b>512 KB</b><small>Maximum size</small></span><span><b>MP3</b><small>Discord format</small></span></div>
        </section>
      ) : (
        <section className="arcade-editor-page">
          <div className="arcade-editor-intro">
            <div><p className="arcade-eyebrow">Soundboard clip maker</p><h1>Your next soundboard hit.</h1><p>Find the moment. Keep the reaction.</p></div>
            <label className="arcade-replace arcade-replace-primary">Replace file<input className="sr-only" type="file" accept="video/mp4,audio/mpeg,.mp4,.mp3" onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ''; }} /></label>
          </div>
          <section className="arcade-editor-shell">
            <div className="arcade-file-row">
              <span className="arcade-file-icon">{isAudioFile ? <Music2 /> : <FileVideo />}</span>
              <span className="arcade-file-details"><b>{file.name}</b><small>{formatBytes(file.size)} · {formatTime(duration)} · {isAudioFile ? 'MP3 audio' : 'MP4 video'}</small></span>
            </div>
            <div className={`arcade-workspace ${isAudioFile ? 'is-audio' : ''}`}>
              <div className="arcade-media">
                <video ref={videoRef} src={fileUrl} className={isAudioFile ? 'sr-only' : 'arcade-video'} playsInline preload="metadata" onLoadedMetadata={(event) => { const nextDuration = event.currentTarget.duration; if (!Number.isFinite(nextDuration) || nextDuration < 0.1) { setError('This file has an invalid duration.'); return; } const nextSelection = { start: 0, end: Math.min(MAX_CLIP_SECONDS, nextDuration) }; setDuration(nextDuration); selectionRef.current = nextSelection; setSelection(nextSelection); setPlayhead(0); setShowPlayhead(false); }}>
                  <track kind="captions" srcLang="en" label="User-provided media" />
                </video>
                {!isAudioFile && <button type="button" className="arcade-video-play" aria-label={isPlaying ? 'Pause selected clip' : 'Play selected clip'} onClick={togglePreview}>{isPlaying ? <Pause /> : <Play />}</button>}
              </div>
              <div className="arcade-timeline">
                <div className="arcade-timeline-heading"><h2>Choose your moment</h2><span><span className="arcade-selected-duration"><b>{clipDuration.toFixed(2)}</b> sec selected</span><em>5 sec max</em></span></div>
                {!duration && <div className="arcade-wave-skeleton" />}
                <div ref={timelineRef} className={duration ? 'arcade-waveform-shell' : 'hidden'} aria-label="Audio trim control">
                  <div ref={waveformRef} className="arcade-waveform" aria-hidden="true" />
                  <div className="arcade-trim-range" style={{ left: `${(selection.start / duration) * 100}%`, width: `${((selection.end - selection.start) / duration) * 100}%` }} aria-label="Selected clip range. Drag to reposition." onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); startRangeDrag(event.clientX); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveRange(event.clientX); }} onPointerUp={(event) => { rangeDragRef.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }} />
                  {showPlayhead && <div className="arcade-playhead" style={{ left: `${(playhead / duration) * 100}%` }} aria-hidden="true" />}
                  <button type="button" className="arcade-trim-handle arcade-trim-start" style={{ left: `${(selection.start / duration) * 100}%` }} aria-label={`Trim start at ${formatTime(selection.start)}`} onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); moveTrimHandle('start', event.clientX); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTrimHandle('start', event.clientX); }} onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); updateBoundary('start', String(selection.start - 0.1)); } if (event.key === 'ArrowRight') { event.preventDefault(); updateBoundary('start', String(selection.start + 0.1)); } }} />
                  <button type="button" className="arcade-trim-handle arcade-trim-end" style={{ left: `${(selection.end / duration) * 100}%` }} aria-label={`Trim end at ${formatTime(selection.end)}`} onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); moveTrimHandle('end', event.clientX); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTrimHandle('end', event.clientX); }} onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); updateBoundary('end', String(selection.end - 0.1)); } if (event.key === 'ArrowRight') { event.preventDefault(); updateBoundary('end', String(selection.end + 0.1)); } }} />
                </div>
                <div className="arcade-ruler" aria-hidden="true"><span>{formatTime(0)}</span><span>{formatTime(duration / 2)}</span><span>{formatTime(duration)}</span></div>
                <p className="arcade-timeline-help"><span aria-hidden="true" />Drag the red range to reposition it, or either coral handle to trim. Preview plays only the selected clip.</p>
                <div className="arcade-trim-controls">
                  <Button className="arcade-preview-button" onClick={togglePreview} disabled={!duration}>{isPlaying ? <Pause /> : <Play />} {isPlaying ? 'Pause preview' : 'Preview selection'}</Button>
                  <div className="arcade-time-fields">
                    <label htmlFor="clip-start"><span>Start</span><div><Input id="clip-start" type="number" min={0} max={Math.max(0, selection.end - 0.1)} step={0.01} value={selection.start.toFixed(2)} onChange={(event) => updateBoundary('start', event.target.value)} /><span>sec</span></div></label>
                    <span className="arcade-time-arrow">→</span>
                    <label htmlFor="clip-end"><span>End</span><div><Input id="clip-end" type="number" min={selection.start + 0.1} max={duration} step={0.01} value={selection.end.toFixed(2)} onChange={(event) => updateBoundary('end', event.target.value)} /><span>sec</span></div></label>
                  </div>
                </div>
              </div>
            </div>
            <div className="arcade-finishing">
              <span>Finishing touches</span>
              <div id="normalize-label" className="arcade-switch-row"><Switch checked={normalize} onCheckedChange={(checked) => { setNormalize(checked); resetOutput(); }} aria-labelledby="normalize-label" /><Sparkles /> Normalize volume</div>
              <div id="fade-label" className="arcade-switch-row"><Switch checked={fade} onCheckedChange={(checked) => { setFade(checked); resetOutput(); }} aria-labelledby="fade-label" /><Music2 /> Fade edges</div>
            </div>
            {isBusy && <div className="arcade-progress" aria-live="polite"><div><span>{stage === 'loading' ? 'Preparing audio engine…' : 'Creating your MP3…'}</span><b>{Math.round(progress)}%</b></div><Progress value={progress} /></div>}
            {error && <div className="arcade-alert arcade-editor-alert" role="alert"><CircleAlert /> {error}</div>}
            {stage === 'done' && outputUrl && <div className="arcade-success"><div><span><Check /> Discord-ready</span><small>{clipDuration.toFixed(2)} sec · {formatBytes(outputSize)} · MP3</small></div><audio controls src={outputUrl}><track kind="captions" srcLang="en" label="Generated sound clip" />Your browser does not support audio playback.</audio></div>}
            <footer className="arcade-export">
              <label htmlFor="output-name"><span>Save as</span><div className="arcade-name-field"><input id="output-name" value={outputName} onChange={(event) => setOutputName(safeName(event.target.value))} aria-label="Output file name" /><span>.mp3</span></div></label>
              <div className="arcade-output-summary"><span><b>{clipDuration.toFixed(2)} sec</b> · MP3</span><small>{stage === 'done' ? formatBytes(outputSize) : `Est. ${Math.ceil(clipDuration * 16 + 1)} KB`} / 512 KB max</small></div>
              {stage === 'done' && outputUrl ? (
                <Button className="arcade-create-button" render={<a href={outputUrl} download={`${outputName || 'soundboard-clip'}.mp3`} aria-label="Download generated MP3"><span className="sr-only">Download generated MP3</span></a>}><Download /> Download MP3</Button>
              ) : (
                <Button className="arcade-create-button" onClick={convert} disabled={!duration || isBusy || clipDuration <= 0 || clipDuration > MAX_CLIP_SECONDS}><Scissors /> {isBusy ? 'Working…' : 'Create MP3'}</Button>
              )}
            </footer>
          </section>
          <p className="arcade-local-note"><LockKeyhole /> Your file never leaves this browser</p>
        </section>
      )}
    </main>
  );
}
