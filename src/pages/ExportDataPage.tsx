import { useState, useMemo } from 'react';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Filter,
  Eye,
  ChevronDown,
  AlertCircle,
  BookOpenCheck,
  LayoutGrid,
  MapPin,
  Calendar,
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import { useAppStore } from '@/store';
import type { StoryStatus, Story } from '@/types';
import { provinces } from '@/data/location';

type ExportFormat = 'json' | 'csv';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLocationName(provinceId?: string, cityId?: string, districtId?: string) {
  const province = provinces.find((p) => p.id === provinceId);
  let pName = province?.name || '';
  let cName = '';
  let dName = '';
  if (province && cityId) {
    const city = province.cities.find((c) => c.id === cityId);
    if (city) {
      cName = city.name;
      if (districtId) {
        const district = city.districts.find((d) => d.id === districtId);
        if (district) dName = district.name;
      }
    }
  }
  return { pName, cName, dName };
}

function StatusSelect({
  value,
  onChange,
  placeholder = '全部状态',
}: {
  value: StoryStatus | '';
  onChange: (v: StoryStatus | '') => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const options: Array<{ key: StoryStatus | ''; label: string }> = [
    { key: '', label: placeholder },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已驳回' },
  ];
  const current = options.find((o) => o.key === value) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full input-base flex items-center justify-between text-left"
      >
        <span className={value ? 'text-ink-800 font-medium' : 'text-ink-400'}>{current.label}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact py-1 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.key || 'all'}
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  value === opt.key ? 'bg-cinnabar-50 text-cinnabar-700 font-medium' : 'text-ink-700 hover:bg-rice-50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProvinceSelect({
  value,
  onChange,
  placeholder = '全部省份',
}: {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = provinces.find((p) => p.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full input-base flex items-center justify-between text-left"
      >
        <span className={value ? 'text-ink-800 font-medium' : 'text-ink-400'}>
          {selected?.name || placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-60 overflow-y-auto scrollbar-thin py-1">
            <button
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors',
                !value ? 'bg-cinnabar-50 text-cinnabar-700 font-medium' : 'text-ink-700 hover:bg-rice-50'
              )}
            >
              {placeholder}
            </button>
            {provinces.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  value === p.id ? 'bg-cinnabar-50 text-cinnabar-700 font-medium' : 'text-ink-700 hover:bg-rice-50'
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CitySelect({
  provinceId,
  value,
  onChange,
  placeholder = '全部城市',
}: {
  provinceId: string;
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const province = provinces.find((p) => p.id === provinceId);
  const cities = province?.cities || [];
  const selected = cities.find((c) => c.id === value);
  const disabled = !provinceId;

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'w-full input-base flex items-center justify-between text-left',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={value ? 'text-ink-800 font-medium' : 'text-ink-400'}>
          {selected?.name || placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} strokeWidth={2} />
      </button>
      {open && provinceId && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-60 overflow-y-auto scrollbar-thin py-1">
            <button
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors',
                !value ? 'bg-cinnabar-50 text-cinnabar-700 font-medium' : 'text-ink-700 hover:bg-rice-50'
              )}
            >
              {placeholder}
            </button>
            {cities.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  value === c.id ? 'bg-cinnabar-50 text-cinnabar-700 font-medium' : 'text-ink-700 hover:bg-rice-50'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
  categories,
  placeholder = '全部分类',
}: {
  value: string;
  onChange: (id: string) => void;
  categories: Array<{ id: string; name: string }>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full input-base flex items-center justify-between text-left"
      >
        <span className={value ? 'text-ink-800 font-medium' : 'text-ink-400'}>
          {selected?.name || placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-60 overflow-y-auto scrollbar-thin py-1">
            <button
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors',
                !value ? 'bg-cinnabar-50 text-cinnabar-700 font-medium' : 'text-ink-700 hover:bg-rice-50'
              )}
            >
              {placeholder}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  value === c.id ? 'bg-cinnabar-50 text-cinnabar-700 font-medium' : 'text-ink-700 hover:bg-rice-50'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TagSelect({
  value,
  onChange,
  tags,
  placeholder = '选择标签（可选多个）',
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  tags: Array<{ id: string; name: string; color: string }>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const toggleTag = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full input-base flex items-center justify-between text-left min-h-[46px]"
      >
        <div className="flex flex-wrap gap-1.5 flex-1 pr-2">
          {value.length === 0 ? (
            <span className="text-ink-400">{placeholder}</span>
          ) : (
            value.slice(0, 3).map((id) => {
              const t = tags.find((x) => x.id === id);
              if (!t) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.name}
                </span>
              );
            })
          )}
          {value.length > 3 && (
            <span className="text-xs text-ink-500">+{value.length - 3}</span>
          )}
        </div>
        <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform', open && 'rotate-180')} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-64 overflow-y-auto scrollbar-thin p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {tags.map((t) => {
                const selected = value.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all',
                      selected ? 'bg-cinnabar-50 border border-cinnabar-200' : 'hover:bg-rice-50 border border-transparent'
                    )}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className={cn('truncate', selected && 'font-medium text-cinnabar-800')}>
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {value.length > 0 && (
              <div className="mt-2 pt-2 border-t border-rice-100 flex justify-end">
                <button
                  onClick={() => onChange([])}
                  className="text-xs text-ink-500 hover:text-cinnabar-600"
                >
                  清空选择
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function buildCSV(stories: Story[], categories: any[], storytellers: any[], tags: any[]): string {
  const esc = (val: any) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ['标题', '讲述者', '分类', '省', '市', '区', '采集日期', '标签', '状态', '摘要'];

  const statusLabel: Record<StoryStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  };

  const rows = stories.map((s) => {
    const st = storytellers.find((x) => x.id === s.storytellerId);
    const cat = categories.find((x) => x.id === s.categoryId);
    const { pName, cName, dName } = getLocationName(s.provinceId, s.cityId, s.districtId);
    const tagNames = s.tagIds
      .map((tid) => tags.find((t) => t.id === tid)?.name)
      .filter(Boolean)
      .join('|');
    return [
      s.title,
      st?.name || '',
      cat?.name || '',
      pName,
      cName,
      dName,
      s.recordingDate || '',
      tagNames,
      statusLabel[s.status],
      s.summary,
    ].map(esc);
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ExportDataContent() {
  const { stories, categories, storytellers, tags } = useAppStore();

  const [status, setStatus] = useState<StoryStatus | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [format, setFormat] = useState<ExportFormat>('json');

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      if (status && s.status !== status) return false;
      if (categoryId && s.categoryId !== categoryId) return false;
      if (provinceId && s.provinceId !== provinceId) return false;
      if (cityId && s.cityId !== cityId) return false;
      if (districtId && s.districtId !== districtId) return false;
      if (tagIds.length > 0) {
        const hasAll = tagIds.every((tid) => s.tagIds.includes(tid));
        if (!hasAll) return false;
      }
      if (dateStart && s.recordingDate && s.recordingDate < dateStart) return false;
      if (dateEnd && s.recordingDate && s.recordingDate > dateEnd) return false;
      return true;
    });
  }, [stories, status, categoryId, provinceId, cityId, districtId, tagIds, dateStart, dateEnd]);

  const previewStories = filteredStories.slice(0, 5);

  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    setCityId('');
    setDistrictId('');
  };

  const handleCityChange = (id: string) => {
    setCityId(id);
    setDistrictId('');
  };

  const handleExport = () => {
    if (filteredStories.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    if (format === 'json') {
      const json = JSON.stringify(filteredStories, null, 2);
      triggerDownload(json, `oral-history-${today}.json`, 'application/json;charset=utf-8');
    } else {
      const csv = buildCSV(filteredStories, categories, storytellers, tags);
      const bom = '\uFEFF';
      triggerDownload(bom + csv, `oral-history-${today}.csv`, 'text/csv;charset=utf-8');
    }
  };

  const statusLabel: Record<StoryStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">数据导出</h1>
        <p className="section-subtitle mb-0">根据筛选条件导出口述历史数据，用于学术研究或存档备份</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cinnabar-100 border border-cinnabar-200">
            <Filter className="w-4.5 h-4.5 text-cinnabar-600" strokeWidth={2} />
          </div>
          <h2 className="font-serif text-lg font-bold text-ink-900">筛选条件</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="label-base flex items-center gap-1.5">
              <BookOpenCheck className="w-4 h-4 text-cinnabar-500" strokeWidth={2} />
              故事状态
            </label>
            <StatusSelect value={status} onChange={setStatus} />
          </div>
          <div>
            <label className="label-base flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-cinnabar-500" strokeWidth={2} />
              内容分类
            </label>
            <CategorySelect
              value={categoryId}
              onChange={setCategoryId}
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>
          <div>
            <label className="label-base flex items-center gap-1.5">
              <Tags className="w-4 h-4 text-cinnabar-500" strokeWidth={2} />
              内容标签
            </label>
            <TagSelect value={tagIds} onChange={setTagIds} tags={tags} />
          </div>
          <div>
            <label className="label-base flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cinnabar-500" strokeWidth={2} />
              省份
            </label>
            <ProvinceSelect value={provinceId} onChange={handleProvinceChange} />
          </div>
          <div>
            <label className="label-base">城市</label>
            <CitySelect provinceId={provinceId} value={cityId} onChange={handleCityChange} />
          </div>
          <div>
            <label className="label-base">区县</label>
            <CitySelect provinceId={provinceId ? provinceId : ''} value={districtId} onChange={setDistrictId} placeholder="全部区县" />
          </div>
          <div>
            <label className="label-base flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cinnabar-500" strokeWidth={2} />
              采集开始日期
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">采集结束日期</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="input-base"
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-rice-100">
          <label className="label-base mb-3">导出格式</label>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              onClick={() => setFormat('json')}
              className={cn(
                'p-5 rounded-xl border-2 transition-all duration-200 text-left',
                format === 'json'
                  ? 'bg-cinnabar-50 border-cinnabar-400 shadow-md'
                  : 'bg-white border-rice-200 hover:border-cinnabar-300 hover:bg-cinnabar-50/30'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  format === 'json' ? 'bg-cinnabar-500 text-white' : 'bg-rice-100 text-ink-600'
                )}>
                  <FileJson className="w-5 h-5" strokeWidth={2} />
                </div>
                <p className={cn('font-bold', format === 'json' ? 'text-cinnabar-800' : 'text-ink-800')}>JSON 格式</p>
              </div>
              <p className="text-xs text-ink-500 leading-relaxed">
                完整结构数据，包含段落、方言注释、标签等所有字段，适合程序处理
              </p>
            </button>

            <button
              onClick={() => setFormat('csv')}
              className={cn(
                'p-5 rounded-xl border-2 transition-all duration-200 text-left',
                format === 'csv'
                  ? 'bg-cinnabar-50 border-cinnabar-400 shadow-md'
                  : 'bg-white border-rice-200 hover:border-cinnabar-300 hover:bg-cinnabar-50/30'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  format === 'csv' ? 'bg-cinnabar-500 text-white' : 'bg-rice-100 text-ink-600'
                )}>
                  <FileSpreadsheet className="w-5 h-5" strokeWidth={2} />
                </div>
                <p className={cn('font-bold', format === 'csv' ? 'text-cinnabar-800' : 'text-ink-800')}>CSV 格式</p>
              </div>
              <p className="text-xs text-ink-500 leading-relaxed">
                表格结构化数据，可直接用 Excel 打开，适合统计分析与学术研究
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-jade-100 border border-jade-200">
              <Eye className="w-4.5 h-4.5 text-jade-600" strokeWidth={2} />
            </div>
            <h2 className="font-serif text-lg font-bold text-ink-900">预览结果</h2>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rice-50 border border-rice-200">
            <BookOpenCheck className="w-4 h-4 text-cinnabar-600" strokeWidth={2} />
            <span className="text-sm text-ink-600">
              符合条件：<span className="font-serif text-xl font-bold text-cinnabar-700">{filteredStories.length}</span> 个故事
            </span>
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-rice-300" strokeWidth={1.5} />
            <p className="text-ink-500">没有符合筛选条件的故事</p>
            <p className="text-xs text-ink-400 mt-1">请尝试调整筛选条件</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-rice-200">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-rice-50 text-sm">
                    <th className="px-4 py-3 text-left font-semibold text-ink-700 w-12">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-700">标题</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-700 w-28">讲述者</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-700 w-24">分类</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-700 w-32">地区</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-700 w-28">采集日期</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-700 w-24">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {previewStories.map((s, idx) => {
                    const st = storytellers.find((x) => x.id === s.storytellerId);
                    const cat = categories.find((x) => x.id === s.categoryId);
                    const { pName, cName } = getLocationName(s.provinceId, s.cityId);
                    return (
                      <tr key={s.id} className="border-t border-rice-100 hover:bg-rice-50/60">
                        <td className="px-4 py-3 text-sm text-ink-500 font-mono">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-ink-800 truncate max-w-xs">{s.title}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink-600">{st?.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ink-600">{cat?.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ink-600 truncate">{pName}{cName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ink-600">{s.recordingDate || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            s.status === 'approved' && 'bg-jade-50 text-jade-700 border border-jade-200',
                            s.status === 'pending' && 'bg-gold-50 text-gold-700 border border-gold-200',
                            s.status === 'rejected' && 'bg-cinnabar-50 text-cinnabar-700 border border-cinnabar-200'
                          )}>
                            {statusLabel[s.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredStories.length > 5 && (
              <p className="text-xs text-ink-400 mt-3 text-center">
                ... 仅展示前 5 条，完整数据将在导出文件中包含
              </p>
            )}
          </>
        )}
      </div>

      <div className="card p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cinnabar-500 to-gold-500" />
        <div className="flex items-start gap-4 mb-5">
          <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-gold-50 border border-gold-200">
            <AlertCircle className="w-6 h-6 text-gold-700" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink-900 mb-1">学术研究使用声明</h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              本平台所有口述历史数据仅用于非商业性的学术研究、文化传承和教育目的。在使用导出的数据时，请务必遵守以下原则：
            </p>
          </div>
        </div>
        <div className="space-y-2.5 pl-16">
          {[
            '尊重讲述者隐私，不得泄露个人身份信息和联系方式；',
            '引用或发表时需注明数据来源为本口述历史档案库；',
            '不得将数据用于商业目的或任何形式的营利活动；',
            '研究成果应回馈社区，促进文化传承与保护；',
            '如涉及敏感内容，需经平台和讲述者本人同意。',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center w-5 h-5 shrink-0 mt-0.5 rounded-full bg-cinnabar-500 text-white text-[10px] font-bold">
                {idx + 1}
              </span>
              <p className="text-sm text-ink-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <button
          onClick={handleExport}
          disabled={filteredStories.length === 0}
          className="btn-primary !px-10 !py-4 text-lg shadow-chinese-lg"
        >
          <Download className="w-5 h-5" strokeWidth={2} />
          导出 {filteredStories.length} 条数据（{format.toUpperCase()}）
        </button>
      </div>
    </div>
  );
}

export default function ExportDataPage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['admin']}>
        <ExportDataContent />
      </RoleGate>
    </Layout>
  );
}
