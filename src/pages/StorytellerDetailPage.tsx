import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  BadgeCheck,
  ArrowLeft,
  BookOpen,
  Calendar,
  Phone,
  GraduationCap,
  UserCircle,
  Sparkles,
  FileText,
  History,
  Award,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StoryTimeline from '@/components/StoryTimeline';
import { useAppStore } from '@/store';
import { provinces } from '@/data/location';
import { cn } from '@/lib/utils';

function getLocationName(provinceId?: string, cityId?: string, districtId?: string): string {
  if (!provinceId) return '';
  const province = provinces.find((p) => p.id === provinceId);
  if (!province) return '';
  const parts = [province.name];
  if (cityId) {
    const city = province.cities.find((c) => c.id === cityId);
    if (city) {
      parts.push(city.name);
      if (districtId) {
        const district = city.districts.find((d) => d.id === districtId);
        if (district) parts.push(district.name);
      }
    }
  }
  return parts.join(' · ');
}

export default function StorytellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getStorytellerById = useAppStore((s) => s.getStorytellerById);
  const getStoriesByStorytellerId = useAppStore((s) => s.getStoriesByStorytellerId);
  const getApprovedStories = useAppStore((s) => s.getApprovedStories);

  const storyteller = id ? getStorytellerById(id) : undefined;

  const stories = useMemo(() => {
    if (!id) return [];
    return getStoriesByStorytellerId(id);
  }, [id, getStoriesByStorytellerId]);

  const approvedStories = useMemo(() => getApprovedStories(), [getApprovedStories]);

  const stats = useMemo(() => {
    const totalStories = stories.length;
    const estimatedWords = stories.reduce((sum, s) => {
      return sum + s.paragraphs.reduce((pSum, p) => pSum + p.content.length, 0);
    }, 0);
    let firstYear: number | null = null;
    if (stories.length > 0) {
      const years = stories.map((s) => {
        const date = s.recordingDate || s.submittedAt;
        return date ? new Date(date).getFullYear() : new Date().getFullYear();
      });
      firstYear = years.reduce((a, b) => Math.min(a, b), years[0]);
    }
    return { totalStories, estimatedWords, firstYear };
  }, [stories]);

  if (!storyteller) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center py-20">
          <div className="card max-w-lg w-full p-10 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cinnabar-50 opacity-60" />
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cinnabar-100 to-gold-100 border-4 border-white shadow-chinese flex items-center justify-center">
                  <User className="w-12 h-12 text-cinnabar-600" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="font-serif text-3xl font-bold text-ink-900 mb-3">
                讲述者未找到
              </h2>
              <p className="text-ink-500 mb-8 leading-relaxed">
                您访问的讲述者资料可能不存在，或已被移除。
              </p>
              <button
                onClick={() => navigate('/storytellers')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cinnabar-500 to-cinnabar-600 text-white font-medium hover:shadow-chinese-lg active:scale-[0.98] transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                返回讲述者列表
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const infoItems = [
    {
      icon: UserCircle,
      label: '性别',
      value:
        storyteller.gender === 'male'
          ? '男'
          : storyteller.gender === 'female'
          ? '女'
          : '其他',
    },
    {
      icon: Calendar,
      label: '年龄',
      value: `${storyteller.age} 岁`,
    },
    {
      icon: Award,
      label: '民族',
      value: storyteller.ethnicity || '—',
    },
    {
      icon: GraduationCap,
      label: '学历',
      value: storyteller.education || '—',
    },
    {
      icon: Briefcase,
      label: '职业',
      value: storyteller.occupation || '—',
    },
    {
      icon: TrendingUp,
      label: '从业年限',
      value: `${storyteller.yearsOfExperience} 年`,
    },
    {
      icon: MapPin,
      label: '所在地区',
      value:
        getLocationName(
          storyteller.provinceId,
          storyteller.cityId,
          storyteller.districtId
        ) || '—',
    },
    {
      icon: Phone,
      label: '联系方式',
      value: storyteller.contactPhone || '—',
      sensitive: true,
    },
  ];

  return (
    <Layout>
      <div className="mb-6 animate-scroll-reveal">
        <Link
          to="/storytellers"
          className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-cinnabar-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          返回讲述者列表
        </Link>
      </div>

      <section className="card p-6 md:p-10 relative overflow-hidden mb-10 animate-scroll-reveal">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-cinnabar-50 to-gold-50 opacity-70" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gold-50 opacity-60" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="shrink-0 text-center">
            <div className="relative inline-block">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-gold-400 p-1.5 bg-gradient-to-br from-gold-50 via-white to-rice-100 shadow-gold">
                {storyteller.avatar ? (
                  <img
                    src={storyteller.avatar}
                    alt={storyteller.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-rice-200 flex items-center justify-center text-ink-400">
                    <User className="w-20 h-20" strokeWidth={1} />
                  </div>
                )}
              </div>
              {storyteller.isVerified && (
                <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-white border-[3px] border-cinnabar-500 flex items-center justify-center shadow-md">
                  <BadgeCheck
                    className="w-9 h-9 text-cinnabar-600"
                    strokeWidth={2.5}
                  />
                </div>
              )}
            </div>
            {storyteller.isVerified && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cinnabar-50 border-2 border-cinnabar-300 text-cinnabar-700 text-sm font-bold">
                <BadgeCheck className="w-4 h-4" strokeWidth={2.5} />
                已认证民间故事讲述人
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink-900 mb-3 text-center md:text-left">
              {storyteller.name}
            </h1>
            {storyteller.occupation && (
              <p className="text-xl text-ink-500 mb-6 text-center md:text-left font-serif">
                {storyteller.occupation}
                {storyteller.ethnicity && <span className="mx-2">·</span>}
                {storyteller.ethnicity}
              </p>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {infoItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 md:p-4 rounded-xl bg-white/80 border border-rice-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cinnabar-50 to-gold-50 border border-cinnabar-100 flex items-center justify-center shrink-0">
                      <item.icon
                        className="w-[18px] h-[18px] text-cinnabar-600"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-ink-400 mb-0.5">{item.label}</p>
                      <p
                        className={cn(
                          'font-medium truncate',
                          item.sensitive ? 'text-ink-600' : 'text-ink-800'
                        )}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {storyteller.specialties.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-ink-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  擅长专长
                </p>
                <div className="flex flex-wrap gap-2">
                  {storyteller.specialties.map((sp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-50 to-rice-50 border border-gold-300 text-gold-800 text-sm font-bold shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-gold-600" />
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {storyteller.bio && (
              <div>
                <p className="text-sm text-ink-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cinnabar-500" />
                  个人简介
                </p>
                <div className="p-5 rounded-xl bg-rice-50/80 border-l-4 border-gold-300">
                  <p className="text-ink-700 leading-loose text-base">
                    {storyteller.bio}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-10 pt-8 border-t border-rice-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-cinnabar-50 to-white border border-cinnabar-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-cinnabar-500 mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div className="font-serif text-5xl font-bold text-cinnabar-600 mb-2">
                {stats.totalStories}
              </div>
              <p className="text-sm text-ink-500">采集故事总数</p>
              <p className="text-xs text-ink-400 mt-1">篇已审核发布</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-gold-50 to-white border border-gold-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gold-500 mx-auto mb-4">
                <FileText className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div className="font-serif text-5xl font-bold text-gold-600 mb-2">
                {stats.estimatedWords.toLocaleString('zh-CN')}
              </div>
              <p className="text-sm text-ink-500">总字数估算</p>
              <p className="text-xs text-ink-400 mt-1">字（约计）</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-jade-50 to-white border border-jade-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-jade-500 mx-auto mb-4">
                <History className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div className="font-serif text-5xl font-bold text-jade-600 mb-2">
                {stats.firstYear || '—'}
              </div>
              <p className="text-sm text-ink-500">首次采集年份</p>
              <p className="text-xs text-ink-400 mt-1">开始记录的故事</p>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-scroll-reveal" style={{ animationDelay: '100ms' }}>
        <div className="mb-6">
          <h2 className="section-title flex items-center gap-2">
            <span className="w-1 h-8 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
            讲述者的故事集
          </h2>
          <p className="section-subtitle">
            {storyteller.name} 老人讲述的所有已审核故事，按录制时间倒序排列
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen
              className="w-16 h-16 mx-auto mb-4 text-rice-300"
              strokeWidth={1}
            />
            <h3 className="font-serif text-xl font-bold text-ink-700 mb-2">
              暂无收录的故事
            </h3>
            <p className="text-ink-500">
              该讲述者的故事正在整理审核中，敬请期待
            </p>
          </div>
        ) : (
          <StoryTimeline stories={stories} />
        )}
      </section>
    </Layout>
  );
}
