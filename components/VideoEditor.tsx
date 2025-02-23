'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Upload,
  Scissors,
  Sticker as StickerIcon,
  Download,
  Trash,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AspectRatio, Sticker, VideoSegment } from '@/lib/types';
import { addStickersToVideo, cropVideo, trimVideo } from '@/lib/video-utils';
import { v4 as uuidv4 } from 'uuid';

export default function VideoEditor() {
  const [videos, setVideos] = useState<VideoSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const duration = videos.reduce((acc, video) => acc + (videoRefs.current[video.id]?.duration || 0), 0);
    setTotalDuration(duration);
  }, [videos]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newSegments = Array.from(e.target.files).map((file) => ({
        id: uuidv4(),
        startTime: 0,
        endTime: Infinity,
        file,
      }));
      setVideos((prevVideos) => [...prevVideos, ...newSegments]);
    }
  };

  const handleSplit = useCallback(
    (splitTime: number) => {
      if (videos.length === 0) return;

      let accumulatedTime = 0;
      const newSegments: VideoSegment[] = [];

      for (const video of videos) {
        const videoDuration = videoRefs.current[video.id]?.duration || 0;
        accumulatedTime += videoDuration;

        if (accumulatedTime > splitTime) {
          const splitPoint = splitTime - (accumulatedTime - videoDuration);

          newSegments.push(
            {
              ...video,
              id: uuidv4(),
              endTime: splitPoint,
            },
            {
              ...video,
              id: uuidv4(),
              startTime: splitPoint,
            }
          );
        } else {
          newSegments.push(video);
        }
      }

      setVideos(newSegments);
    },
    [videos, videoRefs]
  );

  const handleAddSticker = useCallback(
    (url: string) => {
      const newSticker: Sticker = {
        id: uuidv4(),
        url,
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        startTime: currentTime,
        endTime: currentTime + 5,
      };
      setStickers((prev) => [...prev, newSticker]);
    },
    [currentTime]
  );

  const handleExport = async () => {
    if (videos.length === 0) return;
    setIsProcessing(true);

    try {
      let processedVideo = videos[0].file;

      // Appliquer le recadrage
      const croppedVideo = await cropVideo(processedVideo, aspectRatio);
      processedVideo = new File([croppedVideo], 'cropped.mp4', {
        type: 'video/mp4',
      });

      // Appliquer les stickers
      if (stickers.length > 0) {
        const withStickers = await addStickersToVideo(processedVideo, stickers);
        processedVideo = new File([withStickers], 'with-stickers.mp4', {
          type: 'video/mp4',
        });
      }

      // Découper la vidéo si nécessaire
      if (videos[0].startTime > 0 || videos[0].endTime < Infinity) {
        const trimmed = await trimVideo(
          processedVideo,
          videos[0].startTime,
          videos[0].endTime
        );
        processedVideo = new File([trimmed], 'final.mp4', {
          type: 'video/mp4',
        });
      }

      // Télécharger le résultat
      const url = URL.createObjectURL(processedVideo);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMainVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  return (
    <div className="space-y-6">
      {/* Lecteur vidéo principal */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          ref={mainVideoRef}
          className="w-full h-full"
          controls
          onTimeUpdate={handleMainVideoTimeUpdate}
        >
          {/* Concaténer les vidéos en utilisant <source> et <track> */}
          {videos.map((segment, index) => (
            <source key={segment.id} src={URL.createObjectURL(segment.file)} type="video/mp4" />
          ))}
        </video>
      </div>

      {/* Zone de téléchargement */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <span className="text-lg font-medium">
            Glissez vos vidéos ici ou cliquez pour sélectionner
          </span>
          <span className="text-sm text-gray-500 mt-2">
            Formats supportés: MP4, WebM, MOV
          </span>
        </label>
      </div>

      {/* Prévisualisation vidéo */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((segment) => (
              <div
                key={segment.id}
                className="aspect-video bg-black rounded-lg overflow-hidden relative"
              >
                <video
                  ref={(ref) => (videoRefs.current[segment.id] = ref)}
                  src={URL.createObjectURL(segment.file)}
                  className="w-full h-full"
                  controls
                  onTimeUpdate={(e) =>
                    setCurrentTime(e.currentTarget.currentTime)
                  }
                />
                {/* Affichage des stickers */}
                {stickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    style={{
                      position: 'absolute',
                      left: `${sticker.x}px`,
                      top: `${sticker.y}px`,
                      width: `${sticker.width}px`,
                      height: `${sticker.height}px`,
                      display:
                        currentTime >= sticker.startTime &&
                        currentTime <= sticker.endTime
                          ? 'block'
                          : 'none',
                    }}
                  >
                    <img
                      src={sticker.url}
                      alt="Sticker"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSplit(currentTime)}
                  className="absolute bottom-4 left-4"
                >
                  <Scissors className="mr-2 h-4 w-4" />
                  Fractionner
                </Button>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={totalDuration}
              step={0.1}
              onValueChange={(value) => {
                if (mainVideoRef.current) {
                  mainVideoRef.current.currentTime = value[0];
                }
              }}
            />
          </div>

          {/* Format de recadrage */}
          <div className="flex items-center gap-4">
            <Label>Format:</Label>
            <RadioGroup
              value={aspectRatio}
              onValueChange={(value: AspectRatio) => setAspectRatio(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="16:9" id="r1" />
                <Label htmlFor="r1">16:9 (Paysage)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9:16" id="r2" />
                <Label htmlFor="r2">9:16 (Portrait)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1:1" id="r3" />
                <Label htmlFor="r3">1:1 (Carré)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Outils d'édition */}
          <div className="flex gap-4 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  <StickerIcon className="mr-2 h-4 w-4" />
                  Ajouter un sticker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un sticker</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sticker-url">URL du sticker (PNG)</Label>
                    <Input
                      id="sticker-url"
                      placeholder="https://exemple.com/sticker.png"
                      onChange={(e) => handleAddSticker(e.target.value)}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="default"
              size="lg"
              onClick={handleExport}
              disabled={isProcessing}
            >
              <Download className="mr-2 h-4 w-4" />
              {isProcessing ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>

          {/* Liste des segments */}
          <div className="space-y-2">
            <h3 className="font-semibold">Segments</h3>
            <div className="grid gap-2">
              {videos.map((segment, index) => (
                <div
                  key={segment.id}
                  className="flex items-center gap-2 p-2 bg-secondary rounded"
                >
                  <span>
                    Segment {index + 1} ({segment.startTime.toFixed(1)}s -{' '}
                    {segment.endTime === Infinity
                      ? 'fin'
                      : `${segment.endTime.toFixed(1)}s`}
                    )
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setVideos((prev) =>
                        prev.filter((s) => s.id !== segment.id)
                      )
                    }
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Liste des stickers */}
          <div className="space-y-2">
            <h3 className="font-semibold">Stickers</h3>
            <div className="grid gap-2">
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="flex items-center gap-2 p-2 bg-secondary rounded"
                >
                  <img
                    src={sticker.url}
                    alt="Sticker preview"
                    className="w-8 h-8 object-contain"
                  />
                  <span>
                    {sticker.startTime.toFixed(1)}s -{' '}
                    {sticker.endTime.toFixed(1)}s
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setStickers((prev) =>
                        prev.filter((s) => s.id !== sticker.id)
                      )
                    }
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}