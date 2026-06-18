import { useState, useMemo, useEffect } from 'react';
import { Search, PenTool, ChevronDown, X, Tag, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Tag as TagType } from '../types';
import type { Province } from '../data/location';
import { provinces } from '../data/location';
import { useAppStore } from '../store';

export interface StoryFilterParams {
  keyword: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  categoryIds: string[];
  tagIds: string[];
}

interface StoryFilterProps {
  onFilterChange: (params: StoryFilterParams) => void;
}

const defaultParams: StoryFilterParams = {
  keyword: '',
  provinceId: '',
  cityId: '',
  districtId: '',
  categoryIds: [],
  tagIds: [],
};

export default function StoryFilter({ onFilterChange }: StoryFilterProps) {
  const [params, setParams] = useState<StoryFilterParams>(defaultParams);
  const categories = useAppStore((s) => s.categories);
  const allTags = useAppStore((s) => s.tags);

  const hotTags = useMemo(() => {
    return [...allTags]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 20);
  }, [allTags]);

  const selectedProvince = useMemo<Province | undefined>(
    () => provinces.find((p) => p.id === params.provinceId),
    [params.provinceId]
  );

  const selectedCity = useMemo(
    () => selectedProvince?.cities.find((c) => c.id === params.cityId),
    [selectedProvince, params.cityId]
  );

  const districts = selectedCity?.districts || [];

  useEffect(() => {
    onFilterChange(params);
  }, [params, onFilterChange]);

  const updateParams = (patch: Partial<StoryFilterParams>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  };

  const toggleCategory = (catId: string) => {
    setParams((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId],
    }));
  };

  const toggleTag = (tagId: string) => {
    setParams((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    updateParams({ provinceId, cityId: '', districtId: '' });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    updateParams({ cityId, districtId: '' });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ districtId: e.target.value });
  };

  const resetFilter = () => {
    setParams(defaultParams);
  };

  const hasActiveFilter =
    params.keyword ||
    params.provinceId ||
    params.categoryIds.length > 0 ||
    params.tagIds.length > 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-rice-200 bg-rice-50 p-6 shadow-chinese',
        'bg-paper-texture bg-cloud-pattern'
      )}
    >
      <div className="mb-6">
        <div className="group relative">
          <PenTool className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-cinnabar-500 transition-transform group-focus-within:rotate-12" />
          <input
            type="text"
            value={params.keyword}
            onChange={(e) => updateParams({ keyword: e.target.value })}
            placeholder="搜索故事标题、摘要、讲述者、标签…"
            className={cn(
              'w-full rounded-lg border-2 border-cinnabar-200 bg-rice-50/80 py-4 pl-14 pr-14',
              'font-serif text-lg text-ink-800 placeholder:text-ink-400',
              'outline-none transition-all duration-300',
              'focus:border-cinnabar-500 focus:bg-rice-100 focus:shadow-[0_0_0_4px_rgba(200,16,46,0.1)]'
            )}
          />
          <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-600" />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-700">
          <MapPin className="h-4 w-4 text-cinnabar-600" />
          <span>地区筛选</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <select
              value={params.provinceId}
              onChange={handleProvinceChange}
              className={cn(
                'w-full appearance-none rounded-lg border border-rice-300 bg-rice-100 py-2.5 pl-4 pr-10',
                'text-sm text-ink-700 outline-none transition-all',
                'focus:border-cinnabar-400 focus:ring-2 focus:ring-cinnabar-100'
              )}
            >
              <option value="">全部省份</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>

          <div className="relative">
            <select
              value={params.cityId}
              onChange={handleCityChange}
              disabled={!selectedProvince}
              className={cn(
                'w-full appearance-none rounded-lg border border-rice-300 bg-rice-100 py-2.5 pl-4 pr-10',
                'text-sm text-ink-700 outline-none transition-all',
                'focus:border-cinnabar-400 focus:ring-2 focus:ring-cinnabar-100',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <option value="">全部城市</option>
              {selectedProvince?.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>

          <div className="relative">
            <select
              value={params.districtId}
              onChange={handleDistrictChange}
              disabled={!selectedCity}
              className={cn(
                'w-full appearance-none rounded-lg border border-rice-300 bg-rice-100 py-2.5 pl-4 pr-10',
                'text-sm text-ink-700 outline-none transition-all',
                'focus:border-cinnabar-400 focus:ring-2 focus:ring-cinnabar-100',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <option value="">全部区县</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-700">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-cinnabar-500 text-[10px] font-bold text-rice-50">类</span>
          <span>分类筛选</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat: Category) => {
            const active = params.categoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200',
                  active
                    ? 'border-cinnabar-500 bg-cinnabar-500 text-rice-50 shadow-chinese'
                    : 'border-rice-300 bg-rice-100 text-ink-700 hover:border-cinnabar-300 hover:bg-cinnabar-50 hover:text-cinnabar-700'
                )}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-700">
          <Tag className="h-4 w-4 text-gold-600" />
          <span>热门标签</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotTags.map((tag: TagType) => {
            const active = params.tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200',
                  active
                    ? 'ring-2 ring-cinnabar-400 ring-offset-1 ring-offset-rice-50'
                    : 'hover:scale-105'
                )}
                style={{
                  backgroundColor: active ? tag.color : tag.color + '18',
                  color: active ? '#fff' : tag.color,
                }}
              >
                # {tag.name}
                <span
                  className={cn(
                    'ml-1 rounded px-1 text-[10px]',
                    active ? 'bg-white/20' : 'bg-white/50'
                  )}
                >
                  {tag.usageCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilter && (
        <div className="mt-5 flex items-center justify-between border-t border-rice-200 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {params.keyword && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cinnabar-100 px-3 py-1 text-xs text-cinnabar-700">
                关键词: {params.keyword}
                <button onClick={() => updateParams({ keyword: '' })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {params.categoryIds.map((cid) => {
              const cat = categories.find((c) => c.id === cid);
              if (!cat) return null;
              return (
                <span key={cid} className="inline-flex items-center gap-1 rounded-full bg-cinnabar-100 px-3 py-1 text-xs text-cinnabar-700">
                  {cat.name}
                  <button onClick={() => toggleCategory(cid)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            {params.tagIds.map((tid) => {
              const tag = allTags.find((t) => t.id === tid);
              if (!tag) return null;
              return (
                <span key={tid} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                  # {tag.name}
                  <button onClick={() => toggleTag(tid)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            {(params.provinceId || params.cityId || params.districtId) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-jade-100 px-3 py-1 text-xs text-jade-700">
                {[
                  selectedProvince?.name,
                  selectedCity?.name,
                  districts.find((d) => d.id === params.districtId)?.name,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                <button
                  onClick={() => updateParams({ provinceId: '', cityId: '', districtId: '' })}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={resetFilter}
            className="shrink-0 rounded-md border border-cinnabar-300 px-3 py-1.5 text-sm text-cinnabar-700 transition-colors hover:bg-cinnabar-50"
          >
            重置筛选
          </button>
        </div>
      )}
    </div>
  );
}
