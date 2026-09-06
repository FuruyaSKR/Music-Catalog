import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { clampTime, formatTime } from "../player.js";

export default function RoomPlayer({ onTimeChange, track }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const duration = track.durationSeconds;
  const progress = duration ? `${(currentTime / duration) * 100}%` : "0%";

  useEffect(() => {
    if (!isPlaying || !duration) return undefined;

    const timer = window.setInterval(() => {
      setCurrentTime((value) => {
        const next = clampTime(value + 1, duration);
        onTimeChange(next);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [duration, isPlaying, onTimeChange]);

  useEffect(() => {
    if (isPlaying && currentTime >= duration) setIsPlaying(false);
  }, [currentTime, duration, isPlaying]);

  const seek = (value) => {
    const next = clampTime(value, duration);
    setCurrentTime(next);
    onTimeChange(next);
    if (next >= duration) setIsPlaying(false);
  };

  return (
    <footer className="room-player" aria-label="Player da faixa">
      <div className="room-player__waveform" style={{ "--player-progress": progress }}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="1"
          value={currentTime}
          onChange={({ target }) => seek(target.value)}
          aria-label="Posição da faixa"
          aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
          disabled={!duration}
        />
      </div>
      <div className="room-player__bar">
        <div className="room-player__identity">
          <strong className="catalog-truncate">{track.name}</strong>
          <span className="catalog-truncate">{track.version}</span>
        </div>
        <span className="room-player__time">{formatTime(currentTime)} / {formatTime(duration)}</span>
        <div className="room-player__transport">
          <button type="button" onClick={() => seek(currentTime - 10)} aria-label="Voltar 10 segundos" disabled={!duration}>
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button className="room-player__play" type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? "Pausar" : "Reproduzir"} disabled={!duration}>
            {isPlaying ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => seek(currentTime + 10)} aria-label="Avançar 10 segundos" disabled={!duration}>
            <RotateCw size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="room-player__volume">
          <button type="button" onClick={() => setVolume((value) => value ? 0 : 80)} aria-label={volume ? "Silenciar" : "Ativar som"}>
            {volume ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={({ target }) => setVolume(Number(target.value))}
            aria-label="Volume"
            aria-valuetext={`${volume}%`}
          />
        </div>
      </div>
    </footer>
  );
}
