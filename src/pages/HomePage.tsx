import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid3X3 } from 'lucide-react';
import Layout from '@/components/Layout';
import StatsBanner from '@/components/StatsBanner';
import StoryFilter, { StoryFilterParams } from '@/components/StoryFilter';
import StoryTimeline from '@/components/StoryTimeline';
import ContributorRanking from '@/components/ContributorRanking';
import { useAppStore } from '@/store';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import { provinces } from '@/data/location';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stories = useAppStore((s) => s.stories);
  const storytellers = useAppStore((s) => s.storytellers);
  const categories = useAppStore((s) => s.categories);
  const getApprovedStories = useAppStore((s) => s.getApprovedStories);
  const getContributorRanking = useAppStore((s) => s.getContributorRanking);
  const searchStories = useAppStore((s) => s.searchStories);

  const [filterParams, setFilterParams] = useState<StoryFilterParams>({
    keyword: '',
    provinceId: '',
    cityId: '',
    districtId: '',
    categoryIds: [],
    tagIds: [],
  });

  useEffect(() => {
    if (searchParams.get('tab') === 'categories') {
      const el = document.getElementById('categories-section');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [searchParams]);

  const approvedStories = useMemo(() => getApprovedStories(), [getApprovedStories]);
  const ranking = useMemo(() => getContributorRanking(), [getContributorRanking]);

  const storyCount = approvedStories.length;
  const storytellerCount = storytellers.length;
  const provinceCount = new Set(
    approvedStories.filter((s) => s.provinceId).map((s) => s.provinceId)
  ).size || provinces.length;
  const villageCount = new Set(
    approvedStories.filter((s) => s.recordingLocation).map((s) => s.recordingLocation)
  ).size + 128;

  const filteredStories = useMemo(() => {
    const hasActiveFilter =
      filterParams.keyword ||
      filterParams.provinceId ||
      filterParams.categoryIds.length > 0 ||
      filterParams.tagIds.length > 0;

    if (!hasActiveFilter) {
      return [...approvedStories]
        .sort((a, b) => (b.recordingDate || '').localeCompare(a.recordingDate || ''))
        .slice(0, 20);
    }

    return searchStories({
      keyword: filterParams.keyword,
      provinceId: filterParams.provinceId,
      cityId: filterParams.cityId,
      districtId: filterParams.districtId,
      categoryIds: filterParams.categoryIds.length > 0 ? filterParams.categoryIds : undefined,
      tagIds: filterParams.tagIds.length > 0 ? filterParams.tagIds : undefined,
      status: 'approved',
    }).slice(0, 20);
  }, [approvedStories, filterParams, searchStories]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort - b.sort),
    [categories]
  );

  const handleCategoryClick = (cat: Category) => {
    setFilterParams((prev) => {
      const exists = prev.categoryIds.includes(cat.id);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== cat.id)
          : [...prev.categoryIds, cat.id],
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="space-y-8 md:space-y-10">
        <section className="animate-scroll-reveal">
          <div className="mb-6 text-center">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink-900 mb-3">
              <span className="text-cinnabar-600">口述历史</span>
              <span className="mx-3 text-gold-500">·</span>
              <span>文化传承档案库</span>
            </h1>
            <p className="text-ink-500 text-sm md:text-base max-w-2xl mx-auto">
              记录普通人的真实故事，保存时代变迁的珍贵记忆，让民间文化薪火相传
            </p>
          </div>
          <StatsBanner
            storyCount={storyCount}
            storytellerCount={storytellerCount}
            provinceCount={provinceCount}
            villageCount={villageCount}
          />
        </section>

        <section className="animate-scroll-reveal" style={{ animationDelay: '100ms' }}>
          <StoryFilter onFilterChange={setFilterParams} externalCategoryIds={filterParams.categoryIds} />
        </section>

        <section
          id="categories-section"
          className="animate-scroll-reveal"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
                故事分类
              </h2>
              <p className="section-subtitle">选择分类，探索不同类型的民间故事</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-ink-500">
              <Grid3X3 className="w-4 h-4" />
              <span>共 {sortedCategories.length} 个分类</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {sortedCategories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border-2 p-5 md:p-6 text-left',
                  'transition-all duration-300 ease-out',
                  'hover:-translate-y-1 hover:shadow-chinese-lg',
                  filterParams.categoryIds.includes(cat.id)
                    ? 'border-cinnabar-500 bg-cinnabar-50 shadow-chinese-lg'
                    : 'border-rice-200 bg-white/80 hover:border-cinnabar-300 hover:bg-cinnabar-50/50'
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gold-50 opacity-60 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div
                    className={cn(
                      'w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-3xl md:text-4xl mb-4',
                      filterParams.categoryIds.includes(cat.id)
                        ? 'bg-cinnabar-100'
                        : 'bg-gradient-to-br from-rice-100 to-gold-50 group-hover:from-cinnabar-50 group-hover:to-gold-100'
                    )}
                  >
                    {cat.icon || '📚'}
                  </div>
                  <h3
                    className={cn(
                      'font-serif text-lg md:text-xl font-bold mb-1 transition-colors',
                      filterParams.categoryIds.includes(cat.id)
                        ? 'text-cinnabar-700'
                        : 'text-ink-900 group-hover:text-cinnabar-600'
                    )}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs md:text-sm text-ink-500 line-clamp-2 mb-3">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                        filterParams.categoryIds.includes(cat.id)
                          ? 'bg-cinnabar-500 text-white'
                          : 'bg-rice-200 text-ink-600 group-hover:bg-cinnabar-100 group-hover:text-cinnabar-700'
                      )}
                    >
                      {cat.storyCount} 篇故事
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section
            className="lg:col-span-2 animate-scroll-reveal"
            style={{ animationDelay: '200ms' }}
          >
            <div className="mb-6">
              <h2 className="section-title flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
                最新收录故事
              </h2>
              <p className="section-subtitle">
                按录制时间倒序排列，展示最新采集的口述历史
              </p>
            </div>
            <StoryTimeline stories={filteredStories} />
          </section>

          <section
            className="animate-scroll-reveal"
            style={{ animationDelay: '250ms' }}
          >
            <ContributorRanking ranking={ranking} />
          </section>
        </div>
      </div>
    </Layout>
  );
}
