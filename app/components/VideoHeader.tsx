import { useState, useEffect } from "react";

export default function VideoHeader({ className = "" }: { className?: string }) {
  const [activeVideo, setActiveVideo] = useState(0);
  const videos = ["/video.webm", "/video2.webm"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % videos.length);
    }, 3400);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`w-full max-w-3xl mx-auto relative min-h-[200px] ${className}`}>
      <div className="relative w-full h-[200px] overflow-hidden rounded-lg shadow-lg">
        {videos.map((video, index) => (
          <video
            key={index}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === activeVideo ? "opacity-100" : "opacity-0"
            }`}
            src={video}
            autoPlay
            loop
            muted
            playsInline
          />
        ))}
      </div>
      <h1 className="text-[1.6rem] font-extrabold text-center mt-8 ">
  STATS PAR MINUTES
</h1>
    </header>
  );
}
