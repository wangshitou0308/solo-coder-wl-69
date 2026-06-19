import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Upload,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Mic,
  Search,
  UserPlus,
  User,
  BookOpen,
  Tag as TagIcon,
  AlertCircle,
  Check,
  X,
  Info,
  ListPlus,
  ArrowLeft,
} from 'lucide-react';
import Layout from '@/components/Layout';
import RoleGate from '@/components/RoleGate';
import AudioRecorder from '@/components/AudioRecorder';
import TagInput from '@/components/TagInput';
import { useAppStore } from '@/store';
import type { Tag, Storyteller, StoryParagraph, DialectNote, Story, CollectionTask } from '@/types';
import { provinces } from '@/data/location';
import { cn } from '@/lib/utils';

const sourceTypeOptions: Array<{ value: Story['sourceType']; label: string; icon: string; desc: string }> = [
  { value: 'interview', label: '实地口述', icon: '🎙️', desc: '面对面采访录音' },
  { value: 'document', label: '文献整理', icon: '📚', desc: '基于文献资料整理' },
  { value: 'inheritance', label: '家族传承', icon: '👨‍👩‍👧‍👦', desc: '家族世代传承的故事' },
  { value: 'other', label: '其他来源', icon: '📝', desc: '其他方式获取的资料' },
];

interface TempDialectNote {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  region: string;
}

interface TempParagraph {
  id: string;
  order: number;
  content: string;
  startTime: string;
  dialectNotes: TempDialectNote[];
}

interface TempStoryteller {
  mode: 'select' | 'new';
  selectedId: string;
  searchKeyword: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  age: string;
  occupation: string;
  specialties: string;
  phone: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  bio: string;
}

const genTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getInitialParagraphs = (): TempParagraph[] => [
  { id: genTempId(), order: 0, content: '', startTime: '0', dialectNotes: [] },
  { id: genTempId(), order: 1, content: '', startTime: '30', dialectNotes: [] },
  { id: genTempId(), order: 2, content: '', startTime: '60', dialectNotes: [] },
];

const priorityLabel: Record<CollectionTask['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const priorityColor: Record<CollectionTask['priority'], string> = {
  low: 'bg-ink-100 text-ink-600',
  medium: 'bg-gold-100 text-gold-700',
  high: 'bg-cinnabar-100 text-cinnabar-700',
  urgent: 'bg-red-100 text-red-700',
};

function SubmitStoryContent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const categories = useAppStore((s) => s.categories);
  const allTags = useAppStore((s) => s.tags);
  const storytellers = useAppStore((s) => s.storytellers);
  const currentUser = useAppStore((s) => s.currentUser);
  const collectionTasks = useAppStore((s) => s.collectionTasks);
  const addStory = useAppStore((s) => s.addStory);
  const updateStory = useAppStore((s) => s.updateStory);
  const getStoryById = useAppStore((s) => s.getStoryById);
  const updateStoryStatus = useAppStore((s) => s.updateStoryStatus);
  const addStoryteller = useAppStore((s) => s.addStoryteller);
  const addTagFn = useAppStore((s) => s.addTag);
  const claimTask = useAppStore((s) => s.claimTask);

  const [activeSection, setActiveSection] = useState<string>('basic');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [summary, setSummary] = useState('');
  const [sourceType, setSourceType] = useState<Story['sourceType']>('interview');
  const [recordingDate, setRecordingDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordingLocation, setRecordingLocation] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [oralYear, setOralYear] = useState('');
  const [audioData, setAudioData] = useState<{ audioUrl: string; duration: number } | null>(null);
  const [paragraphs, setParagraphs] = useState<TempParagraph[]>(getInitialParagraphs());
  const [selectedTagList, setSelectedTagList] = useState<Tag[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const [storytellerData, setStorytellerData] = useState<TempStoryteller>({
    mode: 'select',
    selectedId: '',
    searchKeyword: '',
    name: '',
    gender: 'male',
    age: '',
    occupation: '',
    specialties: '',
    phone: '',
    provinceId: '',
    cityId: '',
    districtId: '',
    bio: '',
  });

  const claimableTasks = useMemo(
    () =>
      collectionTasks.filter(
        (t) => t.status === 'open' || (t.status === 'in_progress' && t.claimedBy === currentUser?.id)
      ),
    [collectionTasks, currentUser]
  );

  const selectedTask = useMemo(
    () => claimableTasks.find((t) => t.id === selectedTaskId),
    [claimableTasks, selectedTaskId]
  );

  useEffect(() => {
    if (!id) return;
    const story = getStoryById(id);
    if (!story) return;

    setTitle(story.title || '');
    setSubtitle(story.subtitle || '');
    setCategoryId(story.categoryId || '');
    setSummary(story.summary || '');
    setSourceType(story.sourceType || 'interview');
    setRecordingDate(story.recordingDate || new Date().toISOString().split('T')[0]);
    setRecordingLocation(story.recordingLocation || '');
    setProvinceId(story.provinceId || '');
    setCityId(story.cityId || '');
    setDistrictId(story.districtId || '');
    setOralYear(story.oralYear || '');
    setKeywords(story.keywords || []);
    setSelectedTaskId(story.taskId || '');

    if (story.paragraphs && story.paragraphs.length > 0) {
      const paraDialectMap: Record<string, TempDialectNote[]> = {};
      (story.dialectNotes || []).forEach((dn) => {
        if (!paraDialectMap[dn.paragraphId]) paraDialectMap[dn.paragraphId] = [];
        paraDialectMap[dn.paragraphId].push({
          id: dn.id,
          word: dn.word,
          pronunciation: dn.pronunciation || '',
          meaning: dn.meaning,
          example: dn.example || '',
          region: dn.region || '',
        });
      });
      setParagraphs(
        story.paragraphs.map((p, idx) => ({
          id: p.id,
          order: idx,
          content: p.content,
          startTime: String(idx * 30),
          dialectNotes: paraDialectMap[p.id] || [],
        }))
      );
    }

    if (story.tagIds && story.tagIds.length > 0) {
      const tags = story.tagIds
        .map((tid) => allTags.find((t) => t.id === tid))
        .filter(Boolean) as Tag[];
      setSelectedTagList(tags);
    }

    if (story.storytellerId) {
      const st = storytellers.find((s) => s.id === story.storytellerId);
      if (st) {
        setStorytellerData({
          mode: 'select',
          selectedId: st.id,
          searchKeyword: '',
          name: st.name,
          gender: st.gender,
          age: String(st.age),
          occupation: st.occupation || '',
          specialties: st.specialties.join('，'),
          phone: st.contactPhone || '',
          provinceId: st.provinceId || '',
          cityId: st.cityId || '',
          districtId: st.districtId || '',
          bio: st.bio,
        });
      }
    }

    if (story.status === 'rejected' && story.reviewComment) {
      setRejectReason(story.reviewComment);
    }
  }, [id, getStoryById, allTags, storytellers]);

  const selectedProvince = useMemo(() => provinces.find((p) => p.id === provinceId), [provinceId]);
  const selectedCity = useMemo(
    () => selectedProvince?.cities.find((c) => c.id === cityId),
    [selectedProvince, cityId]
  );
  const districts = selectedCity?.districts || [];

  const stProvince = useMemo(
    () => provinces.find((p) => p.id === storytellerData.provinceId),
    [storytellerData.provinceId]
  );
  const stCity = useMemo(
    () => stProvince?.cities.find((c) => c.id === storytellerData.cityId),
    [stProvince, storytellerData.cityId]
  );
  const stDistricts = stCity?.districts || [];

  const filteredStorytellers = useMemo(() => {
    const kw = storytellerData.searchKeyword.trim().toLowerCase();
    if (!kw) return storytellers.slice(0, 8);
    return storytellers
      .filter(
        (st: Storyteller) =>
          st.name.toLowerCase().includes(kw) ||
          (st.occupation || '').toLowerCase().includes(kw) ||
          st.specialties.some((s) => s.toLowerCase().includes(kw))
      )
      .slice(0, 10);
  }, [storytellers, storytellerData.searchKeyword]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 5000);
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    setActiveSection(key);
  };

  const updateStoryteller = (patch: Partial<TempStoryteller>) => {
    setStorytellerData((prev) => ({ ...prev, ...patch }));
  };

  const updateParagraph = (pid: string, patch: Partial<TempParagraph>) => {
    setParagraphs((prev) =>
      prev.map((p) => (p.id === pid ? { ...p, ...patch } : p))
    );
  };

  const addParagraph = () => {
    const lastOrder = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1].order : -1;
    setParagraphs((prev) => [
      ...prev,
      {
        id: genTempId(),
        order: lastOrder + 1,
        content: '',
        startTime: String((lastOrder + 1) * 30),
        dialectNotes: [],
      },
    ]);
  };

  const removeParagraph = (pid: string) => {
    if (paragraphs.length <= 1) return;
    setParagraphs((prev) =>
      prev
        .filter((p) => p.id !== pid)
        .map((p, idx) => ({ ...p, order: idx }))
    );
  };

  const addDialectNote = (pid: string) => {
    setParagraphs((prev) =>
      prev.map((p) =>
        p.id === pid
          ? {
              ...p,
              dialectNotes: [
                ...p.dialectNotes,
                { id: genTempId(), word: '', pronunciation: '', meaning: '', example: '', region: '' },
              ],
            }
          : p
      )
    );
  };

  const updateDialectNote = (pid: string, nid: string, patch: Partial<TempDialectNote>) => {
    setParagraphs((prev) =>
      prev.map((p) =>
        p.id === pid
          ? {
              ...p,
              dialectNotes: p.dialectNotes.map((n) =>
                n.id === nid ? { ...n, ...patch } : n
              ),
            }
          : p
      )
    );
  };

  const removeDialectNote = (pid: string, nid: string) => {
    setParagraphs((prev) =>
      prev.map((p) =>
        p.id === pid
          ? { ...p, dialectNotes: p.dialectNotes.filter((n) => n.id !== nid) }
          : p
      )
    );
  };

  const addKeywordFn = () => {
    const trimmed = keywordInput.trim().replace(/[,，]/g, '');
    if (!trimmed) return;
    if (!keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleAddTag = (tag: Tag) => {
    if (tag.id.startsWith('new-')) {
      const created = addTagFn(tag.name);
      setSelectedTagList((prev) => [...prev, created]);
    } else {
      setSelectedTagList((prev) => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagList((prev) => prev.filter((t) => t.id !== tagId));
  };

  const buildStoryData = () => {
    let finalStorytellerId = storytellerData.selectedId;
    if (storytellerData.mode === 'new') {
      const newSt = addStoryteller({
        name: storytellerData.name.trim(),
        gender: storytellerData.gender,
        age: parseInt(storytellerData.age || '60', 10) || 60,
        occupation: storytellerData.occupation.trim() || undefined,
        specialties: storytellerData.specialties
          .split(/[,，、;；]/)
          .map((s) => s.trim())
          .filter(Boolean),
        yearsOfExperience: 20,
        bio: storytellerData.bio.trim() || `${storytellerData.name}的故事讲述记录。`,
        contactPhone: storytellerData.phone.trim() || undefined,
        provinceId: storytellerData.provinceId || undefined,
        cityId: storytellerData.cityId || undefined,
        districtId: storytellerData.districtId || undefined,
        address: undefined,
        ethnicity: undefined,
        education: undefined,
        avatar: undefined,
      });
      finalStorytellerId = newSt.id;
    }

    const validParagraphs = paragraphs
      .filter((p) => p.content.trim())
      .sort((a, b) => a.order - b.order)
      .map((p, idx): StoryParagraph => ({
        id: genTempId(),
        order: idx,
        content: p.content.trim(),
        audioUrl: undefined,
        videoUrl: undefined,
      }));

    const finalDialectNotes: DialectNote[] = [];
    paragraphs
      .filter((p) => p.content.trim())
      .sort((a, b) => a.order - b.order)
      .forEach((p, idx) => {
        const paraId = validParagraphs[idx].id;
        p.dialectNotes
          .filter((n) => n.word.trim() && n.meaning.trim())
          .forEach((n) => {
            finalDialectNotes.push({
              id: genTempId(),
              word: n.word.trim(),
              pronunciation: n.pronunciation.trim() || undefined,
              meaning: n.meaning.trim(),
              example: n.example.trim() || undefined,
              region: n.region.trim() || undefined,
              paragraphId: paraId,
            });
          });
      });

    return {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      categoryId,
      storytellerId: finalStorytellerId,
      collectorId: '',
      provinceId: provinceId || undefined,
      cityId: cityId || undefined,
      districtId: districtId || undefined,
      coverImage: undefined,
      summary: summary.trim(),
      paragraphs: validParagraphs,
      dialectNotes: finalDialectNotes,
      tagIds: selectedTagList.map((t) => t.id),
      keywords,
      sourceType,
      oralYear: oralYear.trim() || undefined,
      recordingDate,
      recordingLocation: recordingLocation.trim() || undefined,
      taskId: selectedTaskId || undefined,
    };
  };

  const validateForm = (): string | null => {
    const isEdit = !!id;
    if (!title.trim()) return '请填写故事标题';
    if (!isEdit) {
      if (!categoryId) return '请选择故事分类';
      if (storytellerData.mode === 'select' && !storytellerData.selectedId) {
        return '请选择或新增讲述者';
      }
      if (storytellerData.mode === 'new' && !storytellerData.name.trim()) {
        return '请填写新讲述者的姓名';
      }
      if (!recordingDate) return '请选择采集日期';
      if (!summary.trim()) return '请填写故事摘要';
      const validParagraphs = paragraphs.filter((p) => p.content.trim());
      if (validParagraphs.length === 0) return '请至少填写一段转录稿内容';
    }
    return null;
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      showToast('error', '请至少填写故事标题');
      return;
    }

    setSubmitting(true);

    try {
      const storyData = buildStoryData();

      if (selectedTaskId && currentUser) {
        const task = collectionTasks.find((t) => t.id === selectedTaskId);
        if (task && task.status === 'open') {
          claimTask(selectedTaskId, currentUser.id);
        }
      }

      if (id) {
        updateStory(id, storyData);
        updateStoryStatus(id, 'draft');
      } else {
        addStory({ ...storyData, status: 'draft' });
      }

      showToast('success', '草稿保存成功！');
      setDraftSaved(true);
      window.setTimeout(() => {
        navigate('/contributor/my-stories');
      }, 2000);
    } catch (err) {
      const e = err as Error;
      showToast('error', `保存失败：${e.message || '未知错误'}`);
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      showToast('error', error);
      return;
    }

    setSubmitting(true);

    try {
      const storyData = buildStoryData();

      if (selectedTaskId && currentUser) {
        const task = collectionTasks.find((t) => t.id === selectedTaskId);
        if (task && task.status === 'open') {
          claimTask(selectedTaskId, currentUser.id);
        }
      }

      if (id) {
        updateStory(id, storyData);
        updateStoryStatus(id, 'pending');
      } else {
        addStory(storyData);
      }

      showToast('success', '故事提交成功！正在跳转到故事列表...');
      window.setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const e = err as Error;
      showToast('error', `提交失败：${e.message || '未知错误'}`);
      setSubmitting(false);
    }
  };

  const SectionHeader = ({
    id,
    index,
    title,
    desc,
    icon,
  }: {
    id: string;
    index: number;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className={cn(
        'w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all',
        activeSection === id
          ? 'bg-gradient-to-r from-cinnabar-500/10 to-gold-500/10 border-2 border-cinnabar-300'
          : 'bg-white/60 border border-rice-200 hover:border-cinnabar-200 hover:bg-cinnabar-50/30'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
          activeSection === id
            ? 'bg-gradient-to-br from-cinnabar-500 to-cinnabar-600 text-white shadow-chinese'
            : 'bg-rice-100 text-cinnabar-600'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
              activeSection === id
                ? 'bg-cinnabar-500 text-white'
                : 'bg-rice-200 text-ink-600'
            )}
          >
            {index}
          </span>
          <h3 className="font-serif text-xl font-bold text-ink-900">{title}</h3>
        </div>
        <p className="text-sm text-ink-500 ml-8">{desc}</p>
      </div>
      {collapsedSections[id] ? (
        <ChevronDown className="w-5 h-5 text-ink-400 shrink-0" />
      ) : (
        <ChevronUp className="w-5 h-5 text-ink-400 shrink-0" />
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-scroll-reveal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-cinnabar-500 to-gold-500 rounded-full" />
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-900">
              {id ? '编辑故事' : '贡献故事'}
            </h1>
            <p className="text-ink-500 mt-1">
              请认真填写以下信息，您的贡献将被永久保存，成为文化传承的一部分
            </p>
          </div>
        </div>

        {rejectReason && (
          <div className="mt-4 p-4 md:p-5 rounded-2xl bg-cinnabar-50 border border-cinnabar-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-cinnabar-700 shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1">
                <p className="text-cinnabar-800 font-semibold mb-1">稿件被驳回，请修改后重新提交</p>
                <p className="text-cinnabar-700 text-sm">{rejectReason}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-gold-50 via-cinnabar-50/50 to-gold-50 border border-gold-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gold-700 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="flex-1 text-sm">
              <p className="text-ink-700 font-medium mb-1">温馨提示</p>
              <ul className="text-ink-500 space-y-0.5 text-xs md:text-sm">
                <li>• 所有提交的故事将经过审核后公开发布</li>
                <li>• 请确保内容真实可靠，尊重讲述者的隐私权</li>
                <li>• 标记 <span className="text-cinnabar-600 font-medium">*</span> 的为必填项</li>
              </ul>
            </div>
          </div>
        </div>

        {draftSaved && (
          <div className="mt-4 p-3 rounded-xl bg-jade-50 border border-jade-200 text-jade-700">
            ✓ 草稿已保存，可稍后继续编辑
          </div>
        )}
      </div>

      <section className="animate-scroll-reveal" style={{ animationDelay: '50ms' }}>
        <SectionHeader
          id="basic"
          index={1}
          title="基础信息"
          desc="故事的标题、分类、讲述者等基础信息"
          icon={<FileText className="w-6 h-6" strokeWidth={2} />}
        />
        {!collapsedSections.basic && (
          <div className="card p-5 md:p-6 mt-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="label-base">
                  故事标题 <span className="text-cinnabar-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：盘古开天辟地"
                  className="input-base font-serif text-lg"
                  maxLength={100}
                />
                <p className="text-xs text-ink-400 mt-1 text-right">
                  {title.length}/100
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="label-base">副标题</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="简短的副标题，可选"
                  className="input-base"
                  maxLength={150}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-base">
                  故事分类 <span className="text-cinnabar-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input-base appearance-none pr-12 h-12"
                  >
                    <option value="">请选择故事分类…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ''}{c.name} — {c.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label-base">关联采集任务（可选）</label>
                {claimableTasks.length === 0 ? (
                  <div className="mt-2 p-4 rounded-xl bg-rice-50 border border-rice-200 text-center text-ink-400 text-sm">
                    暂无待认领任务，可先投稿
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="input-base appearance-none pr-12 h-12"
                      >
                        <option value="">不关联任务，自由投稿</option>
                        {claimableTasks.map((t) => (
                          <option key={t.id} value={t.id}>
                            【{priorityLabel[t.priority]}】{t.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none" />
                    </div>
                    {selectedTask && (
                      <div className="mt-3 p-4 rounded-xl bg-gold-50 border border-gold-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-ink-800 truncate">
                                {selectedTask.title}
                              </span>
                              <span className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                                priorityColor[selectedTask.priority]
                              )}>
                                {priorityLabel[selectedTask.priority]}优先级
                              </span>
                            </div>
                            <p className="text-sm text-ink-600 line-clamp-2">
                              {selectedTask.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-500">
                              {selectedTask.deadline && (
                                <span>截止：{selectedTask.deadline.slice(0, 10)}</span>
                              )}
                              <span>进度：{selectedTask.currentStoryCount}/{selectedTask.targetStoryCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-rice-200">
              <label className="label-base flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-cinnabar-600" />
                讲述者 <span className="text-cinnabar-600">*</span>
              </label>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => updateStoryteller({ mode: 'select' })}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                    storytellerData.mode === 'select'
                      ? 'border-cinnabar-500 bg-cinnabar-500 text-white shadow-chinese'
                      : 'border-rice-300 bg-white text-ink-700 hover:border-cinnabar-300 hover:bg-cinnabar-50'
                  )}
                >
                  <Search className="w-4 h-4" />
                  选择已有讲述者
                </button>
                <button
                  type="button"
                  onClick={() => updateStoryteller({ mode: 'new' })}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                    storytellerData.mode === 'new'
                      ? 'border-cinnabar-500 bg-cinnabar-500 text-white shadow-chinese'
                      : 'border-rice-300 bg-white text-ink-700 hover:border-cinnabar-300 hover:bg-cinnabar-50'
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  新增讲述者
                </button>
              </div>

              {storytellerData.mode === 'select' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={storytellerData.searchKeyword}
                      onChange={(e) => updateStoryteller({ searchKeyword: e.target.value })}
                      placeholder="搜索讲述者姓名、职业、专长…"
                      className="input-base pl-11"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-thin p-1">
                    {filteredStorytellers.length === 0 ? (
                      <div className="md:col-span-2 p-8 text-center text-ink-400">
                        <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">未找到匹配的讲述者，试试新增吧</p>
                      </div>
                    ) : (
                      filteredStorytellers.map((st: Storyteller) => {
                        const active = st.id === storytellerData.selectedId;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => updateStoryteller({ selectedId: st.id })}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                              active
                                ? 'border-cinnabar-500 bg-cinnabar-50 shadow-chinese'
                                : 'border-rice-200 bg-white hover:border-cinnabar-200 hover:bg-cinnabar-50/40'
                            )}
                          >
                            <div
                              className={cn(
                                'w-11 h-11 rounded-full border-2 p-0.5 shrink-0',
                                active ? 'border-gold-400' : 'border-rice-200'
                              )}
                            >
                              {st.avatar ? (
                                <img src={st.avatar} alt={st.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <div className="w-full h-full rounded-full bg-rice-100 flex items-center justify-center text-ink-400">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-semibold text-ink-900 truncate">{st.name}</span>
                                {st.isVerified && (
                                  <BadgeCheckIcon className="w-4 h-4 text-cinnabar-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-ink-500 truncate">
                                {st.age}岁 · {st.occupation || '民间艺人'} · {st.specialties[0] || ''}
                              </p>
                            </div>
                            {active && (
                              <div className="w-6 h-6 rounded-full bg-cinnabar-500 flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-cinnabar-50/40 border border-cinnabar-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label-base">
                        姓名 <span className="text-cinnabar-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={storytellerData.name}
                        onChange={(e) => updateStoryteller({ name: e.target.value })}
                        placeholder="讲述者姓名"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="label-base">性别</label>
                      <div className="relative">
                        <select
                          value={storytellerData.gender}
                          onChange={(e) =>
                            updateStoryteller({
                              gender: e.target.value as 'male' | 'female' | 'other',
                            })
                          }
                          className="input-base appearance-none pr-10"
                        >
                          <option value="male">男</option>
                          <option value="female">女</option>
                          <option value="other">其他</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="label-base">年龄</label>
                      <input
                        type="number"
                        value={storytellerData.age}
                        onChange={(e) => updateStoryteller({ age: e.target.value })}
                        placeholder="例如：75"
                        className="input-base"
                        min="1"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="label-base">职业</label>
                      <input
                        type="text"
                        value={storytellerData.occupation}
                        onChange={(e) => updateStoryteller({ occupation: e.target.value })}
                        placeholder="例如：退休教师"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="label-base">联系电话</label>
                      <input
                        type="tel"
                        value={storytellerData.phone}
                        onChange={(e) => updateStoryteller({ phone: e.target.value })}
                        placeholder="可选"
                        className="input-base"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="label-base">专长领域</label>
                      <input
                        type="text"
                        value={storytellerData.specialties}
                        onChange={(e) => updateStoryteller({ specialties: e.target.value })}
                        placeholder="用逗号分隔，如：神话传说,民间歌谣"
                        className="input-base"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="label-base">所在地区</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="relative">
                          <select
                            value={storytellerData.provinceId}
                            onChange={(e) =>
                              updateStoryteller({
                                provinceId: e.target.value,
                                cityId: '',
                                districtId: '',
                              })
                            }
                            className="input-base appearance-none pr-10"
                          >
                            <option value="">省份</option>
                            {provinces.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select
                            value={storytellerData.cityId}
                            onChange={(e) =>
                              updateStoryteller({ cityId: e.target.value, districtId: '' })
                            }
                            disabled={!stProvince}
                            className="input-base appearance-none pr-10 disabled:opacity-50"
                          >
                            <option value="">城市</option>
                            {stProvince?.cities.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select
                            value={storytellerData.districtId}
                            onChange={(e) => updateStoryteller({ districtId: e.target.value })}
                            disabled={!stCity}
                            className="input-base appearance-none pr-10 disabled:opacity-50"
                          >
                            <option value="">区县</option>
                            {stDistricts.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <label className="label-base">简介</label>
                      <textarea
                        value={storytellerData.bio}
                        onChange={(e) => updateStoryteller({ bio: e.target.value })}
                        placeholder="讲述者的简要介绍，可选"
                        className="input-base min-h-[80px] resize-y"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-rice-200 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label-base">
                  采集日期 <span className="text-cinnabar-600">*</span>
                </label>
                <input
                  type="date"
                  value={recordingDate}
                  onChange={(e) => setRecordingDate(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">口述年代</label>
                <input
                  type="text"
                  value={oralYear}
                  onChange={(e) => setOralYear(e.target.value)}
                  placeholder="例如：1980年代"
                  className="input-base"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label-base">采集地点（文字描述）</label>
                <input
                  type="text"
                  value={recordingLocation}
                  onChange={(e) => setRecordingLocation(e.target.value)}
                  placeholder="例如：某某村老槐树下"
                  className="input-base"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label-base">采集地区（省市区）</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <select
                      value={provinceId}
                      onChange={(e) => {
                        setProvinceId(e.target.value);
                        setCityId('');
                        setDistrictId('');
                      }}
                      className="input-base appearance-none pr-10"
                    >
                      <option value="">省份</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={cityId}
                      onChange={(e) => {
                        setCityId(e.target.value);
                        setDistrictId('');
                      }}
                      disabled={!selectedProvince}
                      className="input-base appearance-none pr-10 disabled:opacity-50"
                    >
                      <option value="">城市</option>
                      {selectedProvince?.cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      disabled={!selectedCity}
                      className="input-base appearance-none pr-10 disabled:opacity-50"
                    >
                      <option value="">区县</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="animate-scroll-reveal" style={{ animationDelay: '80ms' }}>
        <SectionHeader
          id="audio"
          index={2}
          title="音频采集"
          desc="录制口述音频或上传已有的录音文件"
          icon={<Mic className="w-6 h-6" strokeWidth={2} />}
        />
        {!collapsedSections.audio && (
          <div className="card p-5 md:p-6 mt-4 space-y-4">
            {audioData ? (
              <div className="p-5 rounded-xl bg-jade-50 border border-jade-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-jade-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-6 h-6" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-semibold text-jade-800">音频已准备就绪</p>
                    <p className="text-sm text-jade-600">
                      时长约 {Math.round(audioData.duration / 60)} 分 {audioData.duration % 60} 秒
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioData(null)}
                  className="p-2 rounded-lg text-jade-600 hover:bg-jade-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <AudioRecorder
                onConfirm={(data) => {
                  setAudioData(data);
                  showToast('success', '音频已确认！');
                }}
              />
            )}
          </div>
        )}
      </section>

      <section className="animate-scroll-reveal" style={{ animationDelay: '100ms' }}>
        <SectionHeader
          id="summary"
          index={3}
          title="故事摘要"
          desc="用一两段话简要描述故事的核心内容"
          icon={<BookOpen className="w-6 h-6" strokeWidth={2} />}
        />
        {!collapsedSections.summary && (
          <div className="card p-5 md:p-6 mt-4">
            <label className="label-base">
              故事摘要 <span className="text-cinnabar-600">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简要概述故事的主要内容、背景和文化价值……建议 50-500 字"
              className="input-base min-h-[140px] resize-y leading-relaxed"
              rows={5}
              maxLength={500}
            />
            <p className="text-xs text-ink-400 mt-2 text-right">{summary.length}/500</p>
          </div>
        )}
      </section>

      <section className="animate-scroll-reveal" style={{ animationDelay: '120ms' }}>
        <SectionHeader
          id="transcript"
          index={4}
          title="转录稿编辑"
          desc="按段落整理转录稿，标注方言词汇释义"
          icon={<ListPlus className="w-6 h-6" strokeWidth={2} />}
        />
        {!collapsedSections.transcript && (
          <div className="card p-5 md:p-6 mt-4 space-y-5">
            <div className="space-y-5">
              {paragraphs.map((para, pIdx) => (
                <div
                  key={para.id}
                  className="p-4 md:p-5 rounded-2xl bg-rice-50/80 border border-rice-200 relative"
                >
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cinnabar-500 to-gold-500 flex items-center justify-center text-white font-serif font-bold shrink-0 shadow-sm">
                        {pIdx + 1}
                      </div>
                      <span className="font-semibold text-ink-800">
                        第 {pIdx + 1} 段
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-ink-500">
                        <span className="w-1 h-1 rounded-full bg-ink-300" />
                        <label className="flex items-center gap-1">
                          起始秒：
                          <input
                            type="number"
                            value={para.startTime}
                            onChange={(e) =>
                              updateParagraph(para.id, { startTime: e.target.value })
                            }
                            className="w-20 px-2 py-1 rounded-md border border-rice-300 bg-white text-sm focus:border-cinnabar-400 focus:ring-1 focus:ring-cinnabar-200 outline-none"
                            min="0"
                          />
                        </label>
                      </div>
                    </div>
                    {paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParagraph(para.id)}
                        className="p-2 rounded-lg text-ink-400 hover:text-cinnabar-600 hover:bg-cinnabar-50 transition-colors shrink-0"
                        title="删除此段"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={para.content}
                    onChange={(e) => updateParagraph(para.id, { content: e.target.value })}
                    placeholder="请输入此段的转录稿内容……"
                    className="input-base min-h-[100px] resize-y leading-loose text-base"
                    rows={4}
                  />

                  <div className="mt-4 pt-4 border-t border-dashed border-rice-300">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-ink-700 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cinnabar-600" />
                        本地方言词汇
                        <span className="text-xs text-ink-400 font-normal ml-1">
                          （标出方言词及其释义）
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => addDialectNote(para.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cinnabar-300 text-cinnabar-700 text-sm hover:bg-cinnabar-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        添加方言词
                      </button>
                    </div>

                    {para.dialectNotes.length === 0 ? (
                      <p className="text-xs text-ink-400 px-3 py-4 text-center bg-white/50 rounded-lg border border-dashed border-rice-200">
                        暂未添加方言词汇
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {para.dialectNotes.map((note, nIdx) => (
                          <div
                            key={note.id}
                            className="p-4 rounded-xl bg-white border border-cinnabar-100 relative"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-cinnabar-600 bg-cinnabar-50 px-2 py-0.5 rounded">
                                词汇 {nIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeDialectNote(para.id, note.id)}
                                className="p-1.5 rounded-md text-ink-400 hover:text-cinnabar-600 hover:bg-cinnabar-50 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-ink-500 block mb-1">
                                  方言词 <span className="text-cinnabar-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={note.word}
                                  onChange={(e) =>
                                    updateDialectNote(para.id, note.id, {
                                      word: e.target.value,
                                    })
                                  }
                                  placeholder="如：俺、中意"
                                  className="input-base text-sm h-9 py-1.5"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-ink-500 block mb-1">发音（拼音）</label>
                                <input
                                  type="text"
                                  value={note.pronunciation}
                                  onChange={(e) =>
                                    updateDialectNote(para.id, note.id, {
                                      pronunciation: e.target.value,
                                    })
                                  }
                                  placeholder="如：ǎn、zhōng yì"
                                  className="input-base text-sm h-9 py-1.5"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs text-ink-500 block mb-1">
                                  释义 <span className="text-cinnabar-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={note.meaning}
                                  onChange={(e) =>
                                    updateDialectNote(para.id, note.id, {
                                      meaning: e.target.value,
                                    })
                                  }
                                  placeholder="如：我/我们、喜欢"
                                  className="input-base text-sm h-9 py-1.5"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-ink-500 block mb-1">例句</label>
                                <input
                                  type="text"
                                  value={note.example}
                                  onChange={(e) =>
                                    updateDialectNote(para.id, note.id, {
                                      example: e.target.value,
                                    })
                                  }
                                  placeholder="如：俺们那旮瘩"
                                  className="input-base text-sm h-9 py-1.5"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-ink-500 block mb-1">归属方言区</label>
                                <input
                                  type="text"
                                  value={note.region}
                                  onChange={(e) =>
                                    updateDialectNote(para.id, note.id, {
                                      region: e.target.value,
                                    })
                                  }
                                  placeholder="如：北方方言、粤语"
                                  className="input-base text-sm h-9 py-1.5"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addParagraph}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-rice-300 text-ink-500 hover:border-cinnabar-400 hover:text-cinnabar-600 hover:bg-cinnabar-50/40 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">添加新段落</span>
            </button>
          </div>
        )}
      </section>

      <section className="animate-scroll-reveal" style={{ animationDelay: '140ms' }}>
        <SectionHeader
          id="tags"
          index={5}
          title="标签与关键词"
          desc="为故事添加话题标签和关键词，方便检索"
          icon={<TagIcon className="w-6 h-6" strokeWidth={2} />}
        />
        {!collapsedSections.tags && (
          <div className="card p-5 md:p-6 mt-4 space-y-5">
            <div>
              <label className="label-base flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-cinnabar-600" />
                话题标签
              </label>
              <TagInput
                selectedTags={selectedTagList}
                allTags={allTags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                placeholder="输入话题标签，回车添加…"
                allowCreate
              />
            </div>

            <div>
              <label className="label-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600" />
                关键词
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
                      e.preventDefault();
                      addKeywordFn();
                    }
                  }}
                  placeholder="输入关键词，按回车或逗号添加"
                  className="input-base pr-12"
                />
                <button
                  type="button"
                  onClick={addKeywordFn}
                  disabled={!keywordInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-cinnabar-500 text-white disabled:opacity-40 hover:bg-cinnabar-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-gold-800 text-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="ml-1 p-0.5 rounded-full hover:bg-gold-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-rice-200">
              <label className="label-base mb-3">
                <Upload className="w-4 h-4 text-cinnabar-600 inline mr-2" />
                贡献来源
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sourceTypeOptions.map((opt) => {
                  const active = sourceType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSourceType(opt.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        active
                          ? 'border-cinnabar-500 bg-cinnabar-50 shadow-chinese'
                          : 'border-rice-200 bg-white hover:border-cinnabar-300 hover:bg-cinnabar-50/40'
                      )}
                    >
                      <div className="text-2xl mb-2">{opt.icon}</div>
                      <p
                        className={cn(
                          'font-bold mb-0.5',
                          active ? 'text-cinnabar-700' : 'text-ink-800'
                        )}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-ink-500">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="pt-6 pb-12 animate-scroll-reveal" style={{ animationDelay: '160ms' }}>
        <div className="card p-5 md:p-8 bg-gradient-to-br from-cinnabar-50/50 to-gold-50/50 border-gold-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-2xl font-bold text-ink-900 mb-2">
                {id ? '准备好重新提交了吗？' : '准备好提交了吗？'}
              </h3>
              <p className="text-sm text-ink-500">
                提交后故事将进入审核队列，审核通过后将公开发布在平台上，成为永久档案。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={submitting}
                className="btn-secondary w-full sm:w-auto"
              >
                💾 保存草稿
              </button>
              {id && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-ghost w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  取消
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full sm:w-auto min-w-[160px]"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    提交中…
                  </>
                ) : (
                  <>
                    <Send className="w-4.5 h-4.5" strokeWidth={2} />
                    提交审核
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-scroll-reveal">
          <div
            className={cn(
              'card-compact p-4 pr-5 flex items-start gap-3 min-w-[280px] max-w-md shadow-chinese-lg',
              toast.type === 'success'
                ? 'border-jade-300 bg-jade-50'
                : 'border-cinnabar-300 bg-cinnabar-50'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                toast.type === 'success' ? 'bg-jade-500 text-white' : 'bg-cinnabar-500 text-white'
              )}
            >
              {toast.type === 'success' ? (
                <Check className="w-5 h-5" strokeWidth={3} />
              ) : (
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-semibold text-sm',
                  toast.type === 'success' ? 'text-jade-800' : 'text-cinnabar-800'
                )}
              >
                {toast.type === 'success' ? '提交成功' : '提交错误'}
              </p>
              <p
                className={cn(
                  'text-sm mt-0.5',
                  toast.type === 'success' ? 'text-jade-700' : 'text-cinnabar-700'
                )}
              >
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className={cn(
                'p-1 rounded-md shrink-0',
                toast.type === 'success'
                  ? 'text-jade-500 hover:bg-jade-100'
                  : 'text-cinnabar-500 hover:bg-cinnabar-100'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function SubmitStoryPage() {
  return (
    <Layout>
      <RoleGate
        allowedRoles={['contributor', 'admin']}
        title="需要贡献者权限"
        description="只有贡献者和管理员可以提交新故事。请切换角色以继续操作，或联系管理员申请成为贡献者。"
      >
        <SubmitStoryContent />
      </RoleGate>
    </Layout>
  );
}
