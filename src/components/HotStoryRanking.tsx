import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, Heart, Bookmark, MessageCircle, Award } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-300 shadow-lg shadow-yellow-200/50';
    case 2:
      return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white border-slate-200 shadow-lg shadow-slate-200/50';
    case 3:
      return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-400 shadow-lg shadow-amber-200/50';
    default:
      return 'bg-rice-100 text-ink-500 border-rice-200';
  }
}

function getRankIcon(rank: number) {
  if (rank <= 3) {
    return <Award className="h-4 w-4" />;
  }
  return <span className="text-sm font-bold">{rank}</span>;
}

export default function HotStoryRanking() {
  const navigate = useNavigate();
  const { getHotStories, stories } = useAppStore();
  const hotStories = getHotStories(10);

  const handleStoryClick = (storyId: string) => {
    navigate(`/story/${storyId}`);
  };

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-cinnabar-500 to-gold-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cinnabar-600" />
              <h2 className="font-serif text-xl font-bold text-ink-900">
                热门故事榜
              </h2>
            </div>
          </div>
          <p className="text-xs text-ink-500">
            根据浏览、点赞、收藏、评论数据综合排名
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {hotStories.map((item) => {
          const { story, score, rank } = item;
          const storyInfo = stories.find((s) => s.id === story.id) || story;

          return (
            <div
              key={story.id}
              onClick={() => handleStoryClick(story.id)}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-rice-100/80 cursor-pointer transition-all duration-200 group"
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-bold transition-transform group-hover:scale-105',
                  getRankBadge(rank)
                )}
              >
                {getRankIcon(rank)}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStoryClick(story.id);
                  }}
                  className="font-serif font-bold text-ink-800 truncate hover:text-cinnabar-600 transition-colors cursor-pointer leading-snug"
                >
                  {storyInfo.title}
                </h3>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  <div className="flex items-center gap-1 text-xs text-ink-500">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{storyInfo.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-500">
                    <Heart className="h-3.5 w-3.5" />
                    <span>{storyInfo.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-500">
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{storyInfo.collectCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-500">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{storyInfo.commentCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-cinnabar-50 to-gold-50 text-cinnabar-700 border border-cinnabar-100">
                    热度
                  </span>
                  <span className="text-xs font-bold text-cinnabar-600 font-serif">
                    {score.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {hotStories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="mb-3 h-12 w-12 text-rice-300" />
            <p className="text-ink-400 text-sm">暂无热门故事数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
