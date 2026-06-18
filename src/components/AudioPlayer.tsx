import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Disc3,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AudioParagraph {
  id: string;
  order: number;
  content: string;
  startTime?: number;
}

interface AudioPlayerProps {
  audioUrl?: string;
  paragraphs?: AudioParagraph[];
  onParagraphChange?: (paragraph: AudioParagraph | null) => void;
  totalDuration?: number;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;
const WAVE_BAR_COUNT = 24;

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function AudioPlayer({
  audioUrl,
  paragraphs = [],
  onParagraphChange,
  totalDuration: propTotalDuration,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propTotalDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);

  const simulatedTotal = propTotalDuration || paragraphs.length * 30 || 120;

  const effectiveDuration = audioUrl ? duration : simulatedTotal;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  const sortedParagraphs = [...paragraphs].sort((a, b) => a.order - b.order);

  const findActiveParagraph = useCallback(
    (time: number): AudioParagraph | null => {
      if (sortedParagraphs.length === 0) return null;

      let found: AudioParagraph | null = null;
      for (let i = 0; i < sortedParagraphs.length; i++) {
        const para = sortedParagraphs[i];
        const paraStart = para.startTime ?? para.order * 30;
        const nextPara = sortedParagraphs[i + 1];
        const paraEnd = nextPara ? nextPara.startTime ?? nextPara.order * 30 : effectiveDuration || simulatedTotal;

        if (time >= paraStart && time < paraEnd) {
          found = para;
          break;
        }
      }

      if (!found && sortedParagraphs.length > 0) {
        const lastPara = sortedParagraphs[sortedParagraphs.length - 1];
        const lastStart = lastPara.startTime ?? lastPara.order * 30;
        if (time >= lastStart) found = lastPara;
      }

      return found;
    },
    [sortedParagraphs, effectiveDuration, simulatedTotal]
  );

  useEffect(() => {
    const active = findActiveParagraph(currentTime);
    if (active?.id !== activeParagraphId) {
      setActiveParagraphId(active?.id ?? null);
      onParagraphChange?.(active);
    }
  }, [currentTime, findActiveParagraph, activeParagraphId, onParagraphChange]);

  useEffect(() => {
    if (audioUrl) return;

    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + playbackRate * 0.1;
          if (next >= simulatedTotal) {
            setIsPlaying(false);
            return simulatedTotal;
          }
          return next;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, playbackRate, audioUrl, simulatedTotal]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audioUrl && audio) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    } else {
      if (currentTime >= simulatedTotal) setCurrentTime(0);
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * effectiveDuration;

    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleParagraphClick = (para: AudioParagraph) => {
    const startTime = para.startTime ?? para.order * 30;
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = startTime;
    }
    setCurrentTime(startTime);
  };

  const skipTime = (delta: number) => {
    const newTime = Math.max(0, Math.min(effectiveDuration, currentTime + delta));
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  return (
    <div className="card overflow-hidden">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="relative bg-gradient-to-br from-ink-800 via-ink-900 to-ink-800 p-6 md:p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-paper-texture" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="relative shrink-0">
            <div
              className={cn(
                'relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-4 border-ink-600',
                isPlaying && 'animate-[spin_3s_linear_infinite]'
              )}
            >
              <div className="absolute inset-4 rounded-full border border-ink-500/50" />
              <div className="absolute inset-8 rounded-full border border-ink-500/30" />
              <div className="absolute inset-12 rounded-full border border-ink-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold-500/20" />
              <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-cinnabar-500 to-cinnabar-700 shadow-inner flex items-center justify-center">
                <Disc3
                  className={cn(
                    'w-6 h-6 md:w-7 md:h-7 text-gold-300',
                    isPlaying && 'animate-spin'
                  )}
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-20 md:h-24 bg-gradient-to-b from-rice-400 to-rice-600 rounded-full shadow-md origin-top rotate-[-8deg] transition-transform duration-500">
              <div
                className={cn(
                  'absolute -bottom-2 -left-1 w-4 h-4 rounded-full bg-cinnabar-500 shadow-md transition-transform duration-500',
                  isPlaying && 'rotate-[15deg] translate-x-1 translate-y-1'
                )}
              />
            </div>
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cinnabar-500/20 border border-cinnabar-500/30 text-cinnabar-300 text-xs font-medium">
                <Clock className="w-3 h-3" strokeWidth={2} />
                {audioUrl ? '音频档案' : '模拟播放'}
              </span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-gold-100 mb-1">
              口述历史录音
            </h3>
            <p className="text-sm text-ink-400 mb-5 md:mb-6">
              点击段落可跳转 · 支持倍速播放
            </p>

            <div className="space-y-4">
              <div className="flex items-end justify-center md:justify-start gap-[3px] h-10 mb-1">
                {Array.from({ length: WAVE_BAR_COUNT }).map((_, i) => {
                  const heightVariation = 20 + ((i * 37) % 70);
                  const delay = (i * 80) % 1000;
                  return (
                    <div
                      key={i}
                      className={cn('wave-bar', !isPlaying && '!animate-none !scale-y-0.3')}
                      style={{
                        height: `${heightVariation}%`,
                        animationDelay: `${delay}ms`,
                        animationDuration: `${0.8 + ((i % 5) * 0.15)}s`,
                      }}
                    />
                  );
                })}
              </div>

              <div
                className="relative h-3 bg-ink-700 rounded-full cursor-pointer group overflow-hidden"
                onClick={handleSeek}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-cinnabar-500 to-cinnabar-400 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gold-400 shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ left: `calc(${progressPercent}% - 8px)` }}
                />
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-ink-300 font-mono tabular-nums">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-ink-500">/</span>
                  <span>{formatTime(effectiveDuration)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => skipTime(-10)}
                    className="p-2 rounded-lg text-ink-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    title="后退 10 秒"
                  >
                    <SkipBack className="w-5 h-5" strokeWidth={2} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cinnabar-500 to-cinnabar-600 text-white shadow-lg hover:shadow-cinnabar-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    ) : (
                      <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" strokeWidth={2.5} />
                    )}
                  </button>

                  <button
                    onClick={() => skipTime(10)}
                    className="p-2 rounded-lg text-ink-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    title="前进 10 秒"
                  >
                    <SkipForward className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-ink-200 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    <Gauge className="w-4 h-4" strokeWidth={2} />
                    <span>{playbackRate}x</span>
                  </button>

                  {speedDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSpeedDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 z-50 card-compact py-1 w-24 overflow-hidden">
                        {SPEED_OPTIONS.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => {
                              setPlaybackRate(speed);
                              setSpeedDropdownOpen(false);
                            }}
                            className={cn(
                              'w-full px-3 py-2 text-sm text-left transition-all duration-150',
                              playbackRate === speed
                                ? 'bg-cinnabar-50 text-cinnabar-700 font-medium'
                                : 'text-ink-700 hover:bg-rice-50'
                            )}
                          >
                            {speed}x 倍速
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sortedParagraphs.length > 0 && (
        <div className="p-4 md:p-6 border-t border-rice-100 bg-rice-50/50">
          <h4 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-cinnabar-500 rounded-full" />
            文稿段落（点击跳转）
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
            {sortedParagraphs.map((para) => {
              const isActive = para.id === activeParagraphId;
              const paraTime = para.startTime ?? para.order * 30;
              return (
                <button
                  key={para.id}
                  onClick={() => handleParagraphClick(para)}
                  className={cn(
                    'w-full text-left p-3 md:p-4 rounded-xl border transition-all duration-200 group',
                    isActive
                      ? 'bg-cinnabar-50 border-cinnabar-300 shadow-sm'
                      : 'bg-white border-rice-200 hover:border-cinnabar-200 hover:bg-cinnabar-50/40'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-bold transition-colors duration-200',
                        isActive
                          ? 'bg-cinnabar-500 text-white'
                          : 'bg-rice-200 text-ink-600 group-hover:bg-cinnabar-200 group-hover:text-cinnabar-700'
                      )}
                    >
                      {para.order + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-ink-400">
                          {formatTime(paraTime)}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cinnabar-500 text-white text-[10px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            播放中
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-sm leading-relaxed line-clamp-2',
                          isActive ? 'text-ink-900 font-medium' : 'text-ink-700'
                        )}
                      >
                        {para.content}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
