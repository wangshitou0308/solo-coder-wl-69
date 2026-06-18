import { useEffect, useRef, useState } from 'react';
import { Stamp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Story } from '../types';
import StoryCard from './StoryCard';

interface StoryTimelineProps {
  stories: Story[];
}

interface TimelineItemProps {
  story: Story;
  index: number;
}

function TimelineItem({ story, index }: TimelineItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-center gap-6 py-6',
        !isLeft && 'flex-row-reverse'
      )}
    >
      <div
        className={cn(
          'w-full max-w-[calc(50%-2.5rem)] opacity-0 transition-all duration-700 ease-out',
          'md:block',
          isVisible && 'animate-scroll-reveal opacity-100',
          isVisible && isLeft && '-translate-x-0',
          isVisible && !isLeft && 'translate-x-0',
          !isVisible && isLeft && '-translate-x-8',
          !isVisible && !isLeft && 'translate-x-8'
        )}
        style={{ transitionDelay: `${(index % 4) * 80}ms` }}
      >
        <StoryCard story={story} />
      </div>

      <div className="absolute left-1/2 z-10 -translate-x-1/2 md:static md:translate-x-0">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-400 bg-rice-100 shadow-gold',
            'transition-all duration-500',
            isVisible ? 'animate-stamp scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
          style={{ transitionDelay: `${(index % 4) * 80 + 100}ms` }}
        >
          <Stamp className="h-6 w-6 text-cinnabar-600" />
        </div>
      </div>

      <div
        className={cn(
          'hidden w-1/2 md:block'
        )}
      />

      <div className="w-full md:hidden">
        <StoryCard story={story} />
      </div>
    </div>
  );
}

export default function StoryTimeline({ stories }: StoryTimelineProps) {
  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-ink-500">暂无故事数据</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-cinnabar-200 via-cinnabar-400 to-cinnabar-200 md:block" />
      <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-cinnabar-500/20 to-transparent md:block" />
      <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-cinnabar-200 via-cinnabar-400 to-cinnabar-200 md:hidden" />

      <div className="relative space-y-2 pl-16 md:space-y-0 md:pl-0">
        {stories.map((story, index) => (
          <TimelineItem key={story.id} story={story} index={index} />
        ))}
      </div>

      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 md:block">
        <div className="h-8 w-0.5 bg-gradient-to-b from-cinnabar-400 to-transparent" />
      </div>
    </div>
  );
}
