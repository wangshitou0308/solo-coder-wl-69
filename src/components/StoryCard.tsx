import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Story, StoryStatus } from '../types';
import type { Province } from '../data/location';
import { useAppStore } from '../store';
import { provinces } from '../data/location';

interface StoryCardProps {
  story: Story;
}

const statusConfig: Record<StoryStatus, { label: string; className: string }> = {
  approved: {
    label: '已审核',
    className: 'bg-jade-100 text-jade-700 border-jade-300',
  },
  pending: {
    label: '待审核',
    className: 'bg-gold-100 text-gold-700 border-gold-300',
  },
  rejected: {
    label: '已驳回',
    className: 'bg-cinnabar-100 text-cinnabar-700 border-cinnabar-300',
  },
};

function getLocationName(provinceId?: string, cityId?: string): string {
  if (!provinceId) return '';
  const province: Province | undefined = provinces.find((p) => p.id === provinceId);
  if (!province) return '';
  if (!cityId) return province.name;
  const city = province.cities.find((c) => c.id === cityId);
  return city ? `${province.name} · ${city.name}` : province.name;
}

export default function StoryCard({ story }: StoryCardProps) {
  const navigate = useNavigate();
  const categories = useAppStore((s) => s.categories);
  const tags = useAppStore((s) => s.tags);
  const storytellers = useAppStore((s) => s.storytellers);

  const category = categories.find((c) => c.id === story.categoryId);
  const storyteller = storytellers.find((st) => st.id === story.storytellerId);
  const storyTags = story.tagIds
    .map((tid) => tags.find((t) => t.id === tid))
    .filter(Boolean)
    .slice(0, 3);
  const status = statusConfig[story.status];
  const location = getLocationName(story.provinceId, story.cityId);
  const summary = story.summary.length > 100 ? story.summary.slice(0, 100) + '…' : story.summary;
  const recordDate = story.recordingDate ? new Date(story.recordingDate).toLocaleDateString('zh-CN') : '';

  const handleClick = () => {
    navigate(`/story/${story.id}`);
  };

  return (
    <article
      onClick={handleClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border border-rice-200 bg-rice-50 p-5',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-2 hover:shadow-gold hover:shadow-[0_0_0_1px_rgba(184,134,11,0.4),0_8px_30px_-4px_rgba(184,134,11,0.25)]',
        'bg-paper-texture'
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        {category && (
          <span className="inline-flex items-center rounded-full border border-cinnabar-200 bg-cinnabar-50 px-3 py-1 text-xs font-medium text-cinnabar-700">
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.name}
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
            status.className
          )}
        >
          {status.label}
        </span>
      </div>

      <h3 className="mb-2 font-serif text-xl font-bold text-ink-900 transition-colors group-hover:text-cinnabar-600">
        {story.title}
      </h3>

      {story.subtitle && (
        <p className="mb-3 text-sm text-ink-500">{story.subtitle}</p>
      )}

      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-700">
        {summary}
      </p>

      {storyTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {storyTags.map((tag) => (
            <span
              key={tag!.id}
              className="inline-flex items-center rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-600"
              style={{ color: tag!.color, backgroundColor: tag!.color + '15' }}
            >
              # {tag!.name}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2 border-t border-rice-200 pt-3">
        <div className="flex items-center gap-3 text-xs text-ink-600">
          {storyteller && (
            <div className="flex items-center gap-1.5">
              {storyteller.avatar ? (
                <img
                  src={storyteller.avatar}
                  alt={storyteller.name}
                  className="h-5 w-5 rounded-full border border-rice-300 object-cover"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rice-200 text-ink-400">
                  <User size={10} />
                </div>
              )}
              <span className="font-medium text-ink-700">{storyteller.name}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-cinnabar-500" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {recordDate && (
          <div className="flex items-center gap-1 text-xs text-ink-500">
            <Calendar size={12} className="text-gold-600" />
            <span>采集于 {recordDate}</span>
          </div>
        )}
      </div>
    </article>
  );
}
