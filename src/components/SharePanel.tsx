import { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  X,
  Share2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../store';

interface SharePanelProps {
  storyId: string;
  open: boolean;
  onClose: () => void;
}

export default function SharePanel({ storyId, open, onClose }: SharePanelProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const getStoryById = useAppStore((s) => s.getStoryById);
  const generateShareText = useAppStore((s) => s.generateShareText);
  const addShareRecord = useAppStore((s) => s.addShareRecord);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const story = useMemo(() => getStoryById(storyId), [getStoryById, storyId]);

  const shareUrl = useMemo(
    () => `${window.location.origin}/story/${storyId}`,
    [storyId]
  );

  const shareText = useMemo(
    () => (story ? generateShareText(story) : ''),
    [story, generateShareText]
  );

  if (!open) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (currentUser) {
        addShareRecord(currentUser.id, storyId, 'copy');
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      if (currentUser) {
        addShareRecord(currentUser.id, storyId, 'copy');
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card max-w-md w-full mx-4 p-6 animate-scroll-reveal relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cinnabar-100 border border-cinnabar-200">
              <Share2 className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-900">
              分享故事
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-rice-100 transition-colors"
          >
            <X className="w-5 h-5 text-ink-500" strokeWidth={2} />
          </button>
        </div>

        {story && (
          <div className="mb-6 p-4 rounded-xl bg-rice-50 border border-rice-100">
            <h4 className="font-serif font-bold text-ink-900 mb-1 line-clamp-1">
              {story.title}
              {story.subtitle && (
                <span className="text-sm font-normal text-ink-500 ml-2">
                  —— {story.subtitle}
                </span>
              )}
            </h4>
            <p className="text-sm text-ink-600 line-clamp-2">
              {story.summary}
            </p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="label-base flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cinnabar-500" strokeWidth={2} />
              复制链接
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="input-base !py-2 !pr-3 !bg-rice-50 text-sm truncate flex-1 cursor-default"
              />
              <button
                onClick={handleCopyLink}
                className={`btn-secondary !px-4 !py-2 gap-1.5 min-w-[96px] ${
                  copiedLink
                    ? '!bg-jade-50 !border-jade-400 !text-jade-700'
                    : ''
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={2} />
                    复制
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="label-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-cinnabar-500" strokeWidth={2} />
              生成分享文案
            </label>
            <textarea
              readOnly
              value={shareText}
              rows={5}
              className="input-base resize-none !bg-rice-50 text-sm scrollbar-thin cursor-default"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleCopyText}
                className={`btn-primary !px-4 !py-2 gap-1.5 min-w-[112px] ${
                  copiedText ? '!bg-jade-600 hover:!bg-jade-700' : ''
                }`}
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    文案已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={2} />
                    复制文案
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-rice-100">
          <p className="text-xs text-ink-400 text-center mb-3">
            其他分享方式
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1.5 cursor-not-allowed opacity-60">
              <div className="w-11 h-11 rounded-full bg-green-500/90 flex items-center justify-center text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M8.691 2C4.768 2 1.577 4.62 1.577 7.874c0 1.836 1.03 3.467 2.631 4.547a.61.61 0 0 1 .239.68l-.397 1.487c-.048.18.059.362.243.411.184.05.375-.04.45-.214l.77-1.795a.522.522 0 0 1 .479-.313c.104.009.205.044.293.1.848.523 1.852.832 2.936.832.18 0 .357-.01.532-.024a5.4 5.4 0 0 1-.192-1.5c0-2.982 2.867-5.399 6.403-5.399.148 0 .295.006.44.015C15.75 3.995 12.543 2 8.691 2m-2.62 3.8a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8m5.239 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8M15.1 10.333c-3.178 0-5.757 2.14-5.757 4.778 0 2.637 2.579 4.778 5.757 4.778.679 0 1.33-.106 1.934-.297a.44.44 0 0 1 .4.079l.627.547a.428.428 0 0 0 .591-.02.42.42 0 0 0 .099-.38l-.208-1.127a.493.493 0 0 1 .07-.418c1.129-.916 1.844-2.268 1.844-3.838 0-2.637-2.579-4.778-5.358-4.778m-2.026 2.559a.74.74 0 1 1 0 1.481.74.74 0 0 1 0-1.48m4.05 0a.74.74 0 1 1 0 1.481.74.74 0 0 1 0-1.48" />
                </svg>
              </div>
              <span className="text-xs text-ink-500">微信</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 cursor-not-allowed opacity-60">
              <div className="w-11 h-11 rounded-full bg-red-500/90 flex items-center justify-center text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443M9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592m1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573m.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149m7.563-1.224c-.346-.105-.57-.18-.405-.649.375-1.061.42-1.972.003-2.6-.788-1.183-2.936-1.114-5.395-.034 0 0-.772.338-.574-.274.381-1.207.324-2.215-.27-2.8-1.346-1.326-4.927.051-8.001 3.069C1.09 9.86 0 12.102 0 14.074c0 3.773 4.952 6.039 9.731 6.039 6.301 0 10.444-3.611 10.444-6.467 0-1.732-1.458-2.714-2.116-2.997m2.01-6.38c-1.418-1.684-3.67-2.433-5.704-2.17-.527.068-.898.555-.83 1.084.068.529.556.9 1.084.83 1.542-.2 3.256.362 4.33 1.64 1.068 1.27 1.388 2.974.89 4.464-.119.355.068.742.424.862.355.12.742-.069.862-.425.627-1.888.228-3.994-1.056-6.285m-1.835 2.17c-.73-.865-1.888-1.258-2.933-1.123-.445.058-.759.465-.7.913.059.443.467.758.912.699.529-.07 1.109.129 1.476.562.368.433.477 1.024.297 1.568-.135.41.085.863.495.999.41.134.863-.086.998-.495.359-1.087.153-2.295-.554-3.123" />
                </svg>
              </div>
              <span className="text-xs text-ink-500">微博</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 cursor-not-allowed opacity-60">
              <div className="w-11 h-11 rounded-full bg-sky-500/90 flex items-center justify-center text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12.003 2c-5.52 0-10 4.48-10 10 0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10m4.088 7.274c.024.508.004 1.02-.058 1.53-.393 3.255-2.314 6.825-6.568 6.825-1.178 0-2.29-.351-3.191-.928.163.019.33.029.498.029.99 0 1.89-.338 2.605-.907-.924-.017-1.706-.628-1.972-1.468.129.025.262.039.397.039.192 0 .383-.025.562-.074-.968-.194-1.694-1.051-1.694-2.068v-.026c.285.158.612.254.958.265-.567-.379-.94-1.03-.94-1.767 0-.389.104-.752.286-1.066 1.045 1.282 2.609 2.124 4.39 2.213-.037-.158-.056-.322-.056-.491 0-1.185.961-2.146 2.146-2.146.618 0 1.175.26 1.567.675.491-.097.953-.276 1.371-.524-.161.504-.503.926-.948 1.193.437-.052.856-.168 1.246-.34-.289.432-.655.809-1.078 1.116" />
                </svg>
              </div>
              <span className="text-xs text-ink-500">QQ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
