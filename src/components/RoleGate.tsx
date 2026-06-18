import { Link } from 'react-router-dom';
import {
  Lock,
  Home,
  Shield,
  User,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const roleLabels: Record<UserRole, { label: string; icon: typeof User; color: string; bg: string; border: string }> = {
  visitor: {
    label: '访客',
    icon: Eye,
    color: 'text-ink-600',
    bg: 'bg-ink-100',
    border: 'border-ink-300',
  },
  contributor: {
    label: '贡献者',
    icon: User,
    color: 'text-jade-600',
    bg: 'bg-jade-100',
    border: 'border-jade-300',
  },
  admin: {
    label: '管理员',
    icon: Shield,
    color: 'text-cinnabar-600',
    bg: 'bg-cinnabar-100',
    border: 'border-cinnabar-300',
  },
};

export default function RoleGate({
  allowedRoles,
  children,
  title,
  description,
}: RoleGateProps) {
  const { currentUser, setCurrentUser } = useAppStore();
  const currentRole = currentUser?.role || 'visitor';

  const hasAccess = allowedRoles.includes(currentRole);

  if (hasAccess) {
    return <>{children}</>;
  }

  const currentRoleInfo = roleLabels[currentRole];
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full p-8 md:p-10 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cinnabar-50 opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-gold-50 opacity-60" />

        <div className="relative">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cinnabar-100 to-cinnabar-200 border-4 border-white shadow-chinese">
                <Lock className="w-9 h-9 text-cinnabar-600" strokeWidth={2} />
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-9 h-9 rounded-full bg-white border-2 border-rice-200 shadow-md">
                <CurrentRoleIcon className={cn('w-4 h-4', currentRoleInfo.color)} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <h2 className="font-serif text-2xl font-bold text-ink-900 mb-2">
            {title || '无权限访问'}
          </h2>
          <p className="text-ink-500 text-sm leading-relaxed mb-6">
            {description || '抱歉，您当前的角色没有权限访问此页面。请切换到具有访问权限的角色，或返回首页浏览其他内容。'}
          </p>

          <div className="mb-6 p-4 rounded-xl bg-rice-50 border border-rice-200 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg border',
                currentRoleInfo.bg,
                currentRoleInfo.border
              )}>
                <CurrentRoleIcon className={cn('w-4.5 h-4.5', currentRoleInfo.color)} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-ink-500">您的当前角色</p>
                <p className={cn('text-sm font-semibold', currentRoleInfo.color)}>
                  {currentRoleInfo.label}
                </p>
              </div>
            </div>

            <div className="border-t border-rice-200 pt-3">
              <p className="text-xs text-ink-500 mb-2.5">需要以下角色之一：</p>
              <div className="flex flex-wrap gap-2">
                {allowedRoles.map((role) => {
                  const info = roleLabels[role];
                  const Icon = info.icon;
                  return (
                    <button
                      key={role}
                      onClick={() => setCurrentUser(role)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                        info.bg,
                        info.border,
                        info.color,
                        'hover:brightness-95'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cinnabar-500 to-cinnabar-600 text-white font-medium hover:shadow-chinese-lg hover:from-cinnabar-600 hover:to-cinnabar-700 active:scale-[0.98] transition-all duration-200"
            >
              <Home className="w-4.5 h-4.5" strokeWidth={2} />
              返回首页
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <p className="text-xs text-ink-400">
              若您认为此错误不正确，请联系系统管理员核实权限。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
