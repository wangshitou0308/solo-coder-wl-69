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

export type StoryStatus = 'pending' | 'approved' | 'rejected';

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
