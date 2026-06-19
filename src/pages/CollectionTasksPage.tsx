import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Tag,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  ListChecks,
  Sparkles,
  Target,
  UserCheck,
} from 'lucide-react';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import { useAppStore } from '@/store';
import { provinces } from '@/data/location';
import { cn } from '@/lib/utils';
import type { TaskPriority, TaskStatus } from '@/types';

type TabKey = 'open' | 'mine' | 'create';

const priorityConfig: Record<TaskPriority, { label: string; className: string; dotClass: string }> = {
  urgent: {
    label: '紧急',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
  high: {
    label: '高',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    dotClass: 'bg-orange-500',
  },
  medium: {
    label: '中',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dotClass: 'bg-yellow-500',
  },
  low: {
    label: '低',
    className: 'bg-green-50 text-green-700 border-green-200',
    dotClass: 'bg-green-500',
  },
};

const statusConfig: Record<TaskStatus, { label: string; className: string; icon: typeof Clock }> = {
  open: {
    label: '待认领',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Target,
  },
  in_progress: {
    label: '进行中',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  completed: {
    label: '已完成',
    className: 'bg-jade-50 text-jade-700 border-jade-200',
    icon: CheckCircle2,
  },
  closed: {
    label: '已关闭',
    className: 'bg-ink-50 text-ink-600 border-ink-200',
    icon: AlertCircle,
  },
};

function formatDate(isoString?: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function CollectionTasksContent() {
  const currentUser = useAppStore((s) => s.currentUser);
  const collectionTasks = useAppStore((s) => s.collectionTasks);
  const getOpenTasks = useAppStore((s) => s.getOpenTasks);
  const getTasksByUserId = useAppStore((s) => s.getTasksByUserId);
  const claimTask = useAppStore((s) => s.claimTask);
  const createTask = useAppStore((s) => s.createTask);
  const categories = useAppStore((s) => s.categories);

  const isAdmin = currentUser?.role === 'admin';

  const defaultTab: TabKey = isAdmin ? 'open' : 'open';
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    provinceId: '',
    priority: 'medium' as TaskPriority,
    deadline: '',
    targetStoryCount: 5,
    requirements: [] as string[],
    reward: '',
  });
  const [newRequirement, setNewRequirement] = useState('');

  const updateField = <K extends keyof typeof createForm>(key: K, val: typeof createForm[K]) => {
    setCreateForm((prev) => ({ ...prev, [key]: val }));
  };

  const addRequirement = () => {
    const trimmed = newRequirement.trim();
    if (!trimmed) return;
    updateField('requirements', [...createForm.requirements, trimmed]);
    setNewRequirement('');
  };

  const removeRequirement = (index: number) => {
    updateField(
      'requirements',
      createForm.requirements.filter((_, i) => i !== index)
    );
  };

  const handleCreateTask = () => {
    if (!createForm.title.trim() || !createForm.description.trim()) return;
    if (createForm.targetStoryCount <= 0) return;

    createTask({
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      categoryId: createForm.categoryId || undefined,
      provinceId: createForm.provinceId || undefined,
      priority: createForm.priority,
      deadline: createForm.deadline ? new Date(createForm.deadline).toISOString() : undefined,
      targetStoryCount: createForm.targetStoryCount,
      creatorId: currentUser?.id || '',
      requirements: createForm.requirements,
      tags: [],
      reward: createForm.reward.trim() || undefined,
    });

    setCreateForm({
      title: '',
      description: '',
      categoryId: '',
      provinceId: '',
      priority: 'medium',
      deadline: '',
      targetStoryCount: 5,
      requirements: [],
      reward: '',
    });
    setActiveTab('open');
  };

  const getDisplayTasks = () => {
    if (activeTab === 'open') return getOpenTasks();
    if (activeTab === 'mine' && currentUser) return getTasksByUserId(currentUser.id);
    return [];
  };

  const displayTasks = getDisplayTasks();

  const categoryMap = categories.reduce(
    (acc, c) => {
      acc[c.id] = c;
      return acc;
    },
    {} as Record<string, typeof categories[0]>
  );

  const provinceMap = provinces.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<string, typeof provinces[0]>
  );

  const handleClaim = (taskId: string) => {
    if (!currentUser) return;
    claimTask(taskId, currentUser.id);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="animate-scroll-reveal">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-cinnabar-100 to-gold-100 border-2 border-cinnabar-200 shadow-sm">
            <ListChecks className="w-6 h-6 md:w-7 md:h-7 text-cinnabar-600" strokeWidth={2} />
          </div>
          <div>
            <h1 className="section-title mb-0">📋 采集任务大厅</h1>
            <p className="section-subtitle mb-0">管理员发布的采集任务，认领完成获得成就</p>
          </div>
        </div>
      </div>

      <div className="animate-scroll-reveal" style={{ animationDelay: '50ms' }}>
        <div className="card p-2 inline-flex gap-1 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('open')}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === 'open'
                ? 'bg-cinnabar-500 text-white shadow-md'
                : 'text-ink-600 hover:bg-rice-100'
            )}
          >
            <Target className="w-4 h-4" strokeWidth={2} />
            任务广场
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full text-xs font-bold',
                activeTab === 'open' ? 'bg-white/20 text-white' : 'bg-rice-200 text-ink-600'
              )}
            >
              {getOpenTasks().length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === 'mine'
                ? 'bg-cinnabar-500 text-white shadow-md'
                : 'text-ink-600 hover:bg-rice-100'
            )}
          >
            <UserCheck className="w-4 h-4" strokeWidth={2} />
            我的任务
            {currentUser && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full text-xs font-bold',
                  activeTab === 'mine' ? 'bg-white/20 text-white' : 'bg-rice-200 text-ink-600'
                )}
              >
                {getTasksByUserId(currentUser.id).length}
              </span>
            )}
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('create')}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                activeTab === 'create'
                  ? 'bg-cinnabar-500 text-white shadow-md'
                  : 'text-ink-600 hover:bg-rice-100'
              )}
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              发布任务
            </button>
          )}
        </div>
      </div>

      {activeTab === 'create' && isAdmin ? (
        <div className="animate-scroll-reveal" style={{ animationDelay: '100ms' }}>
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cinnabar-100 border border-cinnabar-200">
                <Sparkles className="w-5 h-5 text-cinnabar-600" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-ink-900">创建新采集任务</h2>
                <p className="text-sm text-ink-500">填写任务信息，发布后贡献者可以认领</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="label-base">
                  任务标题 <span className="text-cinnabar-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="如：黄河流域神话传说采集"
                  className="input-base"
                />
              </div>

              <div>
                <label className="label-base">
                  任务描述 <span className="text-cinnabar-500">*</span>
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="详细描述采集任务的背景、目的、覆盖范围等..."
                  className="input-base min-h-[120px] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">任务分类</label>
                  <select
                    value={createForm.categoryId}
                    onChange={(e) => updateField('categoryId', e.target.value)}
                    className="input-base"
                  >
                    <option value="">选择分类（可选）</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon || '📚'} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-base">采集地区</label>
                  <select
                    value={createForm.provinceId}
                    onChange={(e) => updateField('provinceId', e.target.value)}
                    className="input-base"
                  >
                    <option value="">选择省份/直辖市（可选）</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-base">优先级</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => updateField('priority', e.target.value as TaskPriority)}
                    className="input-base"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>

                <div>
                  <label className="label-base">截止日期</label>
                  <input
                    type="date"
                    value={createForm.deadline}
                    onChange={(e) => updateField('deadline', e.target.value)}
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="label-base">目标故事数量</label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.targetStoryCount}
                    onChange={(e) =>
                      updateField('targetStoryCount', parseInt(e.target.value) || 1)
                    }
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="label-base">采集要求</label>
                <div className="space-y-3">
                  {createForm.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {createForm.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-cinnabar-50 text-cinnabar-700 border border-cinnabar-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                          {req}
                          <button
                            type="button"
                            onClick={() => removeRequirement(idx)}
                            className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-cinnabar-200/50 transition-colors"
                          >
                            <X className="w-3 h-3" strokeWidth={2.5} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement();
                        }
                      }}
                      placeholder="输入要求内容，回车或点击添加按钮"
                      className="input-base flex-1"
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cinnabar-500 text-white font-medium hover:bg-cinnabar-600 active:scale-[0.98] transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      添加
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="label-base">任务奖励</label>
                <input
                  type="text"
                  value={createForm.reward}
                  onChange={(e) => updateField('reward', e.target.value)}
                  placeholder="如：优秀稿件将推荐至首页展示（可选）"
                  className="input-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-rice-100">
              <button
                type="button"
                onClick={() => setActiveTab('open')}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                disabled={
                  !createForm.title.trim() ||
                  !createForm.description.trim() ||
                  createForm.targetStoryCount <= 0
                }
                className="btn-primary"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                发布任务
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-scroll-reveal" style={{ animationDelay: '100ms' }}>
          {displayTasks.length === 0 ? (
            <div className="card p-16 text-center">
              <ListChecks className="w-16 h-16 mx-auto mb-4 text-rice-300" strokeWidth={1.5} />
              <h3 className="font-serif text-xl font-bold text-ink-700 mb-2">
                {activeTab === 'open' ? '暂无开放任务' : '暂无任务'}
              </h3>
              <p className="text-sm text-ink-500">
                {activeTab === 'open'
                  ? '请稍后再来查看管理员发布的新任务'
                  : '去任务广场认领感兴趣的任务吧'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayTasks.map((task, idx) => {
                const priority = priorityConfig[task.priority];
                const status = statusConfig[task.status];
                const StatusIcon = status.icon;
                const category = task.categoryId ? categoryMap[task.categoryId] : null;
                const province = task.provinceId ? provinceMap[task.provinceId] : null;
                const progress = Math.min(
                  100,
                  (task.currentStoryCount / task.targetStoryCount) * 100
                );
                const isClaimed = task.claimedBy === currentUser?.id;
                const isCreator = task.creatorId === currentUser?.id;

                return (
                  <div
                    key={task.id}
                    className="card p-6 relative overflow-hidden animate-scroll-reveal"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {task.priority === 'urgent' && (
                      <div className="absolute -top-1 -right-1">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 transform rotate-45 translate-x-7 -translate-y-7 shadow-lg" />
                          <span className="absolute top-3 right-2 text-white text-xs font-bold rotate-12">
                            紧急
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                            priority.className
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', priority.dotClass)} />
                          {priority.label}优先级
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                            status.className
                          )}
                        >
                          <StatusIcon className="w-3 h-3" strokeWidth={2} />
                          {status.label}
                        </span>
                      </div>
                      {isClaimed && !isCreator && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-jade-50 text-jade-700 border border-jade-200">
                          <UserCheck className="w-3 h-3" strokeWidth={2} />
                          我认领的
                        </span>
                      )}
                      {isCreator && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gold-50 text-gold-700 border border-gold-200">
                          <Sparkles className="w-3 h-3" strokeWidth={2} />
                          我发布的
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-lg md:text-xl font-bold text-ink-900 mb-2 leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-sm text-ink-600 leading-relaxed mb-4 line-clamp-3">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-ink-500">
                      {category && (
                        <span className="inline-flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cinnabar-500" strokeWidth={2} />
                          <span>
                            {category.icon || '📚'} {category.name}
                          </span>
                        </span>
                      )}
                      {province && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cinnabar-500" strokeWidth={2} />
                          {province.name}
                        </span>
                      )}
                      {task.deadline && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cinnabar-500" strokeWidth={2} />
                          截止：{formatDate(task.deadline)}
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-ink-500 font-medium">采集进度</span>
                        <span className="text-xs font-bold text-cinnabar-600">
                          {task.currentStoryCount} / {task.targetStoryCount}
                        </span>
                      </div>
                      <div className="relative h-2.5 bg-rice-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
                            progress >= 100
                              ? 'bg-gradient-to-r from-jade-500 to-jade-600'
                              : 'bg-gradient-to-r from-cinnabar-500 to-gold-500'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {task.requirements.length > 0 && (
                      <div className="mb-4 p-3 rounded-xl bg-rice-50 border border-rice-200">
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-ink-700">
                          <ListChecks className="w-3.5 h-3.5 text-cinnabar-500" strokeWidth={2} />
                          采集要求
                        </div>
                        <ul className="space-y-1.5">
                          {task.requirements.map((req, i) => (
                            <li
                              key={i}
                              className="text-xs text-ink-600 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="inline-flex items-center justify-center w-4 h-4 shrink-0 mt-0.5 rounded-full bg-cinnabar-100 text-cinnabar-600 text-[10px] font-bold">
                                {i + 1}
                              </span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {task.reward && (
                      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-gold-50 to-cinnabar-50 border border-gold-200">
                        <div className="flex items-start gap-2">
                          <Trophy className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" strokeWidth={2} />
                          <div>
                            <p className="text-xs font-semibold text-gold-700 mb-0.5">任务奖励</p>
                            <p className="text-xs text-gold-800 leading-relaxed">{task.reward}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-rice-100">
                      {task.status === 'open' && !isAdmin && currentUser?.role === 'contributor' && (
                        <button
                          onClick={() => handleClaim(task.id)}
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cinnabar-500 to-cinnabar-600 text-white font-medium hover:shadow-chinese-lg hover:from-cinnabar-600 hover:to-cinnabar-700 active:scale-[0.98] transition-all duration-200"
                        >
                          <UserCheck className="w-4 h-4" strokeWidth={2} />
                          立即认领
                        </button>
                      )}
                      {task.status === 'open' && isAdmin && (
                        <div className="text-center text-sm text-ink-500 py-2">
                          等待贡献者认领
                        </div>
                      )}
                      {task.status === 'in_progress' && (
                        <div className="text-center text-sm text-amber-700 py-2 flex items-center justify-center gap-1.5">
                          <Clock className="w-4 h-4" strokeWidth={2} />
                          任务进行中，请努力完成目标
                        </div>
                      )}
                      {task.status === 'completed' && (
                        <div className="text-center text-sm text-jade-700 py-2 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                          🎉 任务已完成，感谢您的贡献
                        </div>
                      )}
                      {task.status === 'closed' && (
                        <div className="text-center text-sm text-ink-500 py-2 flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-4 h-4" strokeWidth={2} />
                          任务已关闭
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CollectionTasksPage() {
  return (
    <Layout>
      <RoleGate allowedRoles={['contributor', 'admin']}>
        <CollectionTasksContent />
      </RoleGate>
    </Layout>
  );
}
