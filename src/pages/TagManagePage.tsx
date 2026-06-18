import { useState, useMemo } from 'react';
import {
  Tag,
  Search,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Merge,
  Flame,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import { useAppStore } from '@/store';
import type { Tag as TagType } from '@/types';

const COLOR_PRESETS = [
  '#C8102E', '#3A7D44', '#B8860B', '#4A6FA5',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#10B981', '#6366F1', '#EF4444', '#14B8A6',
];

type SortKey = 'usageCount' | 'name' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function TagModal({
  open,
  mode,
  tag,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  tag?: TagType;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}) {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || COLOR_PRESETS[0]);

  if (!open) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim(), color);
      setName('');
      setColor(COLOR_PRESETS[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative card w-full max-w-md p-6 animate-scroll-reveal">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cinnabar-100 border border-cinnabar-200">
              <Tag className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-900">
              {mode === 'create' ? '新增标签' : '编辑标签'}
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
          <div>
            <label className="label-base">标签名称 <span className="text-cinnabar-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入标签名称"
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base flex items-center gap-2">
              <Palette className="w-4 h-4" strokeWidth={2} />
              标签颜色
            </label>
            <div className="grid grid-cols-6 gap-3 mb-3">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'aspect-square rounded-xl border-2 transition-all duration-200 hover:scale-110',
                    color === c ? 'border-ink-900 shadow-lg scale-105' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <Check className="w-4 h-4 text-white mx-auto" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500">自定义颜色：</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-rice-200 cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="input-base !py-2 !text-sm font-mono uppercase flex-1"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rice-50 border border-rice-100">
            <p className="text-xs text-ink-500 mb-2">预览效果：</p>
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Tag className="w-3.5 h-3.5" strokeWidth={2} />
              {name || '标签名称'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-rice-100">
          <button onClick={onClose} className="btn-ghost">取消</button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
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
  tags,
  onClose,
  onConfirm,
}: {
  open: boolean;
  selectedIds: string[];
  tags: TagType[];
  onClose: () => void;
  onConfirm: (targetId: string) => void;
}) {
  const [targetId, setTargetId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sourceTags = tags.filter((t) => selectedIds.includes(t.id));
  const candidateTags = tags.filter((t) => !selectedIds.includes(t.id));

  if (!open) return null;

  const targetTag = candidateTags.find((t) => t.id === targetId);

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
            <h3 className="font-serif text-xl font-bold text-ink-900">合并标签</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-rice-100 transition-colors"
          >
            <X className="w-5 h-5 text-ink-500" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-rice-50 border border-rice-100">
            <p className="text-xs text-ink-500 mb-2">将合并以下 {sourceTags.length} 个标签：</p>
            <div className="flex flex-wrap gap-2">
              {sourceTags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.name}
                  <span className="opacity-70 ml-1">×{t.usageCount}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="label-base">目标标签 <span className="text-cinnabar-500">*</span></label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full input-base flex items-center justify-between text-left"
              >
                {targetTag ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: targetTag.color }}
                    />
                    <span className="font-medium">{targetTag.name}</span>
                    <span className="text-xs text-ink-400">
                      ({targetTag.usageCount} 次使用)
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-400">请选择要合并到的目标标签</span>
                )}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-ink-400 transition-transform',
                    dropdownOpen && 'rotate-180'
                  )}
                  strokeWidth={2}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-2 z-20 card-compact max-h-64 overflow-y-auto scrollbar-thin py-1">
                    {candidateTags.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-ink-400 text-center">
                        无可用标签
                      </p>
                    ) : (
                      candidateTags.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTargetId(t.id);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            targetId === t.id ? 'bg-cinnabar-50' : 'hover:bg-rice-50'
                          )}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="text-sm text-ink-700 font-medium flex-1">
                            {t.name}
                          </span>
                          <span className="text-xs text-ink-400">
                            {t.usageCount} 次
                          </span>
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
              合并后，被合并标签关联的故事标签将全部替换为目标标签，被合并标签会被删除。此操作不可撤销。
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

function TagManageContent() {
  const { tags, addTag, updateTag, mergeTags } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('usageCount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const sortedTags = useMemo(() => {
    let list = [...tags];
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(kw));
    }
    list.sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'usageCount':
          diff = a.usageCount - b.usageCount;
          break;
        case 'name':
          diff = a.name.localeCompare(b.name, 'zh-CN');
          break;
        case 'createdAt':
          diff = a.createdAt.localeCompare(b.createdAt);
          break;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });
    return list;
  }, [tags, searchKeyword, sortKey, sortOrder]);

  const top20Ids = useMemo(() => {
    return [...tags]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 20)
      .map((t) => t.id);
  }, [tags]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedTags.length && sortedTags.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedTags.map((t) => t.id));
    }
  };

  const handleSaveTag = (name: string, color: string) => {
    if (editingTag) {
      updateTag(editingTag.id, { name, color });
    } else {
      const newTag = addTag(name);
      if (newTag.color !== color) {
        updateTag(newTag.id, { color });
      }
    }
    setTagModalOpen(false);
    setEditingTag(null);
  };

  const handleMerge = (targetId: string) => {
    mergeTags(targetId, selectedIds);
    setSelectedIds([]);
    setMergeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="section-title">标签管理</h1>
          <p className="section-subtitle mb-0">
            管理系统中的所有内容标签，支持创建、编辑和合并
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setMergeModalOpen(true)}
              className="btn-secondary"
            >
              <Merge className="w-4 h-4" strokeWidth={2} />
              合并选中 ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => {
              setEditingTag(null);
              setTagModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            新增标签
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" strokeWidth={2} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索标签名称..."
              className="input-base pl-12"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-500 shrink-0">排序方式：</span>
            {([
              { key: 'usageCount' as const, label: '使用次数' },
              { key: 'name' as const, label: '名称' },
              { key: 'createdAt' as const, label: '创建时间' },
            ]).map((opt) => {
              const active = sortKey === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleSort(opt.key)}
                  className={cn(
                    'inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-cinnabar-500 text-white shadow-md'
                      : 'bg-rice-50 text-ink-600 hover:bg-rice-100 border border-rice-200'
                  )}
                >
                  <ArrowUpDown
                    className={cn('w-3.5 h-3.5', active && 'text-white/90')}
                    strokeWidth={2}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-rice-50 border-b border-rice-200">
                <th className="px-4 py-4 text-left w-12">
                  <button
                    onClick={toggleSelectAll}
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      selectedIds.length === sortedTags.length && sortedTags.length > 0
                        ? 'bg-cinnabar-500 border-cinnabar-500'
                        : 'border-rice-300 hover:border-cinnabar-400 bg-white'
                    )}
                  >
                    {selectedIds.length === sortedTags.length && sortedTags.length > 0 && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700">标签</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700">颜色</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700 w-32">使用次数</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-ink-700 w-40">创建时间</th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-ink-700 w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedTags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Tag className="w-12 h-12 mx-auto mb-3 text-rice-300" strokeWidth={1.5} />
                    <p className="text-ink-500">暂无匹配的标签</p>
                  </td>
                </tr>
              ) : (
                sortedTags.map((tag) => {
                  const isSelected = selectedIds.includes(tag.id);
                  const isHot = top20Ids.includes(tag.id);
                  return (
                    <tr
                      key={tag.id}
                      className={cn(
                        'border-b border-rice-100 transition-colors',
                        isSelected ? 'bg-cinnabar-50/50' : 'hover:bg-rice-50'
                      )}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelect(tag.id)}
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
                        <div className="flex items-center gap-2.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium text-white shadow-sm"
                            style={{ backgroundColor: tag.color }}
                          >
                            {isHot && <Flame className="w-3.5 h-3.5" strokeWidth={2} />}
                            {tag.name}
                          </span>
                          {isHot && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-[10px] font-bold">
                              <Flame className="w-3 h-3" strokeWidth={2} />
                              热门
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-xs font-mono text-ink-500 uppercase">
                            {tag.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rice-100 text-ink-700 text-sm font-bold">
                          {tag.usageCount}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-ink-600">
                        {formatDate(tag.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            setEditingTag(tag);
                            setTagModalOpen(true);
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
            共 <span className="font-bold text-ink-700">{sortedTags.length}</span> 个标签
            {selectedIds.length > 0 && (
              <>
                ，已选中 <span className="font-bold text-cinnabar-600">{selectedIds.length}</span> 个
              </>
            )}
          </p>
          <p className="text-xs text-ink-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-gold-500" strokeWidth={2} />
            热门标签前 20 名已高亮标注
          </p>
        </div>
      </div>

      <TagModal
        open={tagModalOpen}
        mode={editingTag ? 'edit' : 'create'}
        tag={editingTag || undefined}
        onClose={() => {
          setTagModalOpen(false);
          setEditingTag(null);
        }}
        onSave={handleSaveTag}
      />

      <MergeModal
        open={mergeModalOpen}
        selectedIds={selectedIds}
        tags={tags}
        onClose={() => setMergeModalOpen(false)}
        onConfirm={handleMerge}
      />
    </div>
  );
}

export default function TagManagePage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['admin']}>
        <TagManageContent />
      </RoleGate>
    </Layout>
  );
}
