import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  GripVertical,
  AlertTriangle,
  BookOpen,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import { useAppStore } from '@/store';
import type { Category } from '@/types';

const ICON_PRESETS = [
  '🏛️', '👤', '🏞️', '🎊', '👻', '🎵', '🧩', '🎨',
  '📖', '🎭', '🏺', '🎪', '🍜', '🏮', '🎐', '🎎',
];

function CategoryModal({
  open,
  mode,
  category,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  category?: Category;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id' | 'createdAt' | 'storyCount'> & { storyCount?: number }) => void;
}) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || ICON_PRESETS[0],
    sort: category?.sort ?? 99,
  });

  if (!open) return null;

  const updateField = <K extends keyof typeof form>(key: K, val: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    onSave({
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim(),
      icon: form.icon,
      sort: form.sort,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg p-6 animate-scroll-reveal">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cinnabar-100 border border-cinnabar-200">
              <LayoutGrid className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-900">
              {mode === 'create' ? '新增分类' : '编辑分类'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-rice-100">
            <X className="w-5 h-5 text-ink-500" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">分类名称 <span className="text-cinnabar-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="如：神话传说"
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base">唯一标识 Slug <span className="text-cinnabar-500">*</span></label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="如：myth-legend"
                className="input-base font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label-base">分类图标</label>
            <div className="grid grid-cols-8 gap-2 mb-3">
              {ICON_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => updateField('icon', emoji)}
                  className={cn(
                    'aspect-square rounded-xl border-2 text-2xl transition-all duration-200 flex items-center justify-center hover:scale-110',
                    form.icon === emoji
                      ? 'border-cinnabar-500 bg-cinnabar-50 shadow-md scale-105'
                      : 'border-rice-200 bg-white hover:border-cinnabar-300'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => updateField('icon', e.target.value)}
              placeholder="或输入自定义 emoji/图标字符"
              className="input-base text-center text-2xl"
              maxLength={4}
            />
          </div>

          <div>
            <label className="label-base">排序号（数字越小越靠前）</label>
            <input
              type="number"
              min={0}
              value={form.sort}
              onChange={(e) => updateField('sort', parseInt(e.target.value) || 0)}
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base">分类描述</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="简要描述该分类包含的内容..."
              className="input-base min-h-[100px] resize-y"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-rice-100">
          <button onClick={onClose} className="btn-ghost">取消</button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.slug.trim()}
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

function DeleteConfirmModal({
  open,
  category,
  onClose,
  onConfirm,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');

  if (!open || !category) return null;

  const canConfirm = confirmText.trim() === category.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 animate-scroll-reveal">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-cinnabar-100 border border-cinnabar-200">
            <AlertTriangle className="w-6 h-6 text-cinnabar-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-ink-900 mb-1">确认删除分类</h3>
            <p className="text-sm text-ink-500">此操作将从系统中永久移除该分类</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-rice-50 border border-rice-200 flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900">{category.name}</p>
              <p className="text-xs text-ink-500">
                包含 <span className="font-bold text-cinnabar-600">{category.storyCount}</span> 个故事
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gold-50 border border-gold-200">
            <p className="text-sm text-gold-800 leading-relaxed">
              <strong className="text-gold-900">注意：</strong>
              删除分类后，该分类下的 <strong>{category.storyCount}</strong> 个故事
              <strong>不会被删除</strong>，但将变为「未分类」状态。
              如需保留分类，请选择编辑而非删除。
            </p>
          </div>

          <div>
            <label className="label-base">
              请输入分类名称 <strong className="text-cinnabar-600">{category.name}</strong> 以确认：
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`输入 "${category.name}" 进行确认`}
              className="input-base"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setConfirmText('');
              onClose();
            }}
            className="btn-ghost"
          >
            取消
          </button>
          <button
            onClick={() => {
              setConfirmText('');
              onConfirm();
            }}
            disabled={!canConfirm}
            className="btn-primary"
            style={canConfirm ? {
              background: 'linear-gradient(135deg, #C8102E 0%, #730e21 100%)',
            } : undefined}
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryManageContent() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppStore();

  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort - b.sort),
    [categories]
  );

  const handleSave = (data: Omit<Category, 'id' | 'createdAt' | 'storyCount'>) => {
    if (editing) {
      updateCategory(editing.id, data);
    } else {
      addCategory(data);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteCategory(deleting.id);
    setDeleting(null);
  };

  const moveSort = (id: string, direction: 'up' | 'down') => {
    const idx = sortedCategories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sortedCategories.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const current = sortedCategories[idx];
    const swap = sortedCategories[swapIdx];
    updateCategory(current.id, { sort: swap.sort });
    updateCategory(swap.id, { sort: current.sort });
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragEnd = () => setDragId(null);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const dragIdx = sortedCategories.findIndex((c) => c.id === dragId);
    const targetIdx = sortedCategories.findIndex((c) => c.id === targetId);
    if (dragIdx < 0 || targetIdx < 0) return;
    const newList = [...sortedCategories];
    const [removed] = newList.splice(dragIdx, 1);
    newList.splice(targetIdx, 0, removed);
    newList.forEach((cat, i) => {
      if (cat.sort !== i) {
        updateCategory(cat.id, { sort: i });
      }
    });
    setDragId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="section-title">分类管理</h1>
          <p className="section-subtitle mb-0">管理口述历史的内容分类体系，支持拖拽排序</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          新增分类
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-5">
        {sortedCategories.map((cat, idx) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(cat.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(cat.id)}
            className={cn(
              'card p-5 relative group cursor-grab active:cursor-grabbing',
              dragId === cat.id && 'opacity-50 scale-95 rotate-2',
              dragId && dragId !== cat.id && 'ring-2 ring-dashed ring-cinnabar-300'
            )}
          >
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-ink-300" strokeWidth={2} />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
              <button
                onClick={() => moveSort(cat.id, 'up')}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-rice-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="上移"
              >
                <ArrowUp className="w-3.5 h-3.5 text-ink-500" strokeWidth={2} />
              </button>
              <button
                onClick={() => moveSort(cat.id, 'down')}
                disabled={idx === sortedCategories.length - 1}
                className="p-1 rounded hover:bg-rice-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="下移"
              >
                <ArrowDown className="w-3.5 h-3.5 text-ink-500" strokeWidth={2} />
              </button>
            </div>

            <div className="text-center pt-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rice-50 to-rice-100 border border-rice-200 mb-4 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200">
                <span className="text-4xl">{cat.icon}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-900 mb-1 truncate">
                {cat.name}
              </h3>
              <p className="text-xs text-ink-400 font-mono mb-3 truncate">
                /{cat.slug}
              </p>
              <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 mb-4 min-h-[32px]">
                {cat.description || '暂无描述'}
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cinnabar-50 border border-cinnabar-100 mb-4">
                <BookOpen className="w-3.5 h-3.5 text-cinnabar-600" strokeWidth={2} />
                <span className="text-sm font-bold text-cinnabar-700">{cat.storyCount}</span>
                <span className="text-[10px] text-cinnabar-600">篇故事</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditing(cat);
                    setModalOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rice-50 border border-rice-200 text-ink-700 text-sm font-medium hover:bg-cinnabar-50 hover:border-cinnabar-200 hover:text-cinnabar-700 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                  编辑
                </button>
                <button
                  onClick={() => setDeleting(cat)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cinnabar-50 border border-cinnabar-100 text-cinnabar-700 text-sm font-medium hover:bg-cinnabar-100 hover:border-cinnabar-300 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedCategories.length === 0 && (
        <div className="card p-16 text-center">
          <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-rice-300" strokeWidth={1.5} />
          <h3 className="font-serif text-xl font-bold text-ink-700 mb-2">暂无分类</h3>
          <p className="text-sm text-ink-500 mb-5">点击「新增分类」按钮开始创建内容分类</p>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            创建第一个分类
          </button>
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        category={editing || undefined}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        open={!!deleting}
        category={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function CategoryManagePage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['admin']}>
        <CategoryManageContent />
      </RoleGate>
    </Layout>
  );
}
