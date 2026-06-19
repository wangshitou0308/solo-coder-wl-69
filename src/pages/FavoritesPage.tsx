import { useState, useMemo } from 'react';
import { Bookmark, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import StoryCard from '@/components/StoryCard';
import Empty from '@/components/Empty';
import { useAppStore } from '@/store';

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function FavoritesContent() {
  const { currentUser, getCollectedStories, getBrowseHistories } = useAppStore();
  const [activeTab, setActiveTab] = useState<'collected' | 'history'>('collected');

  const collectedList = useMemo(
    () => (currentUser ? getCollectedStories(currentUser.id) : []),
    [currentUser, getCollectedStories]
  );

  const historyList = useMemo(
    () => (currentUser ? getBrowseHistories(currentUser.id).slice(0, 30) : []),
    [currentUser, getBrowseHistories]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">我的收藏 & 浏览历史</h1>
        <p className="section-subtitle">查看您收藏的故事和最近浏览记录</p>
      </div>

      <div className="card p-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin p-2">
          <button
            onClick={() => setActiveTab('collected')}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === 'collected'
                ? 'bg-cinnabar-500 text-white shadow-md'
                : 'text-ink-600 hover:bg-rice-100'
            )}
          >
            <Bookmark className="w-4 h-4" strokeWidth={2} />
            我的收藏
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold',
                activeTab === 'collected' ? 'bg-white/20 text-white' : 'bg-rice-200 text-ink-600'
              )}
            >
              {collectedList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === 'history'
                ? 'bg-cinnabar-500 text-white shadow-md'
                : 'text-ink-600 hover:bg-rice-100'
            )}
          >
            <Clock className="w-4 h-4" strokeWidth={2} />
            浏览历史
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold',
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-rice-200 text-ink-600'
              )}
            >
              {historyList.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'collected' && (
        <>
          {collectedList.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {collectedList.map(({ interaction, story }) => (
                <div key={interaction.id} className="space-y-2">
                  <StoryCard story={story} />
                  <div className="flex items-center gap-1.5 text-xs text-ink-500 px-1">
                    <Bookmark className="w-3.5 h-3.5 text-gold-600" strokeWidth={2} />
                    收藏于 {formatDateTime(interaction.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {historyList.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {historyList.map(({ history, story }) => (
                <div key={history.id} className="space-y-2">
                  <StoryCard story={story} />
                  <div className="flex items-center gap-1.5 text-xs text-ink-500 px-1">
                    <Clock className="w-3.5 h-3.5 text-ink-500" strokeWidth={2} />
                    浏览于 {formatDateTime(history.viewedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['visitor', 'contributor', 'admin']}>
        <FavoritesContent />
      </RoleGate>
    </Layout>
  );
}
