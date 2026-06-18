import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Folder,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import { useAppStore } from '@/store';
import type { Story, StoryStatus } from '@/types';

const tabs: Array<{ key: 'all' | StoryStatus; label: string; icon: typeof FileText }> = [
  { key: 'all', label: '全部', icon: FileText },
  { key: 'pending', label: '待审核', icon: Clock },
  { key: 'approved', label: '已通过', icon: CheckCircle },
  { key: 'rejected', label: '已驳回', icon: XCircle },
];

const statusConfig: Record<StoryStatus, { label: string; bg: string; text: string; border: string; icon: typeof Clock }> = {
  pending: { label: '待审核', bg: 'bg-gold-50', text: 'text-gold-700', border: 'border-gold-200', icon: Clock },
  approved: { label: '已通过', bg: 'bg-jade-50', text: 'text-jade-700', border: 'border-jade-200', icon: CheckCircle },
  rejected: { label: '已驳回', bg: 'bg-cinnabar-50', text: 'text-cinnabar-700', border: 'border-cinnabar-200', icon: XCircle },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function StoryListCard({
  story,
  onEdit,
  onView,
}: {
  story: Story;
  onEdit: () => void;
  onView: () => void;
}) {
  const categories = useAppStore((s) => s.categories);
  const category = categories.find((c) => c.id === story.categoryId);
  const cfg = statusConfig[story.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-bold text-ink-900 mb-1 truncate">
            {story.title}
          </h3>
          {story.subtitle && (
            <p className="text-sm text-ink-500 truncate">{story.subtitle}</p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium',
            cfg.bg,
            cfg.text,
            cfg.border
          )}
        >
          <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
          {cfg.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-500 mb-3">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
          {formatDate(story.submittedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Folder className="w-3.5 h-3.5" strokeWidth={2} />
          {category?.name || '未分类'}
        </span>
      </div>

      {story.status === 'rejected' && story.reviewComment && (
        <div className="mb-4 p-3 rounded-xl bg-cinnabar-50 border border-cinnabar-200">
          <p className="text-xs font-semibold text-cinnabar-700 mb-1">驳回原因：</p>
          <p className="text-sm text-cinnabar-800 leading-relaxed">
            {story.reviewComment}
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-rice-100">
        {story.status === 'pending' && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-50 border border-gold-200 text-gold-700 text-sm font-medium hover:bg-gold-100 transition-all duration-200"
          >
            <Edit className="w-4 h-4" strokeWidth={2} />
            编辑
          </button>
        )}
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-jade-50 border border-jade-200 text-jade-700 text-sm font-medium hover:bg-jade-100 transition-all duration-200"
        >
          <Eye className="w-4 h-4" strokeWidth={2} />
          查看详情
        </button>
      </div>
    </div>
  );
}

function MyStoriesContent() {
  const navigate = useNavigate();
  const { currentUser, getStoriesByCollectorId } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | StoryStatus>('all');

  const allStories = useMemo(
    () => (currentUser ? getStoriesByCollectorId(currentUser.id) : []),
    [currentUser, getStoriesByCollectorId]
  );

  const stats = useMemo(() => {
    return {
      all: allStories.length,
      pending: allStories.filter((s) => s.status === 'pending').length,
      approved: allStories.filter((s) => s.status === 'approved').length,
      rejected: allStories.filter((s) => s.status === 'rejected').length,
    };
  }, [allStories]);

  const filteredStories = useMemo(() => {
    if (activeTab === 'all') return allStories;
    return allStories.filter((s) => s.status === activeTab);
  }, [allStories, activeTab]);

  const statCards = [
    { label: '我提交的故事', value: stats.all, color: 'from-cinnabar-500 to-cinnabar-600', icon: FileText },
    { label: '待审核', value: stats.pending, color: 'from-gold-500 to-gold-600', icon: Clock },
    { label: '已通过', value: stats.approved, color: 'from-jade-500 to-jade-600', icon: CheckCircle },
    { label: '已驳回', value: stats.rejected, color: 'from-ink-500 to-ink-600', icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">我的提交</h1>
        <p className="section-subtitle">查看和管理您贡献的所有口述历史故事</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="card p-5 relative overflow-hidden group"
            >
              <div
                className={cn(
                  'absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300',
                  `bg-gradient-to-br ${card.color}`
                )}
                style={{ transform: 'translate(40%, -40%)' }}
              />
              <div className="relative">
                <div
                  className={cn(
                    'inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3',
                    `bg-gradient-to-br ${card.color}`,
                    'text-white shadow-md'
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <p className="font-serif text-3xl font-bold text-ink-900 mb-1">
                  {card.value}
                </p>
                <p className="text-sm text-ink-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = stats[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-cinnabar-500 text-white shadow-md'
                    : 'text-ink-600 hover:bg-rice-100'
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {tab.label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-rice-200 text-ink-600'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredStories.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-rice-300" strokeWidth={1.5} />
          <p className="text-ink-500 mb-2">暂无故事数据</p>
          <p className="text-sm text-ink-400">切换标签页查看其他状态的故事</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredStories.map((story) => (
            <StoryListCard
              key={story.id}
              story={story}
              onEdit={() => navigate(`/stories/${story.id}/edit`)}
              onView={() => navigate(`/stories/${story.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyStoriesPage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['contributor', 'admin']}>
        <MyStoriesContent />
      </RoleGate>
    </Layout>
  );
}
