import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Check,
  X,
  Merge,
  ChevronDown,
  BadgeCheck,
  MapPin,
  Star,
  BookOpen,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import { useAppStore } from '@/store';
import type { Storyteller } from '@/types';
import { provinces } from '@/data/location';

type SortKey = 'storyCount' | 'name' | 'age' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLocationName(provinceId?: string, cityId?: string, districtId?: string) {
  if (!provinceId) return '-';
  const province = provinces.find((p) => p.id === provinceId);
  if (!province) return '-';
  let name = province.name;
  if (cityId) {
    const city = province.cities.find((c) => c.id === cityId);
    if (city) {
      name += city.name;
      if (districtId) {
        const district = city.districts.find((d) => d.id === districtId);
        if (district) name += district.name;
      }
    }
  }
  return name;
}

function ProvinceSelect({
  value,
  onChange,
  placeholder = '请选择省份',
}: {
  value?: string;
  onChange: (id: string | undefined, name: string) => void;
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
        <span className={selected ? 'text-ink-800' : 'text-ink-400'}>
          {selected?.name || placeholder}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-60 overflow-y-auto scrollbar-thin py-1">
            {provinces.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChange(p.id, p.name);
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
  placeholder = '请选择城市',
}: {
  provinceId?: string;
  value?: string;
  onChange: (id: string | undefined, name: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const province = provinces.find((p) => p.id === provinceId);
  const cities = province?.cities || [];
  const selected = cities.find((c) => c.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => provinceId && setOpen(!open)}
        disabled={!provinceId}
        className={cn(
          'w-full input-base flex items-center justify-between text-left',
          !provinceId && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={selected ? 'text-ink-800' : 'text-ink-400'}>
          {selected?.name || placeholder}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>
      {open && provinceId && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-60 overflow-y-auto scrollbar-thin py-1">
            {cities.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onChange(c.id, c.name);
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

function StorytellerModal({
  open,
  mode,
  storyteller,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  storyteller?: Storyteller;
  onClose: () => void;
  onSave: (data: Partial<Storyteller> & { isVerified?: boolean }) => void;
}) {
  const [form, setForm] = useState({
    name: storyteller?.name || '',
    gender: storyteller?.gender || 'male' as const,
    age: storyteller?.age || 60,
    ethnicity: storyteller?.ethnicity || '',
    provinceId: storyteller?.provinceId,
    cityId: storyteller?.cityId,
    districtId: storyteller?.districtId,
    address: storyteller?.address || '',
    occupation: storyteller?.occupation || '',
    education: storyteller?.education || '',
    specialties: storyteller?.specialties || [],
    specialtiesInput: (storyteller?.specialties || []).join('、'),
    yearsOfExperience: storyteller?.yearsOfExperience || 20,
    bio: storyteller?.bio || '',
    contactPhone: storyteller?.contactPhone || '',
    isVerified: storyteller?.isVerified || false,
  });

  if (!open) return null;

  const updateField = <K extends keyof typeof form>(key: K, val: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const specialties = form.specialtiesInput
      .split(/[、,，;；\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      name: form.name.trim(),
      gender: form.gender,
      age: form.age,
      ethnicity: form.ethnicity.trim() || undefined,
      provinceId: form.provinceId,
      cityId: form.cityId,
      districtId: form.districtId,
      address: form.address.trim() || undefined,
      occupation: form.occupation.trim() || undefined,
      education: form.education.trim() || undefined,
      specialties,
      yearsOfExperience: form.yearsOfExperience,
      bio: form.bio.trim(),
      contactPhone: form.contactPhone.trim() || undefined,
      isVerified: form.isVerified,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative card w-full max-w-2xl p-6 animate-scroll-reveal max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-rice-100 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-jade-100 border border-jade-200">
              <Users className="w-5 h-5 text-jade-600" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-900">
              {mode === 'create' ? '新增讲述者' : '编辑讲述者'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-rice-100 transition-colors"
          >
            <X className="w-5 h-5 text-ink-500" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">姓名 <span className="text-cinnabar-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="请输入讲述者姓名"
                className="input-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">性别</label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value as any)}
                  className="input-base"
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="label-base">年龄</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                  className="input-base"
                />
              </div>
            </div>
            <div>
              <label className="label-base">民族</label>
              <input
                type="text"
                value={form.ethnicity}
                onChange={(e) => updateField('ethnicity', e.target.value)}
                placeholder="如：汉族、蒙古族"
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base">从业年限</label>
              <input
                type="number"
                min={0}
                value={form.yearsOfExperience}
                onChange={(e) => updateField('yearsOfExperience', parseInt(e.target.value) || 0)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base">职业</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                placeholder="如：农民、退休教师、民间艺人"
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base">文化程度</label>
              <input
                type="text"
                value={form.education}
                onChange={(e) => updateField('education', e.target.value)}
                placeholder="如：小学、初中、高中、本科"
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-base">省份</label>
              <ProvinceSelect
                value={form.provinceId}
                onChange={(id) => {
                  setForm((prev) => ({
                    ...prev,
                    provinceId: id,
                    cityId: undefined,
                    districtId: undefined,
                  }));
                }}
              />
            </div>
            <div>
              <label className="label-base">城市</label>
              <CitySelect
                provinceId={form.provinceId}
                value={form.cityId}
                onChange={(id) => {
                  setForm((prev) => ({
                    ...prev,
                    cityId: id,
                    districtId: undefined,
                  }));
                }}
              />
            </div>
            <div>
              <label className="label-base">区县</label>
              <CitySelect
                provinceId={form.provinceId ? form.provinceId : undefined}
                value={form.districtId}
                onChange={(id) => updateField('districtId', id as any)}
                placeholder="请选择区县"
              />
            </div>
          </div>

          <div>
            <label className="label-base">详细地址</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="请输入详细地址"
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base flex items-center gap-1.5">
              <Star className="w-4 h-4 text-gold-500" strokeWidth={2} />
              专长领域（用顿号分隔）
            </label>
            <input
              type="text"
              value={form.specialtiesInput}
              onChange={(e) => updateField('specialtiesInput', e.target.value)}
              placeholder="如：神话传说、民间歌谣、手工技艺"
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base">联系电话</label>
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="请输入联系电话"
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base">个人简介</label>
            <textarea
              value={form.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="讲述者的背景、经历和擅长的故事类型等..."
              className="input-base min-h-[100px] resize-y"
            />
          </div>

          <label className="flex items-center gap-3 p-4 rounded-xl bg-rice-50 border border-rice-200 cursor-pointer hover:bg-rice-100 transition-colors">
            <button
              type="button"
              onClick={() => updateField('isVerified', !form.isVerified)}
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                form.isVerified
                  ? 'bg-jade-500 border-jade-500'
                  : 'border-rice-400 bg-white hover:border-jade-400'
              )}
            >
              {form.isVerified && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-jade-600" strokeWidth={2} />
              <span className="text-sm font-medium text-ink-700">已认证讲述者</span>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-rice-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-ghost">取消</button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="btn-primary"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            确认保存
          </button>
        </div>
      </div>
    </div>
  );
}

function MergeModal({
  open,
  selectedIds,
  storytellers,
  onClose,
  onConfirm,
}: {
  open: boolean;
  selectedIds: string[];
  storytellers: Storyteller[];
  onClose: () => void;
  onConfirm: (targetId: string) => void;
}) {
  const [targetId, setTargetId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sourceList = storytellers.filter((s) => selectedIds.includes(s.id));
  const candidates = storytellers.filter((s) => !selectedIds.includes(s.id));
  const target = candidates.find((s) => s.id === targetId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative card w-full max-w-lg p-6 animate-scroll-reveal">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-100 border border-gold-200">
              <Merge className="w-5 h-5 text-gold-700" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-900">合并讲述者</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-rice-100">
            <X className="w-5 h-5 text-ink-500" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-rice-50 border border-rice-100 max-h-40 overflow-y-auto scrollbar-thin">
            <p className="text-xs text-ink-500 mb-3">
              合并以下 {sourceList.length} 位讲述者：
            </p>
            <div className="space-y-2">
              {sourceList.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-rice-100">
                  <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-800">{s.name}</p>
                    <p className="text-xs text-ink-500">
                      {s.gender === 'male' ? '男' : s.gender === 'female' ? '女' : '其他'} · {s.age}岁 · {s.storyCount} 个故事
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label-base">目标讲述者 <span className="text-cinnabar-500">*</span></label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full input-base flex items-center justify-between text-left"
              >
                {target ? (
                  <span className="flex items-center gap-3">
                    <img src={target.avatar} alt={target.name} className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-ink-800">{target.name}</span>
                    <span className="text-xs text-ink-400">({target.storyCount} 个故事)</span>
                  </span>
                ) : (
                  <span className="text-ink-400">请选择保留的目标讲述者</span>
                )}
                <ChevronDown className={cn('w-4 h-4', dropdownOpen && 'rotate-180')} strokeWidth={2} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-64 overflow-y-auto scrollbar-thin py-1">
                    {candidates.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-ink-400 text-center">无可用选项</p>
                    ) : (
                      candidates.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setTargetId(c.id);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            targetId === c.id ? 'bg-cinnabar-50' : 'hover:bg-rice-50'
                          )}
                        >
                          <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full" />
                          <span className="text-sm font-medium text-ink-800 flex-1">{c.name}</span>
                          <span className="text-xs text-ink-400">{c.storyCount} 个故事</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gold-50 border border-gold-200">
            <p className="text-sm text-gold-800">
              合并后，被合并者的故事将转移到目标讲述者名下，被合并者会被删除。此操作不可撤销。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-rice-100">
          <button onClick={onClose} className="btn-ghost">取消</button>
          <button
            onClick={() => targetId && onConfirm(targetId)}
            disabled={!targetId}
            className="btn-primary"
          >
            <Merge className="w-4 h-4" strokeWidth={2} />
            确认合并
          </button>
        </div>
      </div>
    </div>
  );
}

function StorytellerManageContent() {
  const { storytellers, addStoryteller, updateStoryteller, mergeStorytellers } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('storyCount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<Storyteller | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...storytellers];
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter((s) => {
        const locName = getLocationName(s.provinceId, s.cityId, s.districtId).toLowerCase();
        return s.name.toLowerCase().includes(kw) || locName.includes(kw);
      });
    }
    if (filterVerified !== null) {
      list = list.filter((s) => s.isVerified === filterVerified);
    }
    list.sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'storyCount':
          diff = a.storyCount - b.storyCount;
          break;
        case 'name':
          diff = a.name.localeCompare(b.name, 'zh-CN');
          break;
        case 'age':
          diff = a.age - b.age;
          break;
        case 'createdAt':
          diff = a.createdAt.localeCompare(b.createdAt);
          break;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });
    return list;
  }, [storytellers, searchKeyword, filterVerified, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const handleSave = (data: Partial<Storyteller> & { isVerified?: boolean }) => {
    if (editing) {
      updateStoryteller(editing.id, data);
    } else {
      addStoryteller({
        name: data.name || '',
        bio: data.bio || '',
        specialties: data.specialties || [],
        gender: data.gender || 'other',
        age: data.age || 0,
        yearsOfExperience: data.yearsOfExperience || 0,
        isVerified: data.isVerified || false,
        ethnicity: data.ethnicity,
        provinceId: data.provinceId,
        cityId: data.cityId,
        districtId: data.districtId,
        address: data.address,
        occupation: data.occupation,
        education: data.education,
        contactPhone: data.contactPhone,
      });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleMerge = (targetId: string) => {
    mergeStorytellers(targetId, selectedIds);
    setSelectedIds([]);
    setMergeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="section-title">讲述者管理</h1>
          <p className="section-subtitle mb-0">管理所有民间故事讲述者的档案信息</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button onClick={() => setMergeModalOpen(true)} className="btn-secondary">
              <Merge className="w-4 h-4" strokeWidth={2} />
              合并选中 ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            新增讲述者
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" strokeWidth={2} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索姓名或地区..."
              className="input-base pl-12"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-500 flex items-center gap-1.5">
              <Filter className="w-4 h-4" strokeWidth={2} />
              认证：
            </span>
            {([
              { key: null, label: '全部' },
              { key: true, label: '已认证' },
              { key: false, label: '未认证' },
            ] as Array<{ key: boolean | null; label: string }>).map((opt) => (
              <button
                key={String(opt.key)}
                onClick={() => setFilterVerified(opt.key)}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  filterVerified === opt.key
                    ? 'bg-cinnabar-500 text-white shadow-md'
                    : 'bg-rice-50 text-ink-600 hover:bg-rice-100 border border-rice-200'
                )}
              >
                {opt.label}
              </button>
            ))}
            <span className="w-px h-6 bg-rice-200 mx-1 hidden sm:block" />
            <button
              onClick={() => toggleSort('storyCount')}
              className={cn(
                'inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                sortKey === 'storyCount'
                  ? 'bg-cinnabar-500 text-white shadow-md'
                  : 'bg-rice-50 text-ink-600 hover:bg-rice-100 border border-rice-200'
              )}
            >
              <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
              按故事数{sortKey === 'storyCount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-rice-50 border-b border-rice-200">
                <th className="px-4 py-4 text-left w-12">
                  <button
                    onClick={toggleSelectAll}
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      selectedIds.length === filtered.length && filtered.length > 0
                        ? 'bg-cinnabar-500 border-cinnabar-500'
                        : 'border-rice-300 hover:border-cinnabar-400 bg-white'
                    )}
                  >
                    {selectedIds.length === filtered.length && filtered.length > 0 && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700">讲述者</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700 w-32">性别/年龄</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700 w-48">地区</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700">专长</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700 w-28">故事数</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700 w-28">认证状态</th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-ink-700 w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-rice-300" strokeWidth={1.5} />
                    <p className="text-ink-500">暂无匹配的讲述者</p>
                  </td>
                </tr>
              ) : (
                filtered.map((st) => {
                  const isSelected = selectedIds.includes(st.id);
                  return (
                    <tr
                      key={st.id}
                      className={cn(
                        'border-b border-rice-100 transition-colors',
                        isSelected ? 'bg-cinnabar-50/50' : 'hover:bg-rice-50'
                      )}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelect(st.id)}
                          className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-cinnabar-500 border-cinnabar-500'
                              : 'border-rice-300 hover:border-cinnabar-400 bg-white'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.id}`}
                            alt={st.name}
                            className="w-11 h-11 rounded-full border-2 border-rice-200 shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-900 flex items-center gap-1.5">
                              {st.name}
                              {st.isVerified && (
                                <BadgeCheck className="w-4.5 h-4.5 text-jade-600" strokeWidth={2.5} />
                              )}
                            </p>
                            <p className="text-xs text-ink-500">
                              {st.occupation || '职业未知'}
                              {st.education ? ` · ${st.education}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-ink-700">
                          {st.gender === 'male' ? '男' : st.gender === 'female' ? '女' : '其他'} / {st.age}岁
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-ink-600">
                          <MapPin className="w-3.5 h-3.5 text-cinnabar-500 shrink-0" strokeWidth={2} />
                          <span className="line-clamp-1">{getLocationName(st.provinceId, st.cityId, st.districtId)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {st.specialties.slice(0, 3).map((sp, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-gold-50 border border-gold-100 text-gold-700 text-xs"
                            >
                              {sp}
                            </span>
                          ))}
                          {st.specialties.length > 3 && (
                            <span className="text-xs text-ink-400">+{st.specialties.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-jade-50 border border-jade-100 text-jade-700 text-sm font-bold">
                          <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                          {st.storyCount}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {st.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-jade-50 border border-jade-200 text-jade-700 text-xs font-medium">
                            <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                            已认证
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ink-50 border border-ink-200 text-ink-600 text-xs font-medium">
                            <UserIcon className="w-3.5 h-3.5" strokeWidth={2} />
                            未认证
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            setEditing(st);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ink-500 hover:text-cinnabar-600 hover:bg-cinnabar-50 transition-all"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-rice-100 bg-rice-50/50">
          <p className="text-sm text-ink-500">
            共 <span className="font-bold text-ink-700">{filtered.length}</span> 位讲述者
            {selectedIds.length > 0 && (
              <>
                ，已选中 <span className="font-bold text-cinnabar-600">{selectedIds.length}</span> 位
              </>
            )}
          </p>
        </div>
      </div>

      <StorytellerModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        storyteller={editing || undefined}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <MergeModal
        open={mergeModalOpen}
        selectedIds={selectedIds}
        storytellers={storytellers}
        onClose={() => setMergeModalOpen(false)}
        onConfirm={handleMerge}
      />
    </div>
  );
}

export default function StorytellerManagePage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['admin']}>
        <StorytellerManageContent />
      </RoleGate>
    </Layout>
  );
}
