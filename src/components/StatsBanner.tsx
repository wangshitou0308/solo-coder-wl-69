import { useEffect, useState } from 'react';
import { BookOpen, Users, Map, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsBannerProps {
  storyCount: number;
  storytellerCount: number;
  provinceCount: number;
  villageCount: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  delay: number;
}

function useCountUp(target: number, duration = 1500, delay = 0): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    let rafId: number;
    let startTime: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp + delay;
      if (timestamp < startTime) {
        rafId = requestAnimationFrame(step);
        return;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, delay]);

  return count;
}

function StatCard({ label, value, icon, delay }: StatCardProps) {
  const displayValue = useCountUp(value, 1800, delay);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border border-rice-200 bg-rice-50/80 p-6',
        'bg-paper-texture overflow-hidden',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-chinese-lg'
      )}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background:
            'linear-gradient(135deg, rgba(200,16,46,0.1) 0%, rgba(184,134,11,0.1) 100%)',
        }}
      >
        {icon}
      </div>

      <div className="font-serif text-5xl font-bold tracking-tight text-cinnabar-600">
        {displayValue.toLocaleString('zh-CN')}
      </div>

      <div className="mt-2 text-sm font-medium text-ink-600">{label}</div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.6) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

export default function StatsBanner({
  storyCount,
  storytellerCount,
  provinceCount,
  villageCount,
}: StatsBannerProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-rice-200 bg-rice-100 p-6 md:p-8',
        'bg-paper-texture bg-cloud-pattern'
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-3xl">
            文化传承数据
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            每一个数字背后，都是一段珍贵的口述历史
          </p>
        </div>
        <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-gold-300 bg-gold-50 text-gold-600 md:flex">
          <span className="font-serif text-lg font-bold">数</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        <StatCard
          label="收录故事"
          value={storyCount}
          delay={0}
          icon={<BookOpen className="h-7 w-7 text-cinnabar-600" />}
        />

        <div className="hidden md:flex items-center justify-center">
          <div className="h-16 w-px bg-gradient-to-b from-transparent via-gold-400 to-transparent" />
        </div>

        <StatCard
          label="讲述者"
          value={storytellerCount}
          delay={200}
          icon={<Users className="h-7 w-7 text-cinnabar-600" />}
        />

        <div className="hidden md:flex items-center justify-center">
          <div className="h-16 w-px bg-gradient-to-b from-transparent via-gold-400 to-transparent" />
        </div>

        <StatCard
          label="覆盖省份"
          value={provinceCount}
          delay={400}
          icon={<Map className="h-7 w-7 text-cinnabar-600" />}
        />

        <div className="hidden md:flex items-center justify-center">
          <div className="h-16 w-px bg-gradient-to-b from-transparent via-gold-400 to-transparent" />
        </div>

        <StatCard
          label="采集村落"
          value={villageCount}
          delay={600}
          icon={<Home className="h-7 w-7 text-cinnabar-600" />}
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-400">
        <span className="inline-block h-1 w-1 rounded-full bg-cinnabar-400" />
        <span>数据实时更新中</span>
        <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
      </div>
    </section>
  );
}
