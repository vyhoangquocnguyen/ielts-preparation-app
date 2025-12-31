"use client";
import { Slider } from "@/components/ui/slider";
// Audio Player Component

import { cn, formatTime } from "@/lib/utils";
import { PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Simple deterministic random generator based on a seed string
const getSeededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return (hash >>> 0) / 4294967296;
  };
};

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
  const [volume, setVolume] = useState(50);

  // Generate deterministic waveform based on audioUrl
  const waveform = useMemo(() => {
    const random = getSeededRandom(audioUrl);
    return Array.from({ length: 40 }, () => random() * 80 + 20);
  }, [audioUrl]);

  // Sync audio properties with state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
    audio.playbackRate = speed;
    audio.muted = isMuted;
  }, [volume, speed, isMuted]);

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
    setIsMuted(!isMuted);
  };

  // Handle Speed change
  const handleSpeedChange = (speed: number) => {
    setSpeed(speed);
  };
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    // Auto-unmute when adjusting volume
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentTime(parseFloat(e.target.value));
  };
  return (
    <div className="relative w-full max-w-2xl p-8 rounded-3xl bg-linear-to-br from-background/70 to-secondary/50 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden text-foreground">
      {/* Header Info */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
          IELTS Prep App
        </h3>
        <p className="text-xs text-muted-foreground">Listening Practice: Section 1</p>
      </div>

      {/* Main Controls Overlay */}
      <div className="flex items-center  justify-center gap-8 mb-8">
        {/* Skip Back (Optional) */}
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime -= 10;
          }}
          className="text-muted-foreground hover:text-foreground transition">
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
          className="text-muted-foreground hover:text-foreground transition">
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium hover:bg-muted transition">
            {speed.toFixed(1)}x
          </button>
        </div>
      </div>

      {/* Progress & Waveform */}
      <div className="space-y-4">
        <div className="relative group">
          {/* Waveform Illusion */}
          <div className="flex items-center justify-between gap-0.5 h-12 opacity-20 group-hover:opacity-40 transition-opacity px-1">
            {waveform.map((height: number, i: number) => (
              <div
                key={i}
                className="w-1 bg-cyan-700 rounded-full transition-all duration-300"
                style={{
                  height: `${height}%`,
                  opacity: i / waveform.length < currentTime / duration ? 1 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Actual Progress Line Overlay */}
          <div className="absolute bottom-0 w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)] dark:bg-cyan-400 transition-all duration-100"
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

        {/* Time Labels & Volume & Mute */}
        <div className="flex justify-between items-center text-[10px] font-bold tracking-tighter uppercase text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-[100px] transition transform hover:scale-110"
            />
            <button onClick={toggleMute} className="hover:text-cyan-400 transition transform hover:scale-110">
              {isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
            </button>
          </div>

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio hidden ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}

export default AudioPlayer;
