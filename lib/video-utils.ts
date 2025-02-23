'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }
  return ffmpeg;
}

export async function trimVideo(
  videoFile: File,
  startTime: number,
  endTime: number
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  await ffmpeg.writeFile(inputName, await videoFile.arrayBuffer());
  
  await ffmpeg.exec([
    '-i', inputName,
    '-ss', startTime.toString(),
    '-t', (endTime - startTime).toString(),
    '-c', 'copy',
    outputName
  ]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data], { type: 'video/mp4' });
}

export async function cropVideo(
  videoFile: File,
  aspectRatio: AspectRatio
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  await ffmpeg.writeFile(inputName, await videoFile.arrayBuffer());
  
  let filterComplex = '';
  switch (aspectRatio) {
    case '16:9':
      filterComplex = 'crop=iw:iw*9/16';
      break;
    case '9:16':
      filterComplex = 'crop=ih*9/16:ih';
      break;
    case '1:1':
      filterComplex = 'crop=min(iw\\,ih):min(iw\\,ih)';
      break;
  }
  
  await ffmpeg.exec([
    '-i', inputName,
    '-vf', filterComplex,
    '-c:a', 'copy',
    outputName
  ]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data], { type: 'video/mp4' });
}

export async function addStickersToVideo(
  videoFile: File,
  stickers: Sticker[]
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  await ffmpeg.writeFile(inputName, await videoFile.arrayBuffer());
  
  // Télécharger et écrire chaque sticker
  for (let i = 0; i < stickers.length; i++) {
    const sticker = stickers[i];
    const stickerResponse = await fetch(sticker.url);
    const stickerData = await stickerResponse.arrayBuffer();
    await ffmpeg.writeFile(`sticker${i}.png`, stickerData);
  }
  
  // Créer le filtre complexe pour les stickers
  const filterComplex = stickers
    .map((sticker, i) => {
      const overlay = `[v${i}]overlay=${sticker.x}:${sticker.y}:enable='between(t,${sticker.startTime},${sticker.endTime})'[v${i + 1}]`;
      return overlay;
    })
    .join(';');
  
  const inputs = ['-i', inputName];
  stickers.forEach((_, i) => {
    inputs.push('-i', `sticker${i}.png`);
  });
  
  await ffmpeg.exec([
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', `[v${stickers.length}]`,
    '-map', '0:a',
    outputName
  ]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data], { type: 'video/mp4' });
}