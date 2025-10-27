import { useRef, useState, useEffect } from "react";

const AudioNotePlayer = ({ audioUrl, autoPlay = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (autoPlay) {
        audio.play();
        setIsPlaying(true);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", () => setIsPlaying(false));

    // Reset state when audioUrl changes
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);


    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [autoPlay, audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
    setProgress((newTime / duration) * 100);
  };

  const formatMMSS = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="bg-[#CC9A55] p-4 rounded-2xl flex items-center gap-3 w-full">
      {/* Play / Pause Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-white/90 rounded-full text-[#CC9A55] text-lg"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <div
        className="flex-1 h-10 px-2 py-1 rounded relative flex items-center cursor-pointer"
        onClick={handleSeek}
      >
        <div className="absolute inset-0 flex items-center md:gap-[6px] gap-[2px]">
          {[...Array(60)].map((_, i) => {
            const height = 4 + Math.sin(i / 3) * 6 + 6; 
            const filled = i < (progress / 100) * 60;
            return (
              <div
                key={i}
                className={`w-[2px] rounded-sm transition-all duration-100 ${
                  filled ? "bg-black" : "bg-gray-50"
                }`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Timer */}
      <div className="text-black text-sm w-12 text-right">
        {formatMMSS(currentTime)}
      </div>

      {/* Hidden audio */}
      <audio ref={audioRef} src={audioUrl}></audio>
    </div>
  );
};

export default AudioNotePlayer;
