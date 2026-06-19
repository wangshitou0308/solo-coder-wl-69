import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  UserRole,
  Category,
  Tag,
  Storyteller,
  Story,
  StoryStatus,
  ReviewRecord,
  Comment,
  UserInteraction,
  BrowseHistory,
  CollectionTask,
  TaskStatus,
  Badge,
  BadgeType,
  ShareRecord,
} from '../types';
import {
  users as seedUsers,
  categories as seedCategories,
  tags as seedTags,
  storytellers as seedStorytellers,
  stories as seedStories,
  reviewRecords as seedReviewRecords,
} from '../data/seed';

interface ContributorRanking {
  userId: string;
  username: string;
  count: number;
}

interface CategoryStat {
  name: string;
  value: number;
}

interface YearlyTrend {
  year: string;
  count: number;
}

interface ProvinceStat {
  name: string;
  count: number;
}

interface HotStoryRanking {
  story: Story;
  score: number;
  rank: number;
}

const badgeDefinitions: Record<BadgeType, Array<{ level: 1 | 2 | 3; target: number; name: string; desc: string; icon: string }>> = {
  story_count: [
    { level: 1, target: 5, name: '初出茅庐', desc: '投稿5篇故事', icon: '🌱' },
    { level: 2, target: 20, name: '勤奋采集者', desc: '投稿20篇故事', icon: '🌿' },
    { level: 3, target: 50, name: '文化守护者', desc: '投稿50篇故事', icon: '🌳' },
  ],
  approval_rate: [
    { level: 1, target: 70, name: '严谨新手', desc: '审核通过率70%以上', icon: '📝' },
    { level: 2, target: 85, name: '优质贡献者', desc: '审核通过率85%以上', icon: '✨' },
    { level: 3, target: 95, name: '金牌采集人', desc: '审核通过率95%以上', icon: '🏆' },
  ],
  region_coverage: [
    { level: 1, target: 3, name: '地方探索者', desc: '覆盖3个省份', icon: '🗺️' },
    { level: 2, target: 10, name: '足迹遍天下', desc: '覆盖10个省份', icon: '🧭' },
    { level: 3, target: 20, name: '文化行者', desc: '覆盖20个省份', icon: '🌍' },
  ],
  like_count: [
    { level: 1, target: 100, name: '小有人气', desc: '故事累计获赞100', icon: '👍' },
    { level: 2, target: 500, name: '人气王', desc: '故事累计获赞500', icon: '🌟' },
    { level: 3, target: 2000, name: '超级明星', desc: '故事累计获赞2000', icon: '💫' },
  ],
  collect_count: [
    { level: 1, target: 50, name: '值得收藏', desc: '故事累计被收藏50次', icon: '📚' },
    { level: 2, target: 200, name: '珍藏之作', desc: '故事累计被收藏200次', icon: '💎' },
    { level: 3, target: 500, name: '传世经典', desc: '故事累计被收藏500次', icon: '👑' },
  ],
  task_completion: [
    { level: 1, target: 3, name: '任务达人', desc: '完成3个采集任务', icon: '🎯' },
    { level: 2, target: 10, name: '任务专家', desc: '完成10个采集任务', icon: '🎖️' },
    { level: 3, target: 25, name: '传奇猎手', desc: '完成25个采集任务', icon: '🏅' },
  ],
};

interface AppState {
  users: User[];
  currentUser: User | null;
  categories: Category[];
  tags: Tag[];
  storytellers: Storyteller[];
  stories: Story[];
  reviewRecords: ReviewRecord[];
  comments: Comment[];
  userInteractions: UserInteraction[];
  browseHistories: BrowseHistory[];
  collectionTasks: CollectionTask[];
  badges: Badge[];
  shareRecords: ShareRecord[];

  setCurrentUser: (role: UserRole) => void;

  addStory: (
    story: Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'viewCount' | 'likeCount' | 'shareCount' | 'collectCount' | 'commentCount' | 'submittedAt'> & {
      status?: StoryStatus;
    }
  ) => string;
  updateStoryStatus: (id: string, status: StoryStatus, reviewerId?: string, comment?: string) => void;
  updateStory: (id: string, data: Partial<Story>) => void;
  incrementViewCount: (id: string) => void;

  toggleLike: (userId: string, storyId: string) => boolean;
  toggleCollect: (userId: string, storyId: string) => boolean;
  hasLiked: (userId: string, storyId: string) => boolean;
  hasCollected: (userId: string, storyId: string) => boolean;

  addBrowseHistory: (userId: string, storyId: string) => void;
  getBrowseHistories: (userId: string) => Array<{ history: BrowseHistory; story: Story }>;
  getCollectedStories: (userId: string) => Array<{ interaction: UserInteraction; story: Story }>;

  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likeCount'>) => Comment;
  toggleCommentLike: (commentId: string) => void;
  getCommentsByStoryId: (storyId: string) => Comment[];

  addStoryteller: (st: Omit<Storyteller, 'id' | 'createdAt' | 'updatedAt' | 'storyCount' | 'isVerified'> & {
    storyCount?: number;
    isVerified?: boolean;
  }) => Storyteller;
  updateStoryteller: (id: string, data: Partial<Storyteller>) => void;
  mergeStorytellers: (targetId: string, sourceIds: string[]) => void;

  addTag: (name: string) => Tag;
  mergeTags: (targetId: string, sourceIds: string[]) => void;
  updateTag: (id: string, data: Partial<Tag>) => void;

  addCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'storyCount'> & { storyCount?: number }) => Category;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addReview: (record: Omit<ReviewRecord, 'id'>) => void;

  createTask: (task: Omit<CollectionTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentStoryCount'>) => string;
  updateTask: (id: string, data: Partial<CollectionTask>) => void;
  claimTask: (taskId: string, userId: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getTasksByUserId: (userId: string) => CollectionTask[];
  getOpenTasks: () => CollectionTask[];

  checkAndAwardBadges: (userId: string) => Badge[];
  getBadgesByUserId: (userId: string) => Badge[];

  addShareRecord: (userId: string, storyId: string, channel: ShareRecord['channel']) => void;
  generateShareText: (story: Story) => string;

  getHotStories: (limit?: number) => HotStoryRanking[];

  getApprovedStories: () => Story[];
  getPendingStories: () => Story[];
  getRejectedStories: () => Story[];
  getDraftStories: (collectorId: string) => Story[];
  getStoryById: (id: string) => Story | undefined;
  getStorytellerById: (id: string) => Storyteller | undefined;
  getStoriesByStorytellerId: (storytellerId: string) => Story[];
  getStoriesByCollectorId: (collectorId: string) => Story[];
  searchStories: (params: {
    keyword?: string;
    provinceId?: string;
    cityId?: string;
    districtId?: string;
    categoryId?: string;
    categoryIds?: string[];
    tagIds?: string[];
    storytellerId?: string;
    status?: StoryStatus;
  }) => Story[];
  getContributorRanking: () => ContributorRanking[];
  getCategoryStats: () => CategoryStat[];
  getYearlyTrend: () => YearlyTrend[];
  getProvinceStats: () => ProvinceStat[];
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();

const seedComments: Comment[] = [
  {
    id: 'comment-001',
    storyId: 'story-001',
    userId: 'user-001',
    content: '这个故事太精彩了！小时候就听奶奶讲过类似的版本，再次听到真的很感动。',
    likeCount: 12,
    createdAt: '2024-05-10T08:30:00Z',
    updatedAt: '2024-05-10T08:30:00Z',
  },
  {
    id: 'comment-002',
    storyId: 'story-001',
    userId: 'user-002',
    parentId: 'comment-001',
    replyToUserId: 'user-001',
    content: '是啊，这种老故事听多少遍都不腻，感谢有人记录下来！',
    likeCount: 5,
    createdAt: '2024-05-10T10:15:00Z',
    updatedAt: '2024-05-10T10:15:00Z',
  },
  {
    id: 'comment-003',
    storyId: 'story-008',
    userId: 'user-001',
    content: '西湖的传说总是那么美，白蛇传更是经典中的经典。',
    likeCount: 8,
    createdAt: '2024-05-12T14:20:00Z',
    updatedAt: '2024-05-12T14:20:00Z',
  },
  {
    id: 'comment-004',
    storyId: 'story-013',
    userId: 'user-001',
    content: '孔子的故事教育意义深远，值得让更多的孩子知道。',
    likeCount: 15,
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-05-15T09:00:00Z',
  },
];

const seedTasks: CollectionTask[] = [
  {
    id: 'task-001',
    title: '黄河流域神话传说采集',
    description: '采集黄河流域地区的创世神话、英雄传说等口述故事，重点关注流传于陕西、山西、河南等省份的民间传说。',
    categoryId: 'cat-001',
    provinceId: 'shanxi',
    priority: 'high',
    deadline: '2024-12-31T23:59:59Z',
    targetStoryCount: 10,
    currentStoryCount: 3,
    status: 'open',
    creatorId: 'user-003',
    requirements: [
      '每个故事必须有完整的口述转录稿',
      '包含至少2段方言词汇注释',
      '记录讲述者的基本信息',
      '附带采集日期和地点',
    ],
    tags: ['神话', '黄河', '民间传说'],
    reward: '优秀稿件将推荐至首页展示',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'task-002',
    title: '西南地区少数民族节日习俗采集',
    description: '记录西南各少数民族（苗族、彝族、藏族、土家族等）的传统节日仪式、庆典习俗。',
    categoryId: 'cat-004',
    priority: 'medium',
    deadline: '2025-03-31T23:59:59Z',
    targetStoryCount: 15,
    currentStoryCount: 0,
    status: 'open',
    creatorId: 'user-003',
    requirements: [
      '详细记录节日的时间、流程和意义',
      '如有可能配照片或音频',
      '采访至少1位当地老人',
    ],
    tags: ['节日', '少数民族', '西南'],
    createdAt: '2024-06-05T08:00:00Z',
    updatedAt: '2024-06-05T08:00:00Z',
  },
  {
    id: 'task-003',
    title: '江南传统手工艺传承人口述',
    description: '采访江南地区苏绣、陶艺、木雕、竹编等非遗项目的传承艺人，记录他们的学艺经历和技艺心得。',
    categoryId: 'cat-008',
    provinceId: 'jiangsu',
    priority: 'urgent',
    deadline: '2024-10-31T23:59:59Z',
    targetStoryCount: 8,
    currentStoryCount: 2,
    status: 'in_progress',
    creatorId: 'user-003',
    claimedBy: 'user-002',
    claimedAt: '2024-06-10T14:30:00Z',
    requirements: [
      '必须包含传承人个人简介',
      '详细描述工艺流程',
      '记录传承人的担忧和期望',
    ],
    tags: ['非遗', '手工艺', '江南'],
    reward: '完成所有稿件可获得"文化守护者"徽章',
    createdAt: '2024-06-08T09:00:00Z',
    updatedAt: '2024-06-10T14:30:00Z',
  },
];

const seedInteractions: UserInteraction[] = [
  { id: 'int-001', userId: 'user-001', storyId: 'story-001', type: 'like', createdAt: '2024-05-10T09:00:00Z' },
  { id: 'int-002', userId: 'user-001', storyId: 'story-001', type: 'collect', createdAt: '2024-05-10T09:01:00Z' },
  { id: 'int-003', userId: 'user-001', storyId: 'story-008', type: 'like', createdAt: '2024-05-12T15:00:00Z' },
  { id: 'int-004', userId: 'user-001', storyId: 'story-013', type: 'collect', createdAt: '2024-05-15T10:00:00Z' },
  { id: 'int-005', userId: 'user-002', storyId: 'story-003', type: 'like', createdAt: '2024-05-20T11:00:00Z' },
];

const seedBrowseHistories: BrowseHistory[] = [
  { id: 'bh-001', userId: 'user-001', storyId: 'story-001', viewedAt: '2024-06-10T10:30:00Z' },
  { id: 'bh-002', userId: 'user-001', storyId: 'story-008', viewedAt: '2024-06-11T14:20:00Z' },
  { id: 'bh-003', userId: 'user-001', storyId: 'story-013', viewedAt: '2024-06-12T09:15:00Z' },
  { id: 'bh-004', userId: 'user-001', storyId: 'story-028', viewedAt: '2024-06-13T16:45:00Z' },
  { id: 'bh-005', userId: 'user-001', storyId: 'story-030', viewedAt: '2024-06-14T08:30:00Z' },
];

const seedBadges: Badge[] = [
  {
    id: 'badge-001',
    userId: 'user-002',
    type: 'story_count',
    name: '初出茅庐',
    description: '投稿5篇故事',
    icon: '🌱',
    level: 1,
    unlockedAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'badge-002',
    userId: 'user-002',
    type: 'approval_rate',
    name: '严谨新手',
    description: '审核通过率70%以上',
    icon: '📝',
    level: 1,
    unlockedAt: '2024-04-15T00:00:00Z',
  },
];

const updatedSeedStories = seedStories.map(s => ({
  ...s,
  status: (s.status === 'approved' ? 'approved' : 'pending') as StoryStatus,
}));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUser: seedUsers.find((u) => u.role === 'visitor') || seedUsers[0] || null,
      categories: seedCategories,
      tags: seedTags,
      storytellers: seedStorytellers,
      stories: updatedSeedStories,
      reviewRecords: seedReviewRecords,
      comments: seedComments,
      userInteractions: seedInteractions,
      browseHistories: seedBrowseHistories,
      collectionTasks: seedTasks,
      badges: seedBadges,
      shareRecords: [],

      setCurrentUser: (role) => {
        const { users } = get();
        const found = users.find((u) => u.role === role) || users[0] || null;
        set({ currentUser: found });
      },

      addStory: (story) => {
        const { tags, storytellers, currentUser } = get();
        const now = nowIso();
        const id = genId('s');
        const newStory: Story = {
          id,
          status: story.status ?? 'pending',
          viewCount: 0,
          likeCount: 0,
          shareCount: 0,
          collectCount: 0,
          commentCount: 0,
          submittedAt: story.status === 'draft' ? '' : now,
          createdAt: now,
          updatedAt: now,
          collectorId: currentUser?.id || story.collectorId || '',
          ...story,
        } as Story;

        const updatedTags = tags.map((t) =>
          newStory.tagIds.includes(t.id) ? { ...t, usageCount: t.usageCount + 1 } : t
        );

        const updatedStorytellers = storytellers.map((st) =>
          st.id === newStory.storytellerId
            ? { ...st, storyCount: st.storyCount + 1, updatedAt: now }
            : st
        );

        const updatedCategories = get().categories.map((c) =>
          c.id === newStory.categoryId && newStory.status === 'approved'
            ? { ...c, storyCount: c.storyCount + 1 }
            : c
        );

        let updatedTasks = get().collectionTasks;
        if (newStory.taskId) {
          updatedTasks = updatedTasks.map(t => {
            if (t.id === newStory.taskId) {
              const newCount = t.currentStoryCount + 1;
              const newStatus = newCount >= t.targetStoryCount ? 'completed' as TaskStatus : t.status;
              return { ...t, currentStoryCount: newCount, status: newStatus, updatedAt: now };
            }
            return t;
          });
        }

        set({
          stories: [newStory, ...get().stories],
          tags: updatedTags,
          storytellers: updatedStorytellers,
          categories: updatedCategories,
          collectionTasks: updatedTasks,
        });

        if (currentUser && newStory.status !== 'draft') {
          setTimeout(() => get().checkAndAwardBadges(currentUser.id), 100);
        }

        return id;
      },

      updateStory: (id, data) => {
        const now = nowIso();
        set({
          stories: get().stories.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: now } : s
          ),
        });
      },

      updateStoryStatus: (id, status, reviewerId, comment) => {
        const { stories, categories, currentUser } = get();
        const now = nowIso();
        const reviewer = reviewerId || currentUser?.id || '';

        const updated = stories.map((s) => {
          if (s.id !== id) return s;
          const previousStatus = s.status;
          if (previousStatus !== 'approved' && status === 'approved') {
            const cat = get().categories.find((c) => c.id === s.categoryId);
            if (cat) {
              set({
                categories: get().categories.map((c) =>
                  c.id === s.categoryId ? { ...c, storyCount: c.storyCount + 1 } : c
                ),
              });
            }
          }
          if (previousStatus === 'approved' && status !== 'approved') {
            set({
              categories: get().categories.map((c) =>
                c.id === s.categoryId && c.storyCount > 0
                  ? { ...c, storyCount: c.storyCount - 1 }
                  : c
              ),
            });
          }
          return {
            ...s,
            status,
            reviewedAt: now,
            reviewerId: reviewer,
            reviewComment: comment,
            submittedAt: status === 'pending' && previousStatus === 'draft' ? now : s.submittedAt,
            updatedAt: now,
          };
        });

        set({ stories: updated });

        const targetStory = get().stories.find((s) => s.id === id);
        if (targetStory && (status === 'approved' || status === 'rejected')) {
          get().addReview({
            storyId: id,
            reviewerId: reviewer,
            previousStatus: targetStory.status,
            newStatus: status,
            comment: comment || '',
            reviewedAt: now,
          });
          setTimeout(() => get().checkAndAwardBadges(targetStory.collectorId), 100);
        }
      },

      incrementViewCount: (id) => {
        set({
          stories: get().stories.map((s) =>
            s.id === id ? { ...s, viewCount: s.viewCount + 1 } : s
          ),
        });
      },

      toggleLike: (userId, storyId) => {
        const { userInteractions, stories } = get();
        const existing = userInteractions.find(
          (i) => i.userId === userId && i.storyId === storyId && i.type === 'like'
        );
        if (existing) {
          set({
            userInteractions: userInteractions.filter((i) => i.id !== existing.id),
            stories: stories.map((s) =>
              s.id === storyId ? { ...s, likeCount: Math.max(0, s.likeCount - 1) } : s
            ),
          });
          return false;
        } else {
          const newInt: UserInteraction = {
            id: genId('int'),
            userId,
            storyId,
            type: 'like',
            createdAt: nowIso(),
          };
          set({
            userInteractions: [...userInteractions, newInt],
            stories: stories.map((s) =>
              s.id === storyId ? { ...s, likeCount: s.likeCount + 1 } : s
            ),
          });
          return true;
        }
      },

      toggleCollect: (userId, storyId) => {
        const { userInteractions, stories } = get();
        const existing = userInteractions.find(
          (i) => i.userId === userId && i.storyId === storyId && i.type === 'collect'
        );
        if (existing) {
          set({
            userInteractions: userInteractions.filter((i) => i.id !== existing.id),
            stories: stories.map((s) =>
              s.id === storyId ? { ...s, collectCount: Math.max(0, s.collectCount - 1) } : s
            ),
          });
          return false;
        } else {
          const newInt: UserInteraction = {
            id: genId('int'),
            userId,
            storyId,
            type: 'collect',
            createdAt: nowIso(),
          };
          set({
            userInteractions: [...userInteractions, newInt],
            stories: stories.map((s) =>
              s.id === storyId ? { ...s, collectCount: s.collectCount + 1 } : s
            ),
          });
          return true;
        }
      },

      hasLiked: (userId, storyId) => {
        return get().userInteractions.some(
          (i) => i.userId === userId && i.storyId === storyId && i.type === 'like'
        );
      },

      hasCollected: (userId, storyId) => {
        return get().userInteractions.some(
          (i) => i.userId === userId && i.storyId === storyId && i.type === 'collect'
        );
      },

      addBrowseHistory: (userId, storyId) => {
        const { browseHistories } = get();
        const existing = browseHistories.find(
          (h) => h.userId === userId && h.storyId === storyId
        );
        const now = nowIso();
        if (existing) {
          set({
            browseHistories: [
              { ...existing, viewedAt: now },
              ...browseHistories.filter((h) => h.id !== existing.id),
            ].slice(0, 100),
          });
        } else {
          const newHistory: BrowseHistory = {
            id: genId('bh'),
            userId,
            storyId,
            viewedAt: now,
          };
          set({
            browseHistories: [newHistory, ...browseHistories].slice(0, 100),
          });
        }
      },

      getBrowseHistories: (userId) => {
        const { browseHistories, stories } = get();
        return browseHistories
          .filter((h) => h.userId === userId)
          .map((h) => ({
            history: h,
            story: stories.find((s) => s.id === h.storyId)!,
          }))
          .filter((x) => x.story)
          .sort((a, b) => b.history.viewedAt.localeCompare(a.history.viewedAt));
      },

      getCollectedStories: (userId) => {
        const { userInteractions, stories } = get();
        return userInteractions
          .filter((i) => i.userId === userId && i.type === 'collect')
          .map((i) => ({
            interaction: i,
            story: stories.find((s) => s.id === i.storyId)!,
          }))
          .filter((x) => x.story)
          .sort((a, b) => b.interaction.createdAt.localeCompare(a.interaction.createdAt));
      },

      addComment: (comment) => {
        const now = nowIso();
        const id = genId('cm');
        const newComment: Comment = {
          id,
          likeCount: 0,
          createdAt: now,
          updatedAt: now,
          ...comment,
        };
        set({
          comments: [...get().comments, newComment],
          stories: get().stories.map((s) =>
            s.id === comment.storyId ? { ...s, commentCount: s.commentCount + 1 } : s
          ),
        });
        return newComment;
      },

      toggleCommentLike: (commentId) => {
        set({
          comments: get().comments.map((c) =>
            c.id === commentId ? { ...c, likeCount: c.likeCount + 1 } : c
          ),
        });
      },

      getCommentsByStoryId: (storyId) => {
        return get().comments
          .filter((c) => c.storyId === storyId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },

      addStoryteller: (st) => {
        const now = nowIso();
        const newSt: Storyteller = {
          id: genId('st'),
          storyCount: st.storyCount ?? 0,
          isVerified: st.isVerified ?? false,
          createdAt: now,
          updatedAt: now,
          ...st,
        } as Storyteller;
        set({ storytellers: [...get().storytellers, newSt] });
        return newSt;
      },

      updateStoryteller: (id, data) => {
        const now = nowIso();
        set({
          storytellers: get().storytellers.map((st) =>
            st.id === id ? { ...st, ...data, updatedAt: now } : st
          ),
        });
      },

      mergeStorytellers: (targetId, sourceIds) => {
        const { storytellers, stories } = get();
        const target = storytellers.find((st) => st.id === targetId);
        if (!target) return;

        let totalCount = target.storyCount;
        const mergedSpecialties = new Set(target.specialties);

        sourceIds.forEach((sid) => {
          const src = storytellers.find((st) => st.id === sid);
          if (src) {
            totalCount += src.storyCount;
            src.specialties.forEach((s) => mergedSpecialties.add(s));
          }
        });

        const updatedStorytellers = storytellers
          .map((st) => {
            if (st.id === targetId) {
              return {
                ...st,
                storyCount: totalCount,
                specialties: Array.from(mergedSpecialties),
                updatedAt: nowIso(),
              };
            }
            return st;
          })
          .filter((st) => !sourceIds.includes(st.id));

        const updatedStories = stories.map((s) =>
          sourceIds.includes(s.storytellerId) ? { ...s, storytellerId: targetId, updatedAt: nowIso() } : s
        );

        set({ storytellers: updatedStorytellers, stories: updatedStories });
      },

      addTag: (name) => {
        const { tags } = get();
        const existing = tags.find((t) => t.name === name.trim());
        if (existing) return existing;
        const colors = [
          '#C8102E', '#3A7D44', '#B8860B', '#4A6FA5',
          '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
        ];
        const newTag: Tag = {
          id: genId('t'),
          name: name.trim(),
          usageCount: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          createdAt: nowIso(),
        };
        set({ tags: [...tags, newTag] });
        return newTag;
      },

      updateTag: (id, data) => {
        set({
          tags: get().tags.map((t) => (t.id === id ? { ...t, ...data } : t)),
        });
      },

      mergeTags: (targetId, sourceIds) => {
        const { tags, stories } = get();
        const target = tags.find((t) => t.id === targetId);
        if (!target) return;

        let totalUsage = target.usageCount;
        sourceIds.forEach((sid) => {
          const src = tags.find((t) => t.id === sid);
          if (src) totalUsage += src.usageCount;
        });

        const updatedTags = tags
          .map((t) => (t.id === targetId ? { ...t, usageCount: totalUsage } : t))
          .filter((t) => !sourceIds.includes(t.id));

        const updatedStories = stories.map((s) => {
          const hasSource = s.tagIds.some((tid) => sourceIds.includes(tid));
          if (!hasSource) return s;
          const newTagIds = Array.from(
            new Set([...s.tagIds.filter((tid) => !sourceIds.includes(tid)), targetId])
          );
          return { ...s, tagIds: newTagIds, updatedAt: nowIso() };
        });

        set({ tags: updatedTags, stories: updatedStories });
      },

      addCategory: (cat) => {
        const newCat: Category = {
          id: genId('c'),
          storyCount: cat.storyCount ?? 0,
          createdAt: nowIso(),
          ...cat,
        } as Category;
        set({ categories: [...get().categories, newCat] });
        return newCat;
      },

      updateCategory: (id, data) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        });
      },

      deleteCategory: (id) => {
        set({
          categories: get().categories.filter((c) => c.id !== id),
        });
      },

      addReview: (record) => {
        const newRecord: ReviewRecord = {
          id: genId('r'),
          ...record,
        };
        set({ reviewRecords: [...get().reviewRecords, newRecord] });
      },

      createTask: (task) => {
        const now = nowIso();
        const id = genId('task');
        const newTask: CollectionTask = {
          id,
          status: 'open',
          currentStoryCount: 0,
          createdAt: now,
          updatedAt: now,
          ...task,
        };
        set({ collectionTasks: [...get().collectionTasks, newTask] });
        return id;
      },

      updateTask: (id, data) => {
        const now = nowIso();
        set({
          collectionTasks: get().collectionTasks.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: now } : t
          ),
        });
      },

      claimTask: (taskId, userId) => {
        const now = nowIso();
        set({
          collectionTasks: get().collectionTasks.map((t) =>
            t.id === taskId
              ? { ...t, claimedBy: userId, claimedAt: now, status: 'in_progress' as TaskStatus, updatedAt: now }
              : t
          ),
        });
      },

      updateTaskStatus: (id, status) => {
        const now = nowIso();
        set({
          collectionTasks: get().collectionTasks.map((t) =>
            t.id === id ? { ...t, status, updatedAt: now } : t
          ),
        });
      },

      getTasksByUserId: (userId) => {
        return get().collectionTasks.filter(
          (t) => t.claimedBy === userId || t.creatorId === userId
        );
      },

      getOpenTasks: () => {
        return get().collectionTasks
          .filter((t) => t.status === 'open')
          .sort((a, b) => {
            const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
      },

      checkAndAwardBadges: (userId) => {
        const { stories, userInteractions, collectionTasks, badges } = get();
        const userStories = stories.filter((s) => s.collectorId === userId);
        const approvedStories = userStories.filter((s) => s.status === 'approved');
        const totalStories = userStories.length;
        const approvedCount = approvedStories.length;
        const approvalRate = totalStories > 0 ? (approvedCount / totalStories) * 100 : 0;
        const coveredProvinces = new Set(
          approvedStories.filter((s) => s.provinceId).map((s) => s.provinceId)
        ).size;
        const totalLikes = approvedStories.reduce((sum, s) => sum + s.likeCount, 0);
        const totalCollects = approvedStories.reduce((sum, s) => sum + s.collectCount, 0);
        const completedTasks = collectionTasks.filter(
          (t) => t.status === 'completed' && t.claimedBy === userId
        ).length;

        const stats: Record<BadgeType, number> = {
          story_count: approvedCount,
          approval_rate: approvalRate,
          region_coverage: coveredProvinces,
          like_count: totalLikes,
          collect_count: totalCollects,
          task_completion: completedTasks,
        };

        const newBadges: Badge[] = [];
        const existingBadges = badges.filter((b) => b.userId === userId);
        const now = nowIso();

        (Object.keys(badgeDefinitions) as BadgeType[]).forEach((type) => {
          const defs = badgeDefinitions[type];
          const currentValue = stats[type];
          const userBadgesOfType = existingBadges.filter((b) => b.type === type);

          defs.forEach((def) => {
            const alreadyHas = userBadgesOfType.some((b) => b.level === def.level);
            if (!alreadyHas && currentValue >= def.target) {
              newBadges.push({
                id: genId('badge'),
                userId,
                type,
                name: def.name,
                description: def.desc,
                icon: def.icon,
                level: def.level,
                unlockedAt: now,
              });
            }
          });
        });

        if (newBadges.length > 0) {
          set({ badges: [...badges, ...newBadges] });
        }

        return newBadges;
      },

      getBadgesByUserId: (userId) => {
        return get().badges.filter((b) => b.userId === userId);
      },

      addShareRecord: (userId, storyId, channel) => {
        const { shareRecords, stories } = get();
        set({
          shareRecords: [
            { id: genId('sr'), userId, storyId, channel, createdAt: nowIso() },
            ...shareRecords,
          ],
          stories: stories.map((s) =>
            s.id === storyId ? { ...s, shareCount: s.shareCount + 1 } : s
          ),
        });
      },

      generateShareText: (story) => {
        const { categories, storytellers } = get();
        const category = categories.find((c) => c.id === story.categoryId);
        const storyteller = storytellers.find((st) => st.id === story.storytellerId);
        return `【口述历史】《${story.title}》${story.subtitle ? `——${story.subtitle}` : ''}\n\n${story.summary.slice(0, 80)}${story.summary.length > 80 ? '...' : ''}\n\n分类：${category?.name || '未分类'}\n讲述者：${storyteller?.name || '匿名'}\n${story.recordingDate ? `采集日期：${story.recordingDate}\n` : ''}\n浏览：${story.viewCount}次 · 点赞：${story.likeCount}次 · 收藏：${story.collectCount}次\n\n——来自口述历史档案库，传承文化薪火相传`;
      },

      getHotStories: (limit = 10) => {
        const approvedStories = get().getApprovedStories();
        const ranked = approvedStories.map((story) => {
          const score =
            story.viewCount * 1 +
            story.likeCount * 5 +
            story.collectCount * 10 +
            story.commentCount * 8 +
            story.shareCount * 3;
          return { story, score, rank: 0 };
        });
        ranked.sort((a, b) => b.score - a.score);
        return ranked.slice(0, limit).map((x, i) => ({ ...x, rank: i + 1 }));
      },

      getApprovedStories: () => get().stories.filter((s) => s.status === 'approved'),
      getPendingStories: () => get().stories.filter((s) => s.status === 'pending'),
      getRejectedStories: () => get().stories.filter((s) => s.status === 'rejected'),
      getDraftStories: (collectorId) =>
        get().stories.filter((s) => s.status === 'draft' && s.collectorId === collectorId),
      getStoryById: (id) => get().stories.find((s) => s.id === id),
      getStorytellerById: (id) => get().storytellers.find((st) => st.id === id),
      getStoriesByStorytellerId: (storytellerId) =>
        get()
          .stories.filter((s) => s.storytellerId === storytellerId && s.status === 'approved')
          .sort((a, b) => (b.recordingDate || '').localeCompare(a.recordingDate || '')),
      getStoriesByCollectorId: (collectorId) =>
        get()
          .stories.filter((s) => s.collectorId === collectorId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      searchStories: ({ keyword, provinceId, cityId, districtId, categoryId, categoryIds, tagIds, storytellerId, status = 'approved' as StoryStatus }) => {
        const { stories, storytellers, tags, categories } = get();
        const kw = (keyword || '').trim().toLowerCase();
        const effectiveCategoryIds = categoryIds && categoryIds.length > 0
          ? categoryIds
          : categoryId ? [categoryId] : [];
        return stories.filter((s) => {
          if (status && s.status !== status) return false;
          if (provinceId && s.provinceId !== provinceId) return false;
          if (cityId && s.cityId !== cityId) return false;
          if (districtId && s.districtId !== districtId) return false;
          if (effectiveCategoryIds.length > 0 && !effectiveCategoryIds.includes(s.categoryId)) return false;
          if (storytellerId && s.storytellerId !== storytellerId) return false;
          if (tagIds && tagIds.length > 0) {
            const hasAll = tagIds.every((tid) => s.tagIds.includes(tid));
            if (!hasAll) return false;
          }
          if (kw) {
            const st = storytellers.find((x) => x.id === s.storytellerId);
            const cat = categories.find((c) => c.id === s.categoryId);
            const tagNames = s.tagIds
              .map((tid) => tags.find((t) => t.id === tid)?.name || '')
              .join(' ');
            const haystack = [
              s.title,
              s.subtitle || '',
              s.summary,
              st?.name || '',
              cat?.name || '',
              s.recordingLocation || '',
              tagNames,
              s.keywords.join(' '),
            ]
              .join(' ')
              .toLowerCase();
            if (!haystack.includes(kw)) return false;
          }
          return true;
        });
      },
      getContributorRanking: () => {
        const { stories, users } = get();
        const countMap: Record<string, number> = {};
        stories
          .filter((s) => s.status === 'approved')
          .forEach((s) => {
            countMap[s.collectorId] = (countMap[s.collectorId] || 0) + 1;
          });
        return Object.entries(countMap)
          .map(([userId, count]) => {
            const user = users.find((u) => u.id === userId);
            return { userId, username: user?.username || '未知用户', count };
          })
          .sort((a, b) => b.count - a.count);
      },
      getCategoryStats: () => {
        const { stories, categories } = get();
        const countMap: Record<string, number> = {};
        stories
          .filter((s) => s.status === 'approved')
          .forEach((s) => {
            countMap[s.categoryId] = (countMap[s.categoryId] || 0) + 1;
          });
        return categories.map((c) => ({
          name: c.name,
          value: countMap[c.id] || 0,
        }));
      },
      getYearlyTrend: () => {
        const { stories } = get();
        const countMap: Record<string, number> = {};
        stories
          .filter((s) => s.status === 'approved' && s.recordingDate)
          .forEach((s) => {
            const year = s.recordingDate!.slice(0, 4);
            countMap[year] = (countMap[year] || 0) + 1;
          });
        return Object.entries(countMap)
          .map(([year, count]) => ({ year, count }))
          .sort((a, b) => a.year.localeCompare(b.year));
      },
      getProvinceStats: () => {
        const { stories } = get();
        const countMap: Record<string, number> = {};
        stories
          .filter((s) => s.status === 'approved')
          .forEach((s) => {
            const key = s.provinceId || '未知';
            countMap[key] = (countMap[key] || 0) + 1;
          });
        return Object.entries(countMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
      },
    }),
    {
      name: 'oral-history-store',
    }
  )
);
