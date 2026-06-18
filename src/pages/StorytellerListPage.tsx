import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  BadgeCheck,
  SlidersHorizontal,
  ChevronDown,
  Search,
  Sparkles,
  Eye,
  Filter,
  X,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';
import type { Storyteller } from '@/types';
import type { Province } from '@/data/location';
import { provinces } from '@/data/location';
import { cn } from '@/lib/utils';

function getLocationName(provinceId?: string, cityId?: string): string {
  if (!provinceId) return '';
  const province: Province | undefined = provinces.find((p) => p.id === provinceId);
  if (!province) return '';
  if (!cityId) return province.name;
  const city = province.cities.find((c) => c.id === cityId);
  return city ? `${province.name}${city.name}` : province.name;
}

const allSpecialties = [
  '神话传说',
  '历史故事',
  '民间歌谣',
  '谚语谜语',
  '鬼怪故事',
  '手工技艺',
  '民俗仪式',
  '地方风物',
];

export default function StorytellerListPage() {
  const navigate = useNavigate();
  const storytellers = useAppStore((s) => s.storytellers);

  const [keyword, setKeyword] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.id === provinceId),
    [provinceId]
  );
  const selectedCity = useMemo(
    () => selectedProvince?.cities.find((c) => c.id === cityId),
    [selectedProvince, cityId]
  );
  const districts = selectedCity?.districts || [];

  const filteredStorytellers = useMemo(() => {
    return storytellers.filter((st: Storyteller) => {
      if (keyword && !st.name.includes(keyword)) {
        const kw = keyword.toLowerCase();
        const hay = [st.name, st.occupation || '', st.bio, st.specialties.join(' ')]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (provinceId && st.provinceId !== provinceId) return false;
      if (cityId && st.cityId !== cityId) return false;
      if (districtId && st.districtId !== districtId) return false;
      if (selectedSpecialties.length > 0) {
        const hasMatch = selectedSpecialties.some((sp) => st.specialties.includes(sp));
        if (!hasMatch) return false;
      }
      if (onlyVerified && !st.isVerified) return false;
      return true;
    });
  }, [storytellers, keyword, provinceId, cityId, districtId, selectedSpecialties, onlyVerified]);

  const totalPages = Math.max(1, Math.ceil(filteredStorytellers.length / pageSize));
  const pagedStorytellers = filteredStorytellers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSpecialty = (sp: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp]
    );
  };

  const resetFilter = () => {
    setKeyword('');
    setProvinceId('');
    setCityId('');
    setDistrictId('');
    setSelectedSpecialties([]);
    setOnlyVerified(false);
    setCurrentPage(1);
  };

  const hasActiveFilter =
    keyword ||
    provinceId ||
    selectedSpecialties.length > 0 ||
    onlyVerified;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="label-base flex items-center gap-2">
          <Search className="w-4 h-4 text-cinnabar-600" />
          搜索讲述者
        </label>
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="输入姓名、职业、专长…"
            className="input-base pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        </div>
      </div>

      <div>
        <label className="label-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cinnabar-600" />
          所在地区
        </label>
        <div className="space-y-2.5">
          <div className="relative">
            <select
              value={provinceId}
              onChange={(e) => {
                setProvinceId(e.target.value);
                setCityId('');
                setDistrictId('');
                setCurrentPage(1);
              }}
              className="input-base appearance-none pr-10"
            >
              <option value="">全部省份</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setDistrictId('');
                setCurrentPage(1);
              }}
              disabled={!selectedProvince}
              className="input-base appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">全部城市</option>
              {selectedProvince?.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={districtId}
              onChange={(e) => {
                setDistrictId(e.target.value);
                setCurrentPage(1);
              }}
              disabled={!selectedCity}
              className="input-base appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">全部区县</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="label-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cinnabar-600" />
          专长类型
        </label>
        <div className="flex flex-wrap gap-2">
          {allSpecialties.map((sp) => {
            const active = selectedSpecialties.includes(sp);
            return (
              <button
                key={sp}
                onClick={() => {
                  toggleSpecialty(sp);
                  setCurrentPage(1);
                }}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200',
                  active
                    ? 'border-cinnabar-500 bg-cinnabar-500 text-white shadow-chinese'
                    : 'border-rice-300 bg-white text-ink-700 hover:border-cinnabar-300 hover:bg-cinnabar-50 hover:text-cinnabar-700'
                )}
              >
                {active && <Sparkles className="w-3.5 h-3.5 mr-1" />}
                {sp}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-rice-200">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-cinnabar-600" />
            <span className="text-sm font-medium text-ink-700 group-hover:text-cinnabar-700 transition-colors">
              仅显示已认证
            </span>
          </div>
          <div
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer',
              onlyVerified ? 'bg-cinnabar-500' : 'bg-rice-300'
            )}
            onClick={() => {
              setOnlyVerified(!onlyVerified);
              setCurrentPage(1);
            }}
          >
            <div
              className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                onlyVerified ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </div>
        </label>
      </div>

      {hasActiveFilter && (
        <button
          onClick={resetFilter}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rice-300 text-sm text-ink-600 hover:bg-rice-50 hover:text-ink-800 hover:border-rice-400 transition-all"
        >
          <X className="w-4 h-4" />
          重置筛选条件
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <section className="animate-scroll-reveal">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-10 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-900">
                民间故事讲述者
              </h1>
              <p className="text-ink-500 mt-1">
                致敬每一位为文化传承默默奉献的讲述人
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="font-serif text-3xl font-bold text-cinnabar-600">
                {storytellers.length}
              </div>
              <div className="text-sm text-ink-500 mt-1">讲述者总数</div>
            </div>
            <div className="card p-4 text-center">
              <div className="font-serif text-3xl font-bold text-gold-600">
                {storytellers.filter((s) => s.isVerified).length}
              </div>
              <div className="text-sm text-ink-500 mt-1">已认证</div>
            </div>
            <div className="card p-4 text-center">
              <div className="font-serif text-3xl font-bold text-jade-600">
                {new Set(storytellers.filter((s) => s.provinceId).map((s) => s.provinceId)).size}
              </div>
              <div className="text-sm text-ink-500 mt-1">覆盖省份</div>
            </div>
            <div className="card p-4 text-center">
              <div className="font-serif text-3xl font-bold text-ink-700">
                {storytellers.reduce((sum, s) => sum + s.storyCount, 0)}
              </div>
              <div className="text-sm text-ink-500 mt-1">收录故事</div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 shrink-0">
            <div className="hidden lg:block sticky top-6">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-rice-200">
                  <SlidersHorizontal className="w-5 h-5 text-cinnabar-600" />
                  <h2 className="font-serif text-lg font-bold text-ink-900">筛选条件</h2>
                </div>
                <FilterPanel />
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden w-full btn-secondary"
            >
              <Filter className="w-4 h-4" />
              打开筛选
              {hasActiveFilter && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cinnabar-500 text-white text-xs ml-1">
                  !
                </span>
              )}
            </button>
          </aside>

          <div className="flex-1 min-w-0">
            {hasActiveFilter && (
              <div className="mb-5 p-4 rounded-xl bg-cinnabar-50/60 border border-cinnabar-100 animate-scroll-reveal">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-ink-500">当前筛选：</span>
                    {keyword && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-cinnabar-700 border border-cinnabar-200 text-xs">
                        关键词：{keyword}
                        <button onClick={() => setKeyword('')}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {(provinceId || cityId || districtId) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-jade-700 border border-jade-200 text-xs">
                        {[selectedProvince?.name, selectedCity?.name, districts.find((d) => d.id === districtId)?.name]
                          .filter(Boolean)
                          .join(' · ')}
                        <button onClick={() => { setProvinceId(''); setCityId(''); setDistrictId(''); }}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedSpecialties.map((sp) => (
                      <span
                        key={sp}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-gold-700 border border-gold-200 text-xs"
                      >
                        {sp}
                        <button onClick={() => toggleSpecialty(sp)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {onlyVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-ink-700 border border-ink-300 text-xs">
                        仅已认证
                        <button onClick={() => setOnlyVerified(false)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-ink-500">
                    共找到 <span className="font-bold text-cinnabar-600">{filteredStorytellers.length}</span> 位讲述者
                  </span>
                </div>
              </div>
            )}

            {pagedStorytellers.length === 0 ? (
              <div className="card p-12 text-center animate-scroll-reveal">
                <User className="w-16 h-16 mx-auto mb-4 text-rice-300" strokeWidth={1} />
                <h3 className="font-serif text-xl font-bold text-ink-700 mb-2">
                  暂无符合条件的讲述者
                </h3>
                <p className="text-ink-500 mb-6">
                  请尝试调整筛选条件，或重置筛选后重新搜索
                </p>
                <button onClick={resetFilter} className="btn-primary">
                  <X className="w-4 h-4" />
                  重置筛选条件
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {pagedStorytellers.map((st: Storyteller, idx) => (
                    <div
                      key={st.id}
                      className="card p-5 group animate-scroll-reveal cursor-pointer"
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => navigate(`/storyteller/${st.id}`)}
                    >
                      <div className="relative mb-5">
                        <div className="w-24 h-24 mx-auto rounded-full border-[3px] border-gold-400 p-1 bg-gradient-to-br from-gold-50 via-white to-rice-100 shadow-gold group-hover:shadow-gold transition-shadow">
                          {st.avatar ? (
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-rice-200 flex items-center justify-center text-ink-400">
                              <User className="w-12 h-12" strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                        {st.isVerified && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-white border-2 border-cinnabar-500 shadow-md">
                            <BadgeCheck className="w-4 h-4 text-cinnabar-600" strokeWidth={2.5} />
                            <span className="text-xs font-bold text-cinnabar-600">已认证</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center mb-4">
                        <h3 className="font-serif text-xl font-bold text-ink-900 group-hover:text-cinnabar-600 transition-colors mb-2">
                          {st.name}
                        </h3>
                        <div className="flex items-center justify-center gap-3 text-sm text-ink-500">
                          <span>{st.age}岁</span>
                          <span className="w-1 h-1 rounded-full bg-ink-300" />
                          <span>
                            {st.gender === 'male' ? '男' : st.gender === 'female' ? '女' : '其他'}
                          </span>
                        </div>
                        {(st.provinceId || st.cityId) && (
                          <div className="flex items-center justify-center gap-1 text-sm text-ink-500 mt-2">
                            <MapPin className="w-3.5 h-3.5 text-cinnabar-500 shrink-0" />
                            <span className="truncate">
                              {getLocationName(st.provinceId, st.cityId)}
                            </span>
                          </div>
                        )}
                      </div>

                      {st.specialties.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                          {st.specialties.slice(0, 3).map((sp, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-gold-50 border border-gold-200 text-gold-700 text-xs font-medium"
                            >
                              ✦ {sp}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-rice-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cinnabar-50 to-gold-50 border border-cinnabar-200 flex items-center justify-center">
                            <BookOpenIcon className="w-4 h-4 text-cinnabar-600" />
                          </div>
                          <div>
                            <div className="font-serif text-lg font-bold text-cinnabar-600">
                              {st.storyCount}
                            </div>
                            <div className="text-[10px] text-ink-400 -mt-0.5">篇故事</div>
                          </div>
                        </div>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cinnabar-500 to-cinnabar-600 text-white text-sm font-medium hover:shadow-chinese hover:from-cinnabar-600 hover:to-cinnabar-700 active:scale-[0.98] transition-all">
                          <Eye className="w-4 h-4" />
                          查看详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl border border-rice-300 bg-white text-ink-600 hover:bg-rice-50 hover:border-rice-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <ChevronDown className="w-5 h-5 -rotate-90" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'w-10 h-10 rounded-xl font-medium transition-all',
                          currentPage === page
                            ? 'bg-gradient-to-br from-cinnabar-500 to-cinnabar-600 text-white shadow-chinese'
                            : 'border border-rice-300 bg-white text-ink-600 hover:bg-rice-50 hover:border-cinnabar-300 hover:text-cinnabar-700'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl border border-rice-300 bg-white text-ink-600 hover:bg-rice-50 hover:border-rice-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-rice-50 shadow-chinese-lg overflow-y-auto animate-scroll-reveal">
            <div className="sticky top-0 z-10 bg-rice-50 border-b border-rice-200 px-5 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-ink-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-cinnabar-600" />
                筛选条件
              </h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-9 h-9 rounded-lg hover:bg-rice-100 flex items-center justify-center text-ink-500 hover:text-ink-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <FilterPanel />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
