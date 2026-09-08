'use client';
/* oxlint-disable next/no-html-link-for-pages */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CircleAlert, Download, ImageIcon, Move, RotateCcw, SlidersHorizontal, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

const STICKER_SIZE = 320;
const MAX_OUTPUT_BYTES = 512 * 1024;
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif,.apng';

type FitMode = 'fill' | 'fit';
type Stage = 'idle' | 'loading' | 'formatting' | 'done' | 'error';

type ImageDetails = {
  width: number;
  height: number;
  image: HTMLImageElement;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function safeName(name: string) {
  return (
    name
      .replace(/\.(jpe?g|png|gif|apng)$/i, '')
      .trim()
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 56) || 'discord-sticker'
  );
}

function isAnimatedFile(file: File) {
  return /\.(gif|apng)$/i.test(file.name) || file.type === 'image/gif';
}

function StickerHero() {
  return (
    <div className="arcade-editor-intro sticker-editor-intro">
      <div>
        <h1>Sticker Formatter</h1>
        <p>Format an image or animation into a Discord-ready 320 × 320 sticker.</p>
      </div>
    </div>
  );
}

export default function StickerFormatter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [fitMode, setFitMode] = useState<FitMode>('fill');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [outputSize, setOutputSize] = useState(0);
  const [outputExtension, setOutputExtension] = useState<'png' | 'jpg' | 'gif'>('png');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const ffmpegRef = useRef<import('@ffmpeg/ffmpeg').FFmpeg | null>(null);

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

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  useEffect(() => () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }, [outputUrl]);

  const getTransform = useCallback(() => {
    if (!imageDetails) return null;
    const baseScale = fitMode === 'fill'
      ? Math.max(STICKER_SIZE / imageDetails.width, STICKER_SIZE / imageDetails.height)
      : Math.min(STICKER_SIZE / imageDetails.width, STICKER_SIZE / imageDetails.height);
    const scale = baseScale * zoom;
    const width = imageDetails.width * scale;
    const height = imageDetails.height * scale;
    const centeredX = (STICKER_SIZE - width) / 2;
    const centeredY = (STICKER_SIZE - height) / 2;
    const minOffsetX = width > STICKER_SIZE ? STICKER_SIZE - width - centeredX : 0;
    const maxOffsetX = width > STICKER_SIZE ? -centeredX : 0;
    const minOffsetY = height > STICKER_SIZE ? STICKER_SIZE - height - centeredY : 0;
    const maxOffsetY = height > STICKER_SIZE ? -centeredY : 0;
    return {
      width,
      height,
      x: centeredX + Math.max(minOffsetX, Math.min(maxOffsetX, offset.x)),
      y: centeredY + Math.max(minOffsetY, Math.min(maxOffsetY, offset.y)),
      minOffsetX,
      maxOffsetX,
      minOffsetY,
      maxOffsetY,
    };
  }, [fitMode, imageDetails, offset, zoom]);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const transform = getTransform();
    if (!canvas || !imageDetails || !transform) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.width = STICKER_SIZE;
    canvas.height = STICKER_SIZE;
    context.clearRect(0, 0, STICKER_SIZE, STICKER_SIZE);
    context.drawImage(imageDetails.image, transform.x, transform.y, transform.width, transform.height);
  }, [getTransform, imageDetails]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const acceptFile = useCallback((nextFile?: File) => {
    if (!nextFile) return;
    const accepted = /\.(jpe?g|png|gif|apng)$/i.test(nextFile.name) || ['image/jpeg', 'image/png', 'image/gif'].includes(nextFile.type);
    if (!accepted) {
      setError('Choose a JPG, PNG, GIF, or APNG file.');
      return;
    }

    resetOutput();
    const url = URL.createObjectURL(nextFile);
    const image = new Image();
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        URL.revokeObjectURL(url);
        setError('This image could not be read. Choose another file.');
        return;
      }
      setFileUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      setFile(nextFile);
      setImageDetails({ width: image.naturalWidth, height: image.naturalHeight, image });
      setFitMode('fill');
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError('This image could not be read. Choose another file.');
    };
    image.src = url;
  }, [resetOutput]);

  const resetPosition = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    resetOutput();
  };

  const updateFitMode = (next: FitMode) => {
    setFitMode(next);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    resetOutput();
  };

  const movePreview = (clientX: number, clientY: number) => {
    const drag = dragRef.current;
    if (!drag) return;
    const transform = getTransform();
    if (!transform) return;
    const nextX = drag.offsetX + clientX - drag.x;
    const nextY = drag.offsetY + clientY - drag.y;
    setOffset({
      x: Math.max(transform.minOffsetX, Math.min(transform.maxOffsetX, nextX)),
      y: Math.max(transform.minOffsetY, Math.min(transform.maxOffsetY, nextY)),
    });
  };

  const buildStaticSticker = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) throw new Error('The sticker preview is not ready yet.');
    const toBlob = (type: string, quality?: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    const png = await toBlob('image/png');
    if (!png) throw new Error('The browser could not create the sticker.');
    if (png.size <= MAX_OUTPUT_BYTES) return { blob: png, extension: 'png' as const };

    for (const quality of [0.92, 0.84, 0.76, 0.68, 0.6, 0.52]) {
      const jpg = await toBlob('image/jpeg', quality);
      if (jpg && jpg.size <= MAX_OUTPUT_BYTES) return { blob: jpg, extension: 'jpg' as const };
    }
    throw new Error('This image is still over Discord’s 512 KB sticker limit. Try a simpler image or crop closer to the subject.');
  };

  const loadFfmpeg = async () => {
    const [{ FFmpeg }, { fetchFile }] = await Promise.all([import('@ffmpeg/ffmpeg'), import('@ffmpeg/util')]);
    let ffmpeg = ffmpegRef.current;
    if (!ffmpeg) {
      ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
    }
    if (!ffmpeg.loaded) {
      const partUrls = ['/ffmpeg/ffmpeg-core.wasm.partaa', '/ffmpeg/ffmpeg-core.wasm.partab'];
      const responses = await Promise.all(partUrls.map((url) => fetch(url)));
      if (responses.some((response) => !response.ok)) throw new Error('The animation formatter could not be downloaded.');
      const parts = await Promise.all(responses.map((response) => response.arrayBuffer()));
      const wasmUrl = URL.createObjectURL(new Blob(parts, { type: 'application/wasm' }));
      try {
        await ffmpeg.load({ coreURL: '/ffmpeg/ffmpeg-core.js', wasmURL: wasmUrl });
      } finally {
        URL.revokeObjectURL(wasmUrl);
      }
    }
    return { ffmpeg, fetchFile };
  };

  const buildAnimatedSticker = async () => {
    if (!file || !imageDetails) throw new Error('The sticker preview is not ready yet.');
    const { ffmpeg, fetchFile } = await loadFfmpeg();
    const transform = getTransform();
    if (!transform) throw new Error('The sticker crop is not ready yet.');
    const sourceExtension = file.name.toLowerCase().endsWith('.apng') ? 'apng' : 'gif';
    const inputName = `input.${sourceExtension}`;
    const outputName = 'sticker.gif';
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const scaledWidth = Math.max(STICKER_SIZE, Math.round(transform.width));
    const scaledHeight = Math.max(STICKER_SIZE, Math.round(transform.height));
    const cropX = Math.max(0, Math.round(-transform.x));
    const cropY = Math.max(0, Math.round(-transform.y));
    const filter = `fps=12,scale=${scaledWidth}:${scaledHeight}:flags=lanczos,crop=${STICKER_SIZE}:${STICKER_SIZE}:${cropX}:${cropY},split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer`;
    const exitCode = await ffmpeg.exec(['-i', inputName, '-filter_complex', filter, '-loop', '0', outputName]);
    if (exitCode !== 0) throw new Error('The animation could not be formatted.');
    const data = await ffmpeg.readFile(outputName);
    if (typeof data === 'string') throw new Error('Unexpected animation output.');
    const blob = new Blob([new Uint8Array(data)], { type: 'image/gif' });
    await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
    if (blob.size > MAX_OUTPUT_BYTES) throw new Error('This animation is still over Discord’s 512 KB sticker limit. Try a shorter or simpler animation.');
    return { blob, extension: 'gif' as const };
  };

  const createSticker = async () => {
    if (!file || !imageDetails) return;
    resetOutput();
    setStage('loading');
    setProgress(12);
    try {
      setStage('formatting');
      setProgress(42);
      const result = isAnimatedFile(file) ? await buildAnimatedSticker() : await buildStaticSticker();
      setProgress(94);
      setOutputUrl(URL.createObjectURL(result.blob));
      setOutputSize(result.blob.size);
      setOutputExtension(result.extension);
      setProgress(100);
      setStage('done');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sticker formatting failed. Try another image.');
      setStage('error');
      setProgress(0);
    }
  };

  const animated = file ? isAnimatedFile(file) : false;
  const busy = stage === 'loading' || stage === 'formatting';

  return (
    <main className="arcade-app">
      <header className="arcade-header">
        <a className="arcade-brand" href="/" aria-label="SoundSlice home"><span className="arcade-monogram">SS</span><span className="arcade-brand-copy">SoundSlice</span></a>
      </header>
      {!file ? (
        <section className="arcade-upload-page sticker-upload-page">
          <a className="arcade-back-link" href="/"><ArrowLeft /> All tools</a>
          <StickerHero />
          <div className={`arcade-drop-shell ${isDragging ? 'is-dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={(event) => { event.preventDefault(); if (event.currentTarget === event.target) setIsDragging(false); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setIsDragging(false); acceptFile(event.dataTransfer.files[0]); }}>
            <label className="arcade-drop-zone" aria-label="Choose a sticker image">
              <input className="sr-only" type="file" accept={ACCEPTED_TYPES} onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ''; }} />
              <span className="arcade-drop-main"><span className="arcade-drop-message"><span className="arcade-drop-title">{isDragging ? 'Drop it here' : 'Drop a JPG, PNG, GIF, or APNG'}</span><span className="arcade-drop-copy">Crop it, fit it to 320 × 320, and keep it under Discord’s 512 KB limit.</span></span><span className="arcade-choose-button"><UploadCloud /> Choose an image</span></span>
            </label>
          </div>
          {error && <div className="arcade-alert" role="alert"><CircleAlert /> {error}</div>}
        </section>
      ) : (
        <section className="arcade-editor-page sticker-editor-page">
          <a className="arcade-back-link" href="/"><ArrowLeft /> All tools</a>
          <StickerHero />
          <section className="arcade-editor-shell sticker-editor-shell">
            <div className="arcade-file-row">
              <span className="arcade-file-icon"><ImageIcon /></span>
              <span className="arcade-file-details"><b>{file.name}</b><small>{formatBytes(file.size)} · {imageDetails?.width ?? 0} × {imageDetails?.height ?? 0} · {animated ? 'Animated source' : 'Static image'}</small></span>
              <label className="arcade-replace">Replace file<input className="sr-only" type="file" accept={ACCEPTED_TYPES} onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ''; }} /></label>
            </div>
            <div className="sticker-workspace">
              <div className="sticker-preview-panel">
                <div className="sticker-preview-heading"><span>Preview</span><small>320 × 320</small></div>
                <canvas ref={canvasRef} className="sticker-preview-canvas" aria-label="Sticker crop preview" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }; }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) movePreview(event.clientX, event.clientY); }} onPointerUp={(event) => { dragRef.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }} />
                <p><Move /> Drag the image to reposition it.</p>
              </div>
              <div className="sticker-controls">
                <div className="sticker-control-heading"><h2>Format your sticker</h2><span><b>320 × 320</b> · 512 KB max</span></div>
                <p className="sticker-control-help">Choose how the image fits, then zoom or reposition it before export.</p>
                <div className="sticker-fit-options" aria-label="Sticker fit mode">
                  <button type="button" className={fitMode === 'fill' ? 'is-active' : ''} onClick={() => updateFitMode('fill')} aria-pressed={fitMode === 'fill'}><span>Fill</span><small>Crops edges to fill the sticker</small></button>
                  <button type="button" className={fitMode === 'fit' ? 'is-active' : ''} onClick={() => updateFitMode('fit')} aria-pressed={fitMode === 'fit'}><span>Fit</span><small>Keeps the full image in frame</small></button>
                </div>
                <div className="sticker-zoom-control">
                  <div><label htmlFor="sticker-zoom"><SlidersHorizontal /> Zoom</label><span>{Math.round(zoom * 100)}%</span></div>
                  <Slider id="sticker-zoom" min={1} max={2.5} step={0.01} value={[zoom]} onValueChange={(value) => { setZoom(typeof value === 'number' ? value : value[0]); resetOutput(); }} aria-label="Sticker zoom" />
                </div>
                <Button className="sticker-reset-button" type="button" onClick={resetPosition}><RotateCcw /> Reset crop</Button>
                <div className="sticker-format-note"><span>{animated ? 'Animated source' : 'Static source'}</span><p>{animated ? 'Your animation will export as an optimized GIF.' : 'Your image will export as PNG, or JPG when needed to fit the size limit.'}</p></div>
              </div>
            </div>
            {error && <div className="arcade-alert arcade-editor-alert" role="alert"><CircleAlert /> {error}</div>}
            <footer className="arcade-export sticker-export">
              <div className="sticker-export-note"><span>Output</span><b>{animated ? 'Animated GIF sticker' : 'Static sticker'}</b></div>
              <div className="arcade-export-action">
                {busy && <div className="arcade-export-progress" aria-live="polite"><div><span>{stage === 'loading' ? 'Preparing…' : 'Formatting sticker…'}</span><b>{Math.round(progress)}%</b></div><Progress value={progress} /></div>}
                {stage === 'done' && outputUrl && <span className="arcade-export-success"><Check /> Sticker ready</span>}
                {stage === 'done' && <div className="arcade-output-summary"><span>320 × 320</span><span>{formatBytes(outputSize)}</span></div>}
                {stage === 'done' && outputUrl ? (
                  <Button className="arcade-create-button" render={<a href={outputUrl} download={`${safeName(file.name)}-sticker.${outputExtension}`} aria-label="Download formatted sticker" />}><Download /> Download sticker</Button>
                ) : (
                  <Button className="arcade-create-button" onClick={createSticker} disabled={busy}><ImageIcon /> {busy ? 'Working…' : 'Create sticker'}</Button>
                )}
              </div>
            </footer>
          </section>
        </section>
      )}
    </main>
  );
}
