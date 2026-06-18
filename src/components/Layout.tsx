import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  LayoutGrid,
  PenSquare,
  Settings,
  ChevronDown,
  BookOpen,
  Cloud,
  User,
  Shield,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: '首页', href: '/', icon: Home },
  { label: '讲述者', href: '/storytellers', icon: Users },
  { label: '分类浏览', href: '/categories', icon: LayoutGrid },
  { label: '贡献故事', href: '/contribute', icon: PenSquare },
  { label: '管理后台', href: '/admin', icon: Settings, requireRole: ['admin'] as UserRole[] },
];

const roleOptions: { role: UserRole; label: string; icon: typeof User; color: string }[] = [
  { role: 'visitor', label: '访客', icon: Eye, color: 'text-ink-600' },
  { role: 'contributor', label: '贡献者', icon: User, color: 'text-jade-600' },
  { role: 'admin', label: '管理员', icon: Shield, color: 'text-cinnabar-600' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAppStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const currentRole = currentUser?.role || 'visitor';
  const currentRoleOption = roleOptions.find((r) => r.role === currentRole) || roleOptions[0];
  const RoleIcon = currentRoleOption.icon;

  const canSeeNav = (requireRole?: UserRole[]) => {
    if (!requireRole) return true;
    return requireRole.includes(currentRole);
  };

  const visibleNavItems = navItems.filter((item) => canSeeNav(item.requireRole));

  return (
    <div className="min-h-screen flex flex-col bg-rice-50 bg-paper-texture">
      <header className="relative bg-gradient-to-b from-cinnabar-500 via-cinnabar-500 to-cinnabar-600 text-white shadow-chinese-lg overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cloud-pattern bg-[length:80px_80px] pointer-events-none" />
        <div className="absolute top-4 left-8 opacity-20">
          <Cloud className="w-16 h-16 text-gold-300" strokeWidth={1.5} />
        </div>
        <div className="absolute top-8 right-32 opacity-15">
          <Cloud className="w-24 h-24 text-gold-200" strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-2 left-1/3 opacity-15">
          <Cloud className="w-20 h-20 text-gold-300" strokeWidth={1.5} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 group-hover:bg-white/25 transition-all duration-300">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-gold-200" strokeWidth={2} />
              </div>
              <div>
                <h1 className="font-serif text-xl md:text-2xl font-bold tracking-wide text-white">
                  口述历史
                </h1>
                <p className="text-[10px] md:text-xs text-gold-200/80 tracking-widest">
                  ORAL HISTORY ARCHIVE
                </p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/20 text-white shadow-inner'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all duration-200 group"
              >
                <div className={cn('p-1 rounded-md bg-white/10', currentRoleOption.color)}>
                  <RoleIcon className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-gold-200/70">当前角色</p>
                  <p className="text-sm font-medium">{currentRoleOption.label}</p>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    roleDropdownOpen && 'rotate-180'
                  )}
                  strokeWidth={2}
                />
              </button>

              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 card-compact z-50 py-2 overflow-hidden animate-scroll-reveal">
                    <div className="px-4 py-2 border-b border-rice-100">
                      <p className="text-xs text-ink-500 mb-1">切换角色预览</p>
                      <p className="text-xs text-ink-400">用于演示不同权限视图</p>
                    </div>
                    {roleOptions.map((option) => {
                      const OptIcon = option.icon;
                      const isActive = currentRole === option.role;
                      return (
                        <button
                          key={option.role}
                          onClick={() => {
                            setCurrentUser(option.role);
                            setRoleDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150',
                            isActive
                              ? 'bg-cinnabar-50 text-cinnabar-700'
                              : 'hover:bg-rice-50 text-ink-700'
                          )}
                        >
                          <div
                            className={cn(
                              'p-1.5 rounded-lg',
                              isActive ? 'bg-cinnabar-100' : 'bg-rice-100',
                              option.color
                            )}
                          >
                            <OptIcon className="w-4 h-4" strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs text-ink-400">
                              {option.role === 'visitor' && '浏览公开内容'}
                              {option.role === 'contributor' && '投稿与管理自己的内容'}
                              {option.role === 'admin' && '全部管理权限'}
                            </p>
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-cinnabar-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <nav className="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto scrollbar-thin -mx-4 px-4">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0',
                    isActive
                      ? 'bg-white/25 text-white shadow-inner'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 opacity-60" />
      </header>

      <main className="flex-1 relative">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>

      <footer className="relative bg-gradient-to-b from-ink-800 to-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-cloud-pattern bg-[length:100px_100px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cinnabar-500 via-gold-500 to-cinnabar-500" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cinnabar-500/20 border border-cinnabar-500/30">
                  <BookOpen className="w-5 h-5 text-gold-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">口述历史</h3>
                  <p className="text-xs text-gold-300/60 tracking-widest">ORAL HISTORY</p>
                </div>
              </div>
              <p className="text-sm text-ink-300 leading-relaxed">
                我们致力于收集、整理和保存普通人的真实故事，通过口述的方式记录时代变迁，让珍贵的历史记忆得以传承。
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gold-300 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gold-500 rounded-full" />
                快速导航
              </h4>
              <ul className="space-y-2">
                {visibleNavItems.slice(0, 4).map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-ink-300 hover:text-gold-300 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-ink-500 group-hover:bg-gold-400 transition-colors" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gold-300 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gold-500 rounded-full" />
                关于项目
              </h4>
              <ul className="space-y-2 text-sm text-ink-300">
                <li className="flex items-start gap-2">
                  <span className="text-cinnabar-400 mt-0.5">◆</span>
                  <span>非盈利文化传承项目</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cinnabar-400 mt-0.5">◆</span>
                  <span>保护讲述者隐私与版权</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cinnabar-400 mt-0.5">◆</span>
                  <span>欢迎志愿者加入我们</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-ink-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-ink-400">
              © {new Date().getFullYear()} 口述历史档案库 · 保留所有权利
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-400">
              <span className="hover:text-gold-300 transition-colors cursor-pointer">隐私政策</span>
              <span className="text-ink-600">|</span>
              <span className="hover:text-gold-300 transition-colors cursor-pointer">使用条款</span>
              <span className="text-ink-600">|</span>
              <span className="hover:text-gold-300 transition-colors cursor-pointer">联系我们</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
