import { useMemo } from 'react';
import {
  BookOpen,
  Users,
  Map,
  Crown,
  Medal,
  Trophy,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import { useAppStore } from '@/store';
import type { Province } from '@/data/location';
import { provinces } from '@/data/location';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

function getProvinceName(id?: string) {
  if (!id) return '未知';
  const p = provinces.find((x: Province) => x.id === id);
  return p?.name || id;
}

function useCountUp(target: number, duration = 1500, delay = 0): number {
  const { useState, useEffect } = require('react');
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let rafId: number;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp + delay;
      if (timestamp < startTime) { rafId = requestAnimationFrame(step); return; }
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, delay]);
  return count;
}

function KPICard({
  label,
  value,
  icon: Icon,
  delay,
  gradient,
}: {
  label: string;
  value: number;
  icon: any;
  delay: number;
  gradient: string;
}) {
  const display = useCountUp(value, 1800, delay);
  return (
    <div className="card p-6 relative overflow-hidden group">
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity',
          gradient
        )}
        style={{ transform: 'translate(40%, -40%)' }}
      />
      <div className="relative">
        <div
          className={cn(
            'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-white shadow-md',
            gradient
          )}
        >
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
        <p className="font-serif text-4xl md:text-5xl font-bold text-ink-900 mb-1 tabular-nums">
          {display.toLocaleString('zh-CN')}
        </p>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5" style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.6) 50%, transparent 100%)'
      }} />
    </div>
  );
}

const PIE_COLORS = [
  '#C8102E',
  '#B8860B',
  '#3A7D44',
  '#4A6FA5',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
];

function getMedalIcon(rank: number) {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5" strokeWidth={2} />;
    case 2: return <Medal className="w-5 h-5" strokeWidth={2} />;
    case 3: return <Trophy className="w-5 h-5" strokeWidth={2} />;
    default: return null;
  }
}

function getMedalColor(rank: number) {
  switch (rank) {
    case 1: return 'text-yellow-600';
    case 2: return 'text-slate-500';
    case 3: return 'text-amber-700';
    default: return 'text-ink-400';
  }
}

function getMedalBg(rank: number) {
  switch (rank) {
    case 1: return 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300';
    case 2: return 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300';
    case 3: return 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300';
    default: return 'bg-rice-100 border-rice-200';
  }
}

function getRowHighlight(rank: number) {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-yellow-50/80 to-transparent hover:from-yellow-100/80';
    case 2: return 'bg-gradient-to-r from-slate-50/80 to-transparent hover:from-slate-100/80';
    case 3: return 'bg-gradient-to-r from-amber-50/80 to-transparent hover:from-amber-100/80';
    default: return 'hover:bg-rice-100/60';
  }
}

function StatisticsContent() {
  const {
    stories,
    storytellers,
    users,
    getApprovedStories,
    getCategoryStats,
    getYearlyTrend,
    getProvinceStats,
    getContributorRanking,
  } = useAppStore();

  const approvedCount = useMemo(() => getApprovedStories().length, [getApprovedStories]);
  const categoryStats = useMemo(() => getCategoryStats().filter((s) => s.value > 0), [getCategoryStats]);
  const yearlyTrend = useMemo(() => getYearlyTrend(), [getYearlyTrend]);
  const provinceStatsRaw = useMemo(() => getProvinceStats(), [getProvinceStats]);
  const ranking = useMemo(() => getContributorRanking().slice(0, 20), [getContributorRanking]);

  const provinceCount = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => { if (s.status === 'approved' && s.provinceId) set.add(s.provinceId); });
    return set.size;
  }, [stories]);

  const provinceStats = useMemo(() =>
    provinceStatsRaw.map((s) => ({ name: getProvinceName(s.name), count: s.count })),
    [provinceStatsRaw]
  );

  const rankingMaxCount = ranking.length > 0 ? ranking[0].count : 0;

  const kpiData = [
    { label: '已收录故事', value: approvedCount, icon: BookOpen, gradient: 'bg-gradient-to-br from-cinnabar-500 to-cinnabar-600' },
    { label: '讲述者数量', value: storytellers.length, icon: Users, gradient: 'bg-gradient-to-br from-jade-500 to-jade-600' },
    { label: '覆盖省份', value: provinceCount, icon: Map, gradient: 'bg-gradient-to-br from-gold-500 to-gold-600' },
    { label: '贡献者人数', value: users.filter((u) => u.role !== 'visitor').length, icon: Globe, gradient: 'bg-gradient-to-br from-ink-600 to-ink-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">统计看板</h1>
        <p className="section-subtitle mb-0">口述历史档案库的数据统计与可视化分析</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {kpiData.map((k, i) => (
          <KPICard key={i} {...k} delay={i * 200} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cinnabar-100 border border-cinnabar-200">
              <PieChartIcon className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-900">分类故事数占比</h2>
              <p className="text-xs text-ink-500">按内容分类统计已审核故事</p>
            </div>
          </div>
          <div className="h-80">
            {categoryStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-ink-400">暂无数据</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryStats.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #ebe0c4',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      fontSize: '13px',
                    }}
                    formatter={(v: number, n: string) => [`${v} 篇`, n]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-100 border border-gold-200">
              <TrendingUp className="w-5 h-5 text-gold-700" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-900">年度收录趋势</h2>
              <p className="text-xs text-ink-500">按采集年度统计故事收录数量</p>
            </div>
          </div>
          <div className="h-80">
            {yearlyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-ink-400">暂无数据</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C8102E" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#C8102E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ebe0c4" vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke="#6d6d6d"
                    fontSize={13}
                    tickLine={false}
                    axisLine={{ stroke: '#ebe0c4' }}
                  />
                  <YAxis
                    stroke="#6d6d6d"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #ebe0c4',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      fontSize: '13px',
                    }}
                    formatter={(v: number) => [`${v} 篇`, '收录数量']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#C8102E"
                    strokeWidth={3.5}
                    dot={{ r: 5, fill: '#fff', stroke: '#C8102E', strokeWidth: 2.5 }}
                    activeDot={{ r: 7, stroke: '#C8102E', strokeWidth: 3, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-jade-100 border border-jade-200">
            <BarChart3 className="w-5 h-5 text-jade-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-ink-900">各省份故事数量排名</h2>
            <p className="text-xs text-ink-500">按已审核故事数量排序的省级行政区分布</p>
          </div>
        </div>
        <div className="h-[420px]">
          {provinceStats.length === 0 ? (
            <div className="h-full flex items-center justify-center text-ink-400">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={provinceStats}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe0c4" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#6d6d6d"
                  fontSize={13}
                  tickLine={false}
                  axisLine={{ stroke: '#ebe0c4' }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6d6d6d"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #ebe0c4',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    fontSize: '13px',
                  }}
                  formatter={(v: number) => [`${v} 篇`, '故事数量']}
                />
                <Bar
                  dataKey="count"
                  fill="#3A7D44"
                  radius={[0, 8, 8, 0]}
                  barSize={22}
                >
                  {provinceStats.map((_, idx) => (
                    <Cell
                      key={`bar-${idx}`}
                      fill={`rgba(58, 125, 68, ${0.5 + 0.5 * (1 - idx / provinceStats.length)})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-rice-200 bg-gradient-to-r from-rice-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cinnabar-100 to-gold-100 border border-cinnabar-200">
              <Crown className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-900">贡献者排行榜</h2>
              <p className="text-xs text-ink-500">统计已审核通过故事数量的前 20 名贡献者</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cinnabar-50 border border-cinnabar-200 text-cinnabar-700 text-xs font-bold">
            <Crown className="w-3.5 h-3.5" strokeWidth={2} />
            TOP 20
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-rice-50/60 border-b border-rice-200">
                <th className="px-6 py-3.5 text-left text-sm font-semibold text-ink-700 w-24">排名</th>
                <th className="px-6 py-3.5 text-left text-sm font-semibold text-ink-700">贡献者</th>
                <th className="px-6 py-3.5 text-right text-sm font-semibold text-ink-700 w-40">故事数量</th>
                <th className="px-6 py-3.5 text-left text-sm font-semibold text-ink-700 pr-12">贡献占比</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <Crown className="w-12 h-12 mx-auto mb-3 text-rice-300" strokeWidth={1.5} />
                    <p className="text-ink-500">暂无贡献数据</p>
                  </td>
                </tr>
              ) : (
                ranking.map((item, idx) => {
                  const rank = idx + 1;
                  const isTopThree = rank <= 3;
                  const percent = rankingMaxCount > 0 ? (item.count / rankingMaxCount) * 100 : 0;
                  return (
                    <tr
                      key={item.userId}
                      className={cn(
                        'border-b border-rice-100 transition-colors',
                        getRowHighlight(rank)
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold transition-transform',
                              isTopThree ? getMedalBg(rank) : 'bg-rice-100 border-rice-300',
                              isTopThree ? getMedalColor(rank) : 'text-ink-600'
                            )}
                          >
                            {isTopThree ? (
                              <div className={getMedalColor(rank)}>{getMedalIcon(rank)}</div>
                            ) : (
                              <span className="text-sm">{rank}</span>
                            )}
                          </div>
                          {isTopThree && rank === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-bold">
                              🏆 第一
                            </span>
                          )}
                          {isTopThree && rank === 2 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold">
                              🥈 第二
                            </span>
                          )}
                          {isTopThree && rank === 3 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold">
                              🥉 第三
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p
                            className={cn(
                              'font-semibold',
                              rank === 1 && 'text-yellow-700 text-lg',
                              rank === 2 && 'text-slate-600',
                              rank === 3 && 'text-amber-700',
                              !isTopThree && 'text-ink-800'
                            )}
                          >
                            {item.username}
                          </p>
                          {rank === 1 && (
                            <p className="text-xs text-yellow-600 mt-0.5">文化传承先锋 · 感谢您的卓越贡献</p>
                          )}
                          {rank === 2 && (
                            <p className="text-xs text-slate-500 mt-0.5">故事采集达人 · 持续贡献优秀内容</p>
                          )}
                          {rank === 3 && (
                            <p className="text-xs text-amber-600 mt-0.5">民间文化守护者 · 坚守传承一线</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            'inline-flex items-baseline gap-1 font-serif font-bold',
                            rank === 1 && 'text-yellow-600',
                            rank === 2 && 'text-slate-500',
                            rank === 3 && 'text-amber-600',
                            !isTopThree && 'text-cinnabar-600'
                          )}
                        >
                          <span className={isTopThree ? 'text-3xl' : 'text-2xl'}>{item.count}</span>
                          <span className="text-xs font-normal text-ink-500">篇</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 pr-12">
                        <div className="h-3 w-full bg-rice-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-1000 ease-out',
                              rank === 1 && 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-gold-500',
                              rank === 2 && 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500',
                              rank === 3 && 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600',
                              !isTopThree && 'bg-gradient-to-r from-cinnabar-400 to-cinnabar-600'
                            )}
                            style={{
                              width: `${percent}%`,
                              transitionDelay: `${rank * 40 + 300}ms`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-rice-100 bg-rice-50/50 flex items-center justify-between text-xs text-ink-500">
          <span>统计周期：自项目启动至今</span>
          <span>共 {ranking.length} 位贡献者上榜</span>
        </div>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['admin']}>
        <StatisticsContent />
      </RoleGate>
    </Layout>
  );
}
