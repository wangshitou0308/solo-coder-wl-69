import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Pause,
  Square,
  Play,
  RotateCcw,
  Check,
  Upload,
  FileAudio,
  AlertTriangle,
  Clock,
  X,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onConfirm: (data: { audioUrl: string; duration: number }) => void;
  maxDuration?: number;
}

type RecorderStatus = 'idle' | 'recording' | 'paused' | 'recorded' | 'error';
type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const WAVE_BARS = 28;

export default function AudioRecorder({ onConfirm, maxDuration = 7200 }: AudioRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState(0);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupStream();
      clearTimer();
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [cleanupStream, clearTimer, audioUrl]);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimestampRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = accumulatedRef.current + (Date.now() - startTimestampRef.current) / 1000;
      setDuration(elapsed);
      if (maxDuration && elapsed >= maxDuration) {
        void stopRecording();
      }
    }, 100);
  }, [clearTimer, maxDuration]);

  const pauseTimer = useCallback(() => {
    accumulatedRef.current += (Date.now() - startTimestampRef.current) / 1000;
    clearTimer();
  }, [clearTimer]);

  const startRecording = async () => {
    setErrorMsg('');
    setAudioUrl('');
    setAudioDuration(0);

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setStatus('error');
      setErrorMsg('您的浏览器不支持录音功能，请使用最新版 Chrome 或 Firefox 浏览器。');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;
      chunksRef.current = [];
      accumulatedRef.current = 0;
      setDuration(0);

      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      let selectedMimeType = '';
      for (const mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) {
          selectedMimeType = mt;
          break;
        }
      }

      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: selectedMimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioDuration(Math.round(duration));
        setStatus('recorded');
        cleanupStream();
        clearTimer();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setStatus('recording');
      startTimer();
    } catch (err) {
      const error = err as DOMException;
      setStatus('error');
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMsg('麦克风权限被拒绝，请在浏览器设置中允许访问麦克风后重试。');
      } else if (error.name === 'NotFoundError') {
        setErrorMsg('未检测到可用的麦克风设备，请连接麦克风后重试。');
      } else {
        setErrorMsg(`录音启动失败：${error.message || '未知错误'}`);
      }
      cleanupStream();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      pauseTimer();
      setStatus('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimer();
      setStatus('recording');
    }
  };

  const stopRecording = async () => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === 'recording' ||
        mediaRecorderRef.current.state === 'paused')
    ) {
      if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      mediaRecorderRef.current.stop();
    }
  };

  const resetRecording = () => {
    cleanupStream();
    clearTimer();
    accumulatedRef.current = 0;
    startTimestampRef.current = 0;
    chunksRef.current = [];
    setStatus('idle');
    setDuration(0);
    setErrorMsg('');
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setAudioDuration(0);
    setIsPlayingBack(false);
    setPlaybackTime(0);
  };

  const handlePlayback = () => {
    if (!audioElRef.current || !audioUrl) return;
    if (isPlayingBack) {
      audioElRef.current.pause();
    } else {
      void audioElRef.current.play();
    }
  };

  const processFile = async (file: File) => {
    setUploadError('');
    setUploadStatus('uploading');
    setFileName(file.name);

    const validTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/mp4',
      'audio/m4a',
      'audio/x-m4a',
      'audio/aac',
      'audio/ogg',
      'audio/webm',
    ];
    const validExtensions = /\.(mp3|wav|m4a|aac|ogg|webm)$/i;

    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setUploadStatus('error');
      setUploadError('不支持的文件格式，请上传 MP3、WAV 或 M4A 格式的音频文件。');
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadError('文件大小超过 200MB 限制，请选择更小的文件。');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio();
      tempAudio.preload = 'metadata';
      tempAudio.src = url;

      await new Promise<void>((resolve, reject) => {
        tempAudio.addEventListener('loadedmetadata', () => resolve(), { once: true });
        tempAudio.addEventListener('error', () => reject(new Error('无法解析音频文件')), {
          once: true,
        });
      });

      const dur = Math.round(tempAudio.duration);
      setAudioUrl(url);
      setAudioDuration(dur);
      setDuration(dur);
      setUploadStatus('uploaded');
      setStatus('recorded');
    } catch (err) {
      const e = err as Error;
      setUploadStatus('error');
      setUploadError(`文件处理失败：${e.message || '文件格式不正确'}`);
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const confirmAudio = () => {
    if (!audioUrl) return;
    onConfirm({
      audioUrl,
      duration: audioDuration || Math.round(duration),
    });
  };

  const playbackDuration = audioDuration || duration;
  const playbackProgress = playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0;

  return (
    <div className="card overflow-hidden">
      {audioUrl && (
        <audio
          ref={audioElRef}
          src={audioUrl}
          onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            if (!audioDuration) setAudioDuration(Math.round(e.currentTarget.duration));
          }}
          onPlay={() => setIsPlayingBack(true)}
          onPause={() => setIsPlayingBack(false)}
          onEnded={() => {
            setIsPlayingBack(false);
            setPlaybackTime(0);
          }}
          preload="metadata"
        />
      )}

      <div className="p-5 md:p-6 border-b border-rice-100 bg-gradient-to-br from-rice-50 to-white">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-300',
                status === 'recording'
                  ? 'bg-cinnabar-500 animate-pulse'
                  : status === 'recorded' || uploadStatus === 'uploaded'
                    ? 'bg-jade-500'
                    : status === 'error' || uploadStatus === 'error'
                      ? 'bg-amber-500'
                      : 'bg-cinnabar-100'
              )}
            >
              {status === 'recording' ? (
                <Mic className="w-5 h-5 text-white" strokeWidth={2} />
              ) : status === 'recorded' || uploadStatus === 'uploaded' ? (
                <FileAudio className="w-5 h-5 text-white" strokeWidth={2} />
              ) : status === 'error' || uploadStatus === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2} />
              ) : (
                <Mic className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-ink-800 text-lg">录音采集</h3>
              <p className="text-xs text-ink-500">支持浏览器录音或上传本地音频文件</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-900 text-white font-mono tabular-nums text-sm">
            <Clock className="w-4 h-4 text-gold-400" strokeWidth={2} />
            <span>{formatDuration(status === 'recorded' ? audioDuration || duration : duration)}</span>
            <span className="text-ink-500 text-xs">
              / 最长 {formatDuration(maxDuration)}
            </span>
          </div>
        </div>

        {(status === 'error' || uploadStatus === 'error') &&
          (errorMsg || uploadError) && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 mb-1">出错了</p>
                <p className="text-sm text-amber-700">{errorMsg || uploadError}</p>
              </div>
              <button
                onClick={resetRecording}
                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

        {(status === 'recording' || status === 'paused') && (
          <div className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-cinnabar-50 via-white to-rice-50 border border-cinnabar-100">
            <div className="flex items-end justify-center gap-[4px] h-14 mb-4">
              {Array.from({ length: WAVE_BARS }).map((_, i) => {
                const baseDelay = (i * 55) % 1000;
                const heightVar = 30 + ((i * 43) % 65);
                return (
                  <div
                    key={i}
                    className={cn(
                      'wave-bar',
                      status === 'paused' && '!animate-none !scale-y-0.3'
                    )}
                    style={{
                      height: `${heightVar}%`,
                      animationDelay: `${baseDelay}ms`,
                      animationDuration: `${0.7 + ((i % 4) * 0.2)}s`,
                    }}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {status === 'recording' ? (
                <>
                  <button
                    onClick={pauseRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-amber-400 text-amber-700 font-medium hover:bg-amber-50 hover:border-amber-500 transition-all duration-200"
                  >
                    <Pause className="w-4 h-4" strokeWidth={2.5} />
                    暂停录音
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cinnabar-500 text-white text-sm font-medium shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    录音中
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={resumeRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-jade-400 text-jade-700 font-medium hover:bg-jade-50 hover:border-jade-500 transition-all duration-200"
                  >
                    <Mic className="w-4 h-4" strokeWidth={2.5} />
                    继续录音
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium shadow-md">
                    <Pause className="w-3.5 h-3.5" strokeWidth={2.5} />
                    已暂停
                  </div>
                </>
              )}
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cinnabar-500 text-white font-medium hover:bg-cinnabar-600 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Square className="w-4 h-4" strokeWidth={2.5} />
                停止
              </button>
              <button
                onClick={resetRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-ink-500 hover:text-ink-700 hover:bg-rice-100 transition-all duration-200 text-sm"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2} />
                放弃
              </button>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <button
                onClick={startRecording}
                className="w-full p-6 rounded-2xl border-2 border-dashed border-cinnabar-300 bg-gradient-to-br from-cinnabar-50/50 to-white hover:border-cinnabar-500 hover:from-cinnabar-50 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cinnabar-500 group-hover:scale-110 transition-transform duration-300 shadow-cinnabar-500/20 shadow-lg">
                    <Mic className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink-800 text-lg">开始录音</p>
                    <p className="text-sm text-ink-500 mt-1">
                      使用浏览器麦克风录制口述内容
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cinnabar-100 text-cinnabar-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-cinnabar-500" />
                    推荐使用
                  </div>
                </div>
              </button>
            </div>

            <div
              className={cn(
                'relative rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-300',
                isDragging
                  ? 'border-gold-500 bg-gold-50 scale-[1.01]'
                  : 'border-gold-300 bg-gradient-to-br from-gold-50/50 to-white hover:border-gold-500 hover:from-gold-50'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,audio/*"
                onChange={handleFileInput}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="p-6 flex flex-col items-center text-center gap-3">
                <div
                  className={cn(
                    'flex items-center justify-center w-16 h-16 rounded-full bg-gold-500 transition-transform duration-300 shadow-gold shadow-lg',
                    isDragging && 'scale-110'
                  )}
                >
                  <Upload className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-ink-800 text-lg">上传音频</p>
                  <p className="text-sm text-ink-500 mt-1">
                    拖拽文件到此处，或点击选择文件
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rice-100 text-ink-600 text-xs font-medium">
                  <FileAudio className="w-3.5 h-3.5" strokeWidth={2} />
                  支持 MP3 / WAV / M4A · 最大 200MB
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="p-6 rounded-2xl bg-rice-50 border border-rice-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-3 border-gold-500 border-t-transparent animate-spin" />
              <div className="flex-1">
                <p className="font-medium text-ink-700">正在处理文件...</p>
                <p className="text-xs text-ink-500">{fileName}</p>
              </div>
            </div>
          </div>
        )}

        {status === 'recorded' && audioUrl && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-800 text-white overflow-hidden">
            {fileName && (
              <div className="flex items-center gap-2 mb-4 text-sm text-gold-300">
                <FileAudio className="w-4 h-4" strokeWidth={2} />
                <span className="truncate">{fileName}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-1 h-10 mb-4">
              {Array.from({ length: 32 }).map((_, i) => {
                const progressRatio = playbackProgress / 100;
                const isActive = i / 32 < progressRatio;
                const h = 25 + ((i * 29) % 70);
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-[3px] rounded-full transition-all duration-150',
                      isActive ? 'bg-gold-400' : 'bg-ink-600',
                      isPlayingBack && isActive && 'wave-bar !w-[3px]'
                    )}
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 40}ms`,
                    }}
                  />
                );
              })}
            </div>

            <div
              className="relative h-2 bg-ink-700 rounded-full mb-3 overflow-hidden cursor-pointer group"
              onClick={(e) => {
                if (!audioElRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const t = pct * playbackDuration;
                audioElRef.current.currentTime = t;
                setPlaybackTime(t);
              }}
            >
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"
                style={{ width: `${playbackProgress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                style={{ left: `calc(${playbackProgress}% - 6px)` }}
              />
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-mono tabular-nums text-ink-300">
                <span>{formatDuration(playbackTime)}</span>
                <span className="text-ink-500">/</span>
                <span>{formatDuration(playbackDuration)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayback}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-lg hover:shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {isPlayingBack ? (
                    <Pause className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-ink-700/60 text-xs text-ink-300">
                  <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                  回放
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'recorded' && (
          <div className="mt-5 flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={resetRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-rice-300 text-ink-700 font-medium hover:bg-rice-50 hover:border-rice-400 transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
              重新录制/上传
            </button>
            <button
              onClick={confirmAudio}
              disabled={!audioUrl || duration < 1}
              className="btn-primary disabled:opacity-50"
            >
              <Check className="w-4 h-4" strokeWidth={2.5} />
              确认使用此音频
            </button>
          </div>
        )}
      </div>

      {(status === 'idle' || status === 'error') && (
        <div className="px-5 py-3.5 md:px-6 md:py-4 bg-rice-50/60 text-xs text-ink-500 flex items-start gap-2">
          <span className="text-cinnabar-400 mt-0.5">※</span>
          <span>
            提示：请在安静的环境中录音，说话清晰洪亮。浏览器录音最长支持
            {Math.floor(maxDuration / 3600) > 0
              ? ` ${Math.floor(maxDuration / 3600)} 小时`
              : ` ${Math.floor(maxDuration / 60)} 分钟`}
            ，请提前准备好口述内容。
          </span>
        </div>
      )}
    </div>
  );
}
