import { Medal, Trophy, Crown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContributorRankingItem {
  userId: string;
  username: string;
  count: number;
}

interface ContributorRankingProps {
  ranking: ContributorRankingItem[];
}

function getMedalIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5" />;
    case 2:
      return <Medal className="h-5 w-5" />;
    case 3:
      return <Trophy className="h-5 w-5" />;
    default:
      return null;
  }
}

function getMedalColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-slate-400';
    case 3:
      return 'text-amber-700';
    default:
      return 'text-ink-400';
  }
}

function getMedalBg(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300';
    case 2:
      return 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300';
    case 3:
      return 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300';
    default:
      return 'bg-rice-100 border-rice-200';
  }
}

function getRowHighlight(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-50/80 to-transparent hover:from-yellow-100/80';
    case 2:
      return 'bg-gradient-to-r from-slate-50/80 to-transparent hover:from-slate-100/80';
    case 3:
      return 'bg-gradient-to-r from-amber-50/80 to-transparent hover:from-amber-100/80';
    default:
      return 'hover:bg-rice-100/60';
  }
}

function RankingRow({
  item,
  rank,
  maxCount,
}: {
  item: ContributorRankingItem;
  rank: number;
  maxCount: number;
}) {
  const progress = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
  const isTopThree = rank <= 3;
  const medalColor = getMedalColor(rank);
  const medalBg = getMedalBg(rank);

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-lg p-3 transition-all duration-300',
        getRowHighlight(rank),
        isTopThree && 'animate-scroll-reveal'
      )}
      style={{ animationDelay: `${rank * 60}ms` }}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold transition-transform group-hover:scale-110',
          isTopThree ? medalBg : 'bg-rice-100 border-rice-300',
          isTopThree ? medalColor : 'text-ink-600'
        )}
      >
        {isTopThree ? (
          <div className={medalColor}>{getMedalIcon(rank)}</div>
        ) : (
          <span className="text-sm">{rank}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate font-medium',
                isTopThree ? 'text-lg' : 'text-base',
                rank === 1 && 'text-yellow-700',
                rank === 2 && 'text-slate-600',
                rank === 3 && 'text-amber-700',
                !isTopThree && 'text-ink-800'
              )}
            >
              {item.username}
            </p>
            {rank === 1 && (
              <p className="mt-0.5 text-xs text-yellow-600">
                🏆 文化传承先锋
              </p>
            )}
            {rank === 2 && (
              <p className="mt-0.5 text-xs text-slate-500">
                🥈 故事采集达人
              </p>
            )}
            {rank === 3 && (
              <p className="mt-0.5 text-xs text-amber-600">
                🥉 民间文化守护者
              </p>
            )}
          </div>

          <div
            className={cn(
              'flex shrink-0 items-baseline gap-1 font-serif font-bold',
              rank === 1 && 'text-yellow-600',
              rank === 2 && 'text-slate-500',
              rank === 3 && 'text-amber-600',
              !isTopThree && 'text-cinnabar-600'
            )}
          >
            <span className={isTopThree ? 'text-2xl' : 'text-xl'}>
              {item.count}
            </span>
            <span className="text-xs font-normal text-ink-500">篇</span>
          </div>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-rice-200">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out',
              rank === 1 &&
                'bg-gradient-to-r from-yellow-400 via-yellow-500 to-gold-500',
              rank === 2 &&
                'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500',
              rank === 3 &&
                'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600',
              !isTopThree &&
                'bg-gradient-to-r from-cinnabar-400 to-cinnabar-600'
            )}
            style={{
              width: `${progress}%`,
              transitionDelay: `${rank * 60 + 200}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ContributorRanking({ ranking }: ContributorRankingProps) {
  const displayRanking = ranking.slice(0, 10);
  const maxCount = displayRanking.length > 0 ? displayRanking[0].count : 0;

  const topThree = displayRanking.slice(0, 3);
  const theRest = displayRanking.slice(3);

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-rice-200 bg-rice-50',
        'bg-paper-texture shadow-chinese'
      )}
    >
      <div className="flex items-center justify-between border-b border-rice-200 p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cinnabar-100 to-gold-100 border border-cinnabar-200">
            <TrendingUp className="h-5 w-5 text-cinnabar-600" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-ink-900 md:text-2xl">
              贡献排行榜
            </h2>
            <p className="text-xs text-ink-500">
              感谢每一位为民间文化传承贡献力量的采集者
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-cinnabar-50 px-3 py-1 text-xs font-medium text-cinnabar-700 border border-cinnabar-200 md:flex">
          <Crown className="h-3.5 w-3.5" />
          <span>TOP 10</span>
        </div>
      </div>

      {displayRanking.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Medal className="mb-3 h-12 w-12 text-rice-300" />
          <p className="text-ink-400">暂无贡献数据</p>
        </div>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="border-b border-rice-200 bg-gradient-to-b from-rice-100/50 to-transparent p-4">
              <div className="grid grid-cols-1 gap-3">
                {topThree.map((item, idx) => (
                  <RankingRow
                    key={item.userId}
                    item={item}
                    rank={idx + 1}
                    maxCount={maxCount}
                  />
                ))}
              </div>
            </div>
          )}

          {theRest.length > 0 && (
            <div className="p-4 pt-3">
              <div className="space-y-1">
                {theRest.map((item, idx) => (
                  <RankingRow
                    key={item.userId}
                    item={item}
                    rank={idx + 4}
                    maxCount={maxCount}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="border-t border-rice-200 bg-rice-50/60 px-5 py-3">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>统计已审核通过的故事数量</span>
          <span>
            共 {displayRanking.length} 位贡献者
          </span>
        </div>
      </div>
    </section>
  );
}
