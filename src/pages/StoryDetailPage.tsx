import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  FileText,
  UserCircle,
  BadgeCheck,
  Briefcase,
  Sparkles,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Eye,
} from 'lucide-react';
import Layout from '@/components/Layout';
import AudioPlayer, { AudioParagraph } from '@/components/AudioPlayer';
import StoryCard from '@/components/StoryCard';
import CommentSection from '@/components/CommentSection';
import SharePanel from '@/components/SharePanel';
import { useAppStore } from '@/store';
import type { DialectNote, StoryParagraph } from '@/types';
import { cn } from '@/lib/utils';
import { provinces } from '@/data/location';

function getLocationName(provinceId?: string, cityId?: string, districtId?: string): string {
  if (!provinceId) return '';
  const province = provinces.find((p) => p.id === provinceId);
  if (!province) return '';
  const parts = [province.name];
  if (cityId) {
    const city = province.cities.find((c) => c.id === cityId);
    if (city) {
      parts.push(city.name);
      if (districtId) {
        const district = city.districts.find((d) => d.id === districtId);
        if (district) parts.push(district.name);
      }
    }
  }
  return parts.join(' · ');
}

function highlightDialectWords(content: string, notes: DialectNote[]) {
  if (notes.length === 0) return [{ text: content, note: null as DialectNote | null }];

  const segments: { text: string; note: DialectNote | null }[] = [];
  let remaining = content;

  const sortedNotes = [...notes].sort(
    (a, b) => content.indexOf(b.word) - content.indexOf(a.word)
  );

  const usedIndices = new Set<number>();
  for (const note of sortedNotes) {
    const idx = remaining.lastIndexOf(note.word);
    if (idx !== -1 && !usedIndices.has(idx)) {
      usedIndices.add(idx);
      const after = remaining.slice(idx + note.word.length);
      const word = remaining.slice(idx, idx + note.word.length);
      const before = remaining.slice(0, idx);
      if (after) segments.unshift({ text: after, note: null });
      segments.unshift({ text: word, note });
      remaining = before;
    }
  }
  if (remaining) segments.unshift({ text: remaining, note: null });

  if (segments.length === 0) return [{ text: content, note: null }];
  return segments;
}

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const getStoryById = useAppStore((s) => s.getStoryById);
  const getStorytellerById = useAppStore((s) => s.getStorytellerById);
  const categories = useAppStore((s) => s.categories);
  const tags = useAppStore((s) => s.tags);
  const getApprovedStories = useAppStore((s) => s.getApprovedStories);
  const currentUser = useAppStore((s) => s.currentUser);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleCollect = useAppStore((s) => s.toggleCollect);
  const hasLiked = useAppStore((s) => s.hasLiked);
  const hasCollected = useAppStore((s) => s.hasCollected);
  const incrementViewCount = useAppStore((s) => s.incrementViewCount);
  const addBrowseHistory = useAppStore((s) => s.addBrowseHistory);

  const story = id ? getStoryById(id) : undefined;
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<DialectNote | null>(null);
  const [hoveredNoteEl, setHoveredNoteEl] = useState<{ x: number; y: number } | null>(null);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);

  const storyteller = story ? getStorytellerById(story.storytellerId) : undefined;
  const category = story ? categories.find((c) => c.id === story.categoryId) : undefined;

  const storyTags = useMemo(() => {
    if (!story) return [];
    return story.tagIds
      .map((tid) => tags.find((t) => t.id === tid))
      .filter(Boolean)
      .map((t) => t!);
  }, [story, tags]);

  const audioParagraphs: AudioParagraph[] = useMemo(() => {
    if (!story) return [];
    return story.paragraphs.map((p: StoryParagraph) => ({
      id: p.id,
      order: p.order,
      content: p.content,
      startTime: p.order * 30,
    }));
  }, [story]);

  const relatedStories = useMemo(() => {
    if (!story) return [];
    return getApprovedStories()
      .filter(
        (s) => s.id !== story.id && s.categoryId === story.categoryId && s.status === 'approved'
      )
      .slice(0, 3);
  }, [story, getApprovedStories]);

  const dialectNotesByParagraph = useMemo(() => {
    const map: Record<string, DialectNote[]> = {};
    if (story) {
      story.dialectNotes.forEach((note) => {
        if (!map[note.paragraphId]) map[note.paragraphId] = [];
        map[note.paragraphId].push(note);
      });
    }
    return map;
  }, [story]);

  useEffect(() => {
    if (story && currentUser) {
      incrementViewCount(story.id);
      addBrowseHistory(currentUser.id, story.id);
    }
  }, []);

  if (!story) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center py-20">
          <div className="card max-w-lg w-full p-10 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cinnabar-50 opacity-60" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-gold-50 opacity-60" />
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cinnabar-100 to-gold-100 border-4 border-white shadow-chinese flex items-center justify-center">
                  <FileText className="w-12 h-12 text-cinnabar-600" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="font-serif text-3xl font-bold text-ink-900 mb-3">故事未找到</h2>
              <p className="text-ink-500 mb-8 leading-relaxed">
                您访问的故事可能不存在、尚未审核通过，或已被删除。
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cinnabar-500 to-cinnabar-600 text-white font-medium hover:shadow-chinese-lg hover:from-cinnabar-600 hover:to-cinnabar-700 active:scale-[0.98] transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                返回首页浏览
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const sortedParagraphs = [...story.paragraphs].sort((a, b) => a.order - b.order);

  return (
    <Layout>
      <div className="mb-6 animate-scroll-reveal">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-cinnabar-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          返回故事列表
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <section className="animate-scroll-reveal">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink-900 leading-tight mb-3">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="text-xl md:text-2xl text-ink-500 font-serif mb-6">
                {story.subtitle}
              </p>
            )}

            {storyteller && (
              <div className="card p-5 mb-6">
                <Link
                  to={`/storyteller/${storyteller.id}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full border-2 border-gold-400 p-0.5 bg-gradient-to-br from-gold-100 to-rice-100 shadow-gold">
                      {storyteller.avatar ? (
                        <img
                          src={storyteller.avatar}
                          alt={storyteller.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-rice-200 flex items-center justify-center text-ink-400">
                          <User className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    {storyteller.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border-2 border-cinnabar-500 flex items-center justify-center">
                        <BadgeCheck className="w-4 h-4 text-cinnabar-600" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-serif text-xl font-bold text-ink-900 group-hover:text-cinnabar-600 transition-colors">
                        {storyteller.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-ink-500">
                      <span className="flex items-center gap-1">
                        <UserCircle className="w-3.5 h-3.5" />
                        {storyteller.age}岁 · {storyteller.gender === 'male' ? '男' : storyteller.gender === 'female' ? '女' : '其他'}
                      </span>
                      {storyteller.occupation && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {storyteller.occupation}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-cinnabar-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    查看讲述者
                    <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={2} />
                  </div>
                </Link>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {story.recordingDate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rice-100 text-ink-600">
                  <Calendar className="w-4 h-4 text-cinnabar-600" />
                  采集于 {new Date(story.recordingDate).toLocaleDateString('zh-CN')}
                </span>
              )}
              {story.recordingLocation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rice-100 text-ink-600">
                  <MapPin className="w-4 h-4 text-cinnabar-600" />
                  {story.recordingLocation}
                </span>
              )}
              {!story.recordingLocation && (story.provinceId || story.cityId) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rice-100 text-ink-600">
                  <MapPin className="w-4 h-4 text-cinnabar-600" />
                  {getLocationName(story.provinceId, story.cityId, story.districtId)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {category && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-cinnabar-300 bg-cinnabar-50 text-cinnabar-700 text-sm font-medium">
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </span>
              )}
              {storyTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: tag.color + '18',
                    color: tag.color,
                    border: `1px solid ${tag.color}40`,
                  }}
                >
                  # {tag.name}
                </span>
              ))}
              {story.keywords.slice(0, 5).map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gold-50 border border-gold-200 text-gold-700 text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  {kw}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-6 p-4 rounded-2xl bg-gradient-to-r from-cinnabar-50/80 to-gold-50/80 border border-cinnabar-100">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 text-ink-600">
                <Eye className="w-4 h-4 text-cinnabar-600" />
                <span className="font-medium">{story.viewCount}</span>
              </span>
              <button
                type="button"
                onClick={() => currentUser && toggleLike(currentUser.id, story.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-sm',
                  currentUser && hasLiked(currentUser.id, story.id)
                    ? 'bg-white text-cinnabar-600 hover:bg-cinnabar-50'
                    : 'bg-white/80 text-ink-600 hover:bg-white hover:text-cinnabar-600'
                )}
              >
                <Heart
                  className={cn('w-4 h-4', currentUser && hasLiked(currentUser.id, story.id) && 'fill-current')}
                />
                <span className="font-medium">{story.likeCount}</span>
              </button>
              <button
                type="button"
                onClick={() => currentUser && toggleCollect(currentUser.id, story.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-sm',
                  currentUser && hasCollected(currentUser.id, story.id)
                    ? 'bg-white text-gold-600 hover:bg-gold-50'
                    : 'bg-white/80 text-ink-600 hover:bg-white hover:text-gold-600'
                )}
              >
                <Bookmark
                  className={cn('w-4 h-4', currentUser && hasCollected(currentUser.id, story.id) && 'fill-current text-gold-600')}
                />
                <span className="font-medium">{story.collectCount}</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 text-ink-600 hover:bg-white hover:text-cinnabar-600 transition-all duration-200 hover:shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{story.commentCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setSharePanelOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 text-ink-600 hover:bg-white hover:text-cinnabar-600 transition-all duration-200 hover:shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-medium">分享</span>
              </button>
            </div>
          </section>

          <section className="animate-scroll-reveal" style={{ animationDelay: '80ms' }}>
            <AudioPlayer paragraphs={audioParagraphs} onParagraphChange={(p) => setActiveParagraphId(p?.id ?? null)} />
          </section>

          <section className="animate-scroll-reveal" style={{ animationDelay: '120ms' }}>
            <div className="mb-5">
              <h2 className="section-title flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
                口述转录稿
              </h2>
              <p className="section-subtitle">
                当前播放段落高亮显示 · 方言词汇鼠标悬停查看释义
              </p>
            </div>

            <div className="space-y-4 relative">
              {sortedParagraphs.map((para, idx) => {
                const isActive = para.id === activeParagraphId;
                const notes = dialectNotesByParagraph[para.id] || [];
                const segments = highlightDialectWords(para.content, notes);

                return (
                  <div
                    key={para.id}
                    className={cn(
                      'relative rounded-2xl p-5 md:p-6 transition-all duration-300',
                      isActive
                        ? 'bg-cinnabar-50/80 border-l-4 border-cinnabar-500 shadow-chinese pl-6'
                        : 'bg-white/80 border-l-4 border-transparent border border-rice-200 hover:border-cinnabar-200 hover:bg-cinnabar-50/30'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex shrink-0 items-center justify-center w-9 h-9 rounded-full font-serif font-bold text-sm transition-colors',
                          isActive
                            ? 'bg-cinnabar-500 text-white shadow-md'
                            : 'bg-rice-200 text-ink-600'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-base md:text-lg leading-loose md:leading-[2.2] text-ink-800',
                            isActive && 'font-medium'
                          )}
                        >
                          {segments.map((seg, i) =>
                            seg.note ? (
                              <span
                                key={i}
                                className="relative inline-block cursor-help border-b-2 border-dotted border-cinnabar-400 text-cinnabar-700 font-medium"
                                onMouseEnter={(e) => {
                                  setHoveredNote(seg.note!);
                                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                                  setHoveredNoteEl({ x: rect.left + rect.width / 2, y: rect.top });
                                }}
                                onMouseLeave={() => {
                                  setHoveredNote(null);
                                  setHoveredNoteEl(null);
                                }}
                              >
                                {seg.text}
                              </span>
                            ) : (
                              <span key={i}>{seg.text}</span>
                            )
                          )}
                        </p>
                        {notes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-dashed border-rice-200">
                            <p className="text-xs text-ink-400 mb-2">本地方言词汇：</p>
                            <div className="flex flex-wrap gap-2">
                              {notes.map((note) => (
                                <div
                                  key={note.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cinnabar-50 border border-cinnabar-200 text-cinnabar-700 text-xs"
                                >
                                  <span className="font-semibold">{note.word}</span>
                                  {note.pronunciation && (
                                    <span className="text-cinnabar-500">【{note.pronunciation}】</span>
                                  )}
                                  <span className="text-ink-500">—</span>
                                  <span>{note.meaning}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-3">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto scrollbar-thin space-y-6">
          <aside className="card p-6 animate-scroll-reveal" style={{ animationDelay: '150ms' }}>
            {storyteller ? (
              <>
                <div className="text-center mb-5">
                  <div className="relative inline-block mb-4">
                    <div className="w-28 h-28 rounded-full border-4 border-gold-400 p-1 bg-gradient-to-br from-gold-50 to-rice-100 shadow-gold mx-auto">
                      {storyteller.avatar ? (
                        <img
                          src={storyteller.avatar}
                          alt={storyteller.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-rice-200 flex items-center justify-center text-ink-400">
                          <User className="w-14 h-14" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    {storyteller.isVerified && (
                      <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white border-3 border-cinnabar-500 flex items-center justify-center shadow-md">
                        <BadgeCheck className="w-7 h-7 text-cinnabar-600" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-ink-900 mb-1">
                    {storyteller.name}
                  </h3>
                  {storyteller.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cinnabar-50 text-cinnabar-700 text-xs font-medium border border-cinnabar-200">
                      <BadgeCheck className="w-3 h-3" strokeWidth={2.5} />
                      已认证讲述者
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-ink-600">
                      <span className="text-ink-400">性别</span>
                      <span className="font-medium text-ink-800">
                        {storyteller.gender === 'male' ? '男' : storyteller.gender === 'female' ? '女' : '其他'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <span className="text-ink-400">年龄</span>
                      <span className="font-medium text-ink-800">{storyteller.age}岁</span>
                    </div>
                    {storyteller.ethnicity && (
                      <div className="flex items-center gap-2 text-ink-600">
                        <span className="text-ink-400">民族</span>
                        <span className="font-medium text-ink-800">{storyteller.ethnicity}</span>
                      </div>
                    )}
                    {storyteller.occupation && (
                      <div className="flex items-center gap-2 text-ink-600">
                        <span className="text-ink-400">职业</span>
                        <span className="font-medium text-ink-800">{storyteller.occupation}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-ink-600">
                      <span className="text-ink-400">从业</span>
                      <span className="font-medium text-ink-800">{storyteller.yearsOfExperience}年</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <span className="text-ink-400">学历</span>
                      <span className="font-medium text-ink-800">{storyteller.education || '—'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-rice-100">
                    <div className="flex items-start gap-2 text-ink-600">
                      <span className="text-ink-400 shrink-0 mt-0.5">地区</span>
                      <span className="font-medium text-ink-800">
                        {getLocationName(storyteller.provinceId, storyteller.cityId, storyteller.districtId) || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-cinnabar-50 to-gold-50 border border-cinnabar-100">
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className="font-serif text-3xl font-bold text-cinnabar-600">
                        {storyteller.storyCount}
                      </div>
                      <div className="text-xs text-ink-500 mt-1">收录故事</div>
                    </div>
                    <div className="w-px h-10 bg-cinnabar-200" />
                    <div>
                      <div className="font-serif text-3xl font-bold text-gold-600">
                        {storyteller.specialties.length}
                      </div>
                      <div className="text-xs text-ink-500 mt-1">擅长领域</div>
                    </div>
                  </div>
                </div>

                {storyteller.specialties.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs text-ink-400 mb-2">擅长专长</p>
                    <div className="flex flex-wrap gap-1.5">
                      {storyteller.specialties.map((sp, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-md bg-gold-50 border border-gold-200 text-gold-700 text-xs font-medium"
                        >
                          ✦ {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {storyteller.bio && (
                  <div className="mb-6">
                    <p className="text-xs text-ink-400 mb-2">个人简介</p>
                    <p className="text-sm text-ink-600 leading-relaxed">
                      {storyteller.bio}
                    </p>
                  </div>
                )}

                <Link
                  to={`/storyteller/${storyteller.id}`}
                  className="btn-primary w-full"
                >
                  <UserCircle className="w-4 h-4" strokeWidth={2} />
                  查看完整档案
                </Link>
              </>
            ) : (
              <div className="text-center py-10 text-ink-400">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>讲述者信息暂缺</p>
              </div>
            )}
          </aside>

          {relatedStories.length > 0 && (
            <aside className="animate-scroll-reveal" style={{ animationDelay: '200ms' }}>
              <h3 className="font-serif text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
                相关推荐
              </h3>
              <div className="space-y-4">
                {relatedStories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </aside>
          )}
        </div>
        </div>
      </div>

      <section
        id="comments-section"
        className="animate-scroll-reveal mt-8"
        style={{ animationDelay: '250ms' }}
      >
        <CommentSection storyId={story.id} />
      </section>

      <SharePanel
        storyId={story.id}
        open={sharePanelOpen}
        onClose={() => setSharePanelOpen(false)}
      />

      {hoveredNote && hoveredNoteEl && (
        <div
          className="fixed z-50 pointer-events-none animate-scroll-reveal"
          style={{
            left: hoveredNoteEl.x,
            top: hoveredNoteEl.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="card-compact p-4 max-w-xs shadow-chinese-lg border-cinnabar-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-serif text-lg font-bold text-cinnabar-600">{hoveredNote.word}</span>
              {hoveredNote.pronunciation && (
                <span className="text-sm text-cinnabar-500 bg-cinnabar-50 px-2 py-0.5 rounded">
                  {hoveredNote.pronunciation}
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-ink-400 shrink-0">释义</span>
                <span className="text-ink-800 font-medium">{hoveredNote.meaning}</span>
              </div>
              {hoveredNote.example && (
                <div className="flex gap-2">
                  <span className="text-ink-400 shrink-0">例句</span>
                  <span className="text-ink-600 italic">「{hoveredNote.example}」</span>
                </div>
              )}
              {hoveredNote.region && (
                <div className="pt-1 border-t border-rice-100">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-rice-100 text-ink-500 text-xs">
                    {hoveredNote.region}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fff',
              filter: 'drop-shadow(0 4px 6px -1px rgba(0,0,0,0.1))',
            }}
          />
        </div>
      )}
    </Layout>
  );
}
