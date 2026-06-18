import { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  XCircle,
  User,
  Clock,
  AlertCircle,
  Send,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import AudioPlayer from '@/components/AudioPlayer';
import { useAppStore } from '@/store';
import type { Story } from '@/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function RejectModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative card w-full max-w-lg p-6 animate-scroll-reveal">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cinnabar-100 border border-cinnabar-200">
              <XCircle className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-900">驳回故事</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-rice-100 transition-colors"
          >
            <X className="w-5 h-5 text-ink-500" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-5 p-4 rounded-xl bg-cinnabar-50 border border-cinnabar-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-cinnabar-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="text-sm font-semibold text-cinnabar-800">请填写驳回原因</p>
              <p className="text-xs text-cinnabar-600 mt-1">
                详细的修改建议将帮助贡献者改进内容质量
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="label-base">修改原因 <span className="text-cinnabar-500">*</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请详细说明需要修改的内容，例如：故事内容需补充采访背景、标签分类不准确、方言注释缺失等..."
            className="input-base min-h-[140px] resize-y"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-ink-400">
            <span>建议不少于10个字</span>
            <span>{reason.length} 字</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="btn-primary"
            style={{
              background: reason.trim()
                ? 'linear-gradient(135deg, #C8102E 0%, #890c22 100%)'
                : undefined,
            }}
          >
            <Send className="w-4 h-4" strokeWidth={2} />
            确认驳回
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewDashboardContent() {
  const {
    stories,
    storytellers,
    users,
    getPendingStories,
    getApprovedStories,
    updateStoryStatus,
    reviewRecords,
  } = useAppStore();

  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const pendingStories = useMemo(() => getPendingStories(), [getPendingStories]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReviewCount = useMemo(() => {
    return reviewRecords.filter((r) => r.reviewedAt.slice(0, 10) === todayStr).length;
  }, [reviewRecords]);

  const approvedCount = useMemo(() => getApprovedStories().length, [getApprovedStories]);
  const reviewedTotal = useMemo(
    () => approvedCount + stories.filter((s) => s.status === 'rejected').length,
    [approvedCount, stories]
  );
  const passRate = reviewedTotal > 0
    ? Math.round((approvedCount / reviewedTotal) * 100)
    : 0;

  const statCards = [
    {
      label: '待审核故事',
      value: pendingStories.length,
      icon: ClipboardCheck,
      color: 'from-gold-500 to-gold-600',
      bgIcon: 'bg-gold-50',
      textIcon: 'text-gold-600',
    },
    {
      label: '今日审核数',
      value: todayReviewCount,
      icon: CalendarDays,
      color: 'from-cinnabar-500 to-cinnabar-600',
      bgIcon: 'bg-cinnabar-50',
      textIcon: 'text-cinnabar-600',
    },
    {
      label: '审核通过率',
      value: `${passRate}%`,
      icon: TrendingUp,
      color: 'from-jade-500 to-jade-600',
      bgIcon: 'bg-jade-50',
      textIcon: 'text-jade-600',
    },
  ];

  const selectedStory = useMemo(
    () => stories.find((s) => s.id === selectedStoryId) || null,
    [stories, selectedStoryId]
  );

  const selectedStoryteller = useMemo(() => {
    if (!selectedStory) return null;
    return storytellers.find((st) => st.id === selectedStory.storytellerId);
  }, [selectedStory, storytellers]);

  const selectedCollector = useMemo(() => {
    if (!selectedStory) return null;
    return users.find((u) => u.id === selectedStory.collectorId);
  }, [selectedStory, users]);

  const audioParagraphs = useMemo(() => {
    if (!selectedStory) return [];
    return selectedStory.paragraphs.map((p) => ({
      id: p.id,
      order: p.order,
      content: p.content,
    }));
  }, [selectedStory]);

  const handleApprove = () => {
    if (!selectedStoryId) return;
    updateStoryStatus(selectedStoryId, 'approved');
    setSelectedStoryId(null);
  };

  const handleReject = (reason: string) => {
    if (!selectedStoryId) return;
    updateStoryStatus(selectedStoryId, 'rejected', undefined, reason);
    setRejectModalOpen(false);
    setSelectedStoryId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">审核后台</h1>
        <p className="section-subtitle">审核用户提交的口述历史故事内容</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card p-6 relative overflow-hidden group">
              <div
                className={cn(
                  'absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300',
                  `bg-gradient-to-br ${card.color}`
                )}
                style={{ transform: 'translate(40%, -40%)' }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <div
                    className={cn(
                      'inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4',
                      card.bgIcon,
                      'border border-rice-200'
                    )}
                  >
                    <Icon className={cn('w-5.5 h-5.5', card.textIcon)} strokeWidth={2} />
                  </div>
                  <p className="text-sm text-ink-500 mb-1">{card.label}</p>
                  <p className="font-serif text-4xl font-bold text-ink-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-ink-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-cinnabar-500 rounded-full" />
                待审核列表
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                {pendingStories.length} 条
              </span>
            </div>

            {pendingStories.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-14 h-14 mx-auto mb-3 text-jade-300" strokeWidth={1.5} />
                <p className="text-ink-500">暂无待审核内容</p>
                <p className="text-xs text-ink-400 mt-1">您已完成所有审核任务</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto scrollbar-thin pr-2">
                {pendingStories.map((story) => {
                  const storyteller = storytellers.find((st) => st.id === story.storytellerId);
                  const collector = users.find((u) => u.id === story.collectorId);
                  const isSelected = story.id === selectedStoryId;
                  return (
                    <button
                      key={story.id}
                      onClick={() => setSelectedStoryId(story.id)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border transition-all duration-200',
                        isSelected
                          ? 'bg-cinnabar-50 border-cinnabar-300 shadow-md'
                          : 'bg-white border-rice-200 hover:border-cinnabar-200 hover:bg-cinnabar-50/30'
                      )}
                    >
                      <h3 className="font-serif text-base font-bold text-ink-900 mb-2 line-clamp-1">
                        {story.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500 mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={2} />
                          {formatDate(story.submittedAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3" strokeWidth={2} />
                          {collector?.username || '未知用户'}
                        </span>
                      </div>
                      <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                        {story.summary}
                      </p>
                      {storyteller && (
                        <div className="mt-3 pt-3 border-t border-rice-100 flex items-center gap-2">
                          <img
                            src={storyteller.avatar}
                            alt={storyteller.name}
                            className="w-6 h-6 rounded-full border border-rice-200"
                          />
                          <span className="text-xs text-ink-500">讲述者：{storyteller.name}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {!selectedStory ? (
            <div className="card p-12 h-full flex flex-col items-center justify-center min-h-[600px]">
              <div className="w-24 h-24 rounded-full bg-rice-50 border-4 border-dashed border-rice-300 flex items-center justify-center mb-5">
                <ClipboardCheck className="w-12 h-12 text-rice-300" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl font-bold text-ink-700 mb-2">
                选择待审核故事
              </h3>
              <p className="text-sm text-ink-400 text-center max-w-sm">
                请从左侧列表选择一条待审核的故事，右侧将显示完整内容供您审核
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="card p-6">
                <div className="mb-4 pb-4 border-b border-rice-100">
                  <h2 className="font-serif text-2xl font-bold text-ink-900 mb-2">
                    {selectedStory.title}
                  </h2>
                  {selectedStory.subtitle && (
                    <p className="text-ink-500">{selectedStory.subtitle}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="p-4 rounded-xl bg-rice-50 border border-rice-100">
                    <p className="text-xs text-ink-400 mb-1">贡献者</p>
                    <p className="text-sm font-medium text-ink-800">
                      {selectedCollector?.username || '未知'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-rice-50 border border-rice-100">
                    <p className="text-xs text-ink-400 mb-1">提交时间</p>
                    <p className="text-sm font-medium text-ink-800">
                      {formatDate(selectedStory.submittedAt)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-rice-50 border border-rice-100">
                    <p className="text-xs text-ink-400 mb-1">讲述者</p>
                    <p className="text-sm font-medium text-ink-800">
                      {selectedStoryteller?.name || '未知'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-rice-50 border border-rice-100">
                    <p className="text-xs text-ink-400 mb-1">采集日期</p>
                    <p className="text-sm font-medium text-ink-800">
                      {selectedStory.recordingDate || '-'}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-ink-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-cinnabar-500 rounded-full" />
                    故事摘要
                  </h4>
                  <p className="text-sm text-ink-700 leading-relaxed bg-rice-50/50 p-4 rounded-xl border border-rice-100">
                    {selectedStory.summary}
                  </p>
                </div>

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-ink-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-cinnabar-500 rounded-full" />
                    完整故事内容
                  </h4>
                  <div className="space-y-3 p-4 rounded-xl bg-rice-50/50 border border-rice-100 max-h-[260px] overflow-y-auto scrollbar-thin">
                    {selectedStory.paragraphs
                      .sort((a, b) => a.order - b.order)
                      .map((para, idx) => (
                        <div key={para.id} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-cinnabar-100 text-cinnabar-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-ink-700 leading-relaxed">
                            {para.content}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {selectedStory.dialectNotes.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-ink-700 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gold-500 rounded-full" />
                      方言注释 ({selectedStory.dialectNotes.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedStory.dialectNotes.slice(0, 6).map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-lg bg-gold-50 border border-gold-100"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-cinnabar-700">{note.word}</span>
                            {note.pronunciation && (
                              <span className="text-xs text-ink-500 font-mono">
                                [{note.pronunciation}]
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-600">{note.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <AudioPlayer paragraphs={audioParagraphs} />

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-ink-800">审核操作</h4>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleApprove}
                    className="btn-primary flex-1 justify-center"
                  >
                    <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                    通过审核
                  </button>
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    className="btn-secondary flex-1 justify-center"
                    style={{
                      borderColor: '#C8102E',
                      color: '#C8102E',
                    }}
                  >
                    <XCircle className="w-5 h-5" strokeWidth={2} />
                    驳回
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <RejectModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
}

export default function ReviewDashboardPage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['admin']}>
        <ReviewDashboardContent />
      </RoleGate>
    </Layout>
  );
}
