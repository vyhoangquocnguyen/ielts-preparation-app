// Audio Player Component

import { formatTime } from "@/lib/utils";
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";

const WAVEFORM_HEIGHTS = [...Array(40)].map(() => Math.random() * 80 + 20);

type AudioPlayerProps = {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
};

function AudioPlayer({ audioUrl, onTimeUpdate, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // State Management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  // EFFECTS: Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    //  When audio metadata loads (get duration)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    //  When audio time updates (fire constantly while playing)
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime); //Notify parent component
    };

    //  When audio ends
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.(); //Notify parent component
    };
    //   When play starts
    const handlePlay = () => {
      setIsPlaying(true);
    };
    //   When pause happens
    const handlePause = () => {
      setIsPlaying(false);
    };
    //   When audio can start playing
    const handleCanPlay = () => {
      // No longer using isLoading state, but this event is still useful
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("canplay", handleCanPlay);
    // Remove event listeners on cleanup
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [onTimeUpdate, onEnded]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (!isPlaying) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsMuted(!isMuted);
    if (audio) audio.muted = !isMuted;
  };

  // Handle Speed change
  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    setSpeed(speed);
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentTime(parseFloat(e.target.value));
  };
  return (
    <div className="relative w-full max-w-2xl p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden text-white">
      {/* Header Info */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">IELTS Prep App</h3>
        <p className="text-xs text-white/40">Listening Practice: Section 1</p>
      </div>

      {/* Main Controls Overlay */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {/* Skip Back (Optional) */}
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime -= 10;
          }}
          className="text-white/40 hover:text-white transition">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
            />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="group relative p-4 rounded-full bg-cyan-500/10 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          {isPlaying ? (
            <PauseIcon className="w-8 h-8 text-cyan-400 fill-cyan-400" />
          ) : (
            <PlayIcon className="w-8 h-8 text-cyan-400 fill-cyan-400 translate-x-0.5" />
          )}
          {/* Animated Glow Ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-400 opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
        </button>

        {/* Skip Forward (Optional) */}
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime += 10;
          }}
          className="text-white/40 hover:text-white transition">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z"
            />
          </svg>
        </button>

        {/* Speed Selector (Fixed to the right) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 mt-3">
          <button
            onClick={() => handleSpeedChange(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition">
            {speed.toFixed(1)}x
          </button>
        </div>
      </div>

      {/* Progress & Waveform */}
      <div className="space-y-4">
        <div className="relative group">
          {/* Waveform Illusion */}
          <div className="flex items-center justify-between gap-0.5 h-12 opacity-20 group-hover:opacity-40 transition-opacity px-1">
            {WAVEFORM_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full transition-all duration-300"
                style={{
                  height: `${height}%`,
                  opacity: i / WAVEFORM_HEIGHTS.length < currentTime / duration ? 1 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Actual Progress Line Overlay */}
          <div className="absolute bottom-0 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Invisible Range Input for Interaction */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Time Labels & Mute */}
        <div className="flex justify-between items-center text-[10px] font-bold tracking-tighter uppercase text-white/30">
          <span>{formatTime(currentTime)}</span>

          <button onClick={toggleMute} className="hover:text-cyan-400 transition transform hover:scale-110">
            {isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
          </button>

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio hidden ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}

export default AudioPlayer;
// Play/Pause Button
// Mute/Unmute Button
// Volume Slider
// Current Time
// Total Time
// Progress Bar
