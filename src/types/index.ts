export type UserRole = 'visitor' | 'contributor' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export type StoryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  sort: number;
  storyCount: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

export interface Storyteller {
  id: string;
  name: string;
  avatar?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  ethnicity?: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  address?: string;
  occupation?: string;
  education?: string;
  specialties: string[];
  yearsOfExperience: number;
  bio: string;
  contactPhone?: string;
  storyCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryParagraph {
  id: string;
  order: number;
  content: string;
  audioUrl?: string;
  videoUrl?: string;
}

export interface DialectNote {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  example?: string;
  region?: string;
  paragraphId: string;
}

export interface Story {
  id: string;
  title: string;
  subtitle?: string;
  categoryId: string;
  storytellerId: string;
  collectorId: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  coverImage?: string;
  summary: string;
  paragraphs: StoryParagraph[];
  dialectNotes: DialectNote[];
  tagIds: string[];
  keywords: string[];
  sourceType: 'interview' | 'document' | 'inheritance' | 'other';
  oralYear?: string;
  recordingDate?: string;
  recordingLocation?: string;
  taskId?: string;
  status: StoryStatus;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  collectCount: number;
  commentCount: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRecord {
  id: string;
  storyId: string;
  reviewerId: string;
  previousStatus: StoryStatus;
  newStatus: StoryStatus;
  comment: string;
  reviewedAt: string;
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  parentId?: string;
  replyToUserId?: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserInteraction {
  id: string;
  userId: string;
  storyId: string;
  type: 'like' | 'collect';
  createdAt: string;
}

export interface BrowseHistory {
  id: string;
  userId: string;
  storyId: string;
  viewedAt: string;
}

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'closed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CollectionTask {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  priority: TaskPriority;
  deadline?: string;
  targetStoryCount: number;
  currentStoryCount: number;
  status: TaskStatus;
  creatorId: string;
  claimedBy?: string;
  claimedAt?: string;
  requirements: string[];
  tags: string[];
  reward?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  userId: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  level: 1 | 2 | 3;
  unlockedAt: string;
  progress?: number;
  target?: number;
}

export type BadgeType =
  | 'story_count'
  | 'approval_rate'
  | 'region_coverage'
  | 'like_count'
  | 'collect_count'
  | 'task_completion';

export interface ShareRecord {
  id: string;
  userId: string;
  storyId: string;
  channel: 'link' | 'copy' | 'other';
  createdAt: string;
}
