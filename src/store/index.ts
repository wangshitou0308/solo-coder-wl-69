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

interface AppState {
  users: User[];
  currentUser: User | null;
  categories: Category[];
  tags: Tag[];
  storytellers: Storyteller[];
  stories: Story[];
  reviewRecords: ReviewRecord[];

  setCurrentUser: (role: UserRole) => void;

  addStory: (
    story: Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'viewCount' | 'likeCount' | 'shareCount' | 'collectCount' | 'commentCount' | 'submittedAt'> & {
      status?: StoryStatus;
    }
  ) => void;
  updateStoryStatus: (id: string, status: StoryStatus, reviewerId?: string, comment?: string) => void;
  updateStory: (id: string, data: Partial<Story>) => void;

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

  getApprovedStories: () => Story[];
  getPendingStories: () => Story[];
  getRejectedStories: () => Story[];
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUser: seedUsers.find((u) => u.role === 'visitor') || seedUsers[0] || null,
      categories: seedCategories,
      tags: seedTags,
      storytellers: seedStorytellers,
      stories: seedStories,
      reviewRecords: seedReviewRecords,

      setCurrentUser: (role) => {
        const { users } = get();
        const found = users.find((u) => u.role === role) || users[0] || null;
        set({ currentUser: found });
      },

      addStory: (story) => {
        const { tags, storytellers, currentUser } = get();
        const now = nowIso();
        const newStory: Story = {
          id: genId('s'),
          status: story.status ?? 'pending',
          viewCount: 0,
          likeCount: 0,
          shareCount: 0,
          collectCount: 0,
          commentCount: 0,
          submittedAt: now,
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

        set({
          stories: [newStory, ...get().stories],
          tags: updatedTags,
          storytellers: updatedStorytellers,
          categories: updatedCategories,
        });
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
        }
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

      getApprovedStories: () => get().stories.filter((s) => s.status === 'approved'),

      getPendingStories: () => get().stories.filter((s) => s.status === 'pending'),

      getRejectedStories: () => get().stories.filter((s) => s.status === 'rejected'),

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

      searchStories: ({ keyword, provinceId, cityId, districtId, categoryId, tagIds, storytellerId, status = 'approved' as StoryStatus }) => {
        const { stories, storytellers, tags, categories } = get();
        const kw = (keyword || '').trim().toLowerCase();
        return stories.filter((s) => {
          if (status && s.status !== status) return false;
          if (provinceId && s.provinceId !== provinceId) return false;
          if (cityId && s.cityId !== cityId) return false;
          if (districtId && s.districtId !== districtId) return false;
          if (categoryId && s.categoryId !== categoryId) return false;
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
