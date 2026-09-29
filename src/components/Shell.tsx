'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { LogOut, LucideIcon } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { InstallButton } from './PwaRegister';
import { useAuth } from './AuthProvider';
import { naira } from '@/lib/format';

export interface NavItem { href: string; label: string; icon: LucideIcon }

export default function Shell({
  home, items, mobileItems, showBalance, badge, children,
}: {
  home: string; items: NavItem[]; mobileItems: NavItem[]; showBalance?: boolean; badge?: string; children: ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const active = (href: string) => pathname === href || (href !== home && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card p-4 md:flex">
        <Link href={home} className="mb-6 px-1"><Logo /></Link>
        {badge && <span className="mb-3 w-fit rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold-dark dark:text-gold-light">{badge}</span>}
        <nav className="flex flex-1 flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active(href) ? 'bg-brand-600 text-white' : 'text-muted hover:bg-surface hover:text-fg'}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="btn btn-ghost mt-2 justify-start"><LogOut size={16} /> Log out</button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-card px-4 py-3">
          <Link href={home} className="md:hidden"><Logo size={32} text={false} /></Link>
          <div className="hidden text-sm text-muted md:block">Hi, <span className="font-semibold text-fg">{user?.name.split(' ')[0]}</span></div>
          <div className="flex items-center gap-2">
            {showBalance && user && (
              <Link href="/wallet" className="rounded-xl bg-brand-600/10 px-3 py-2 text-sm font-bold text-brand-700 dark:text-sun-300">
                {naira(user.balance)}
              </Link>
            )}
            <InstallButton />
            <ThemeToggle />
            <button onClick={logout} aria-label="Log out" className="btn btn-ghost !p-2.5 md:hidden"><LogOut size={18} /></button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl p-4 pb-28 sm:p-6 md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-card md:hidden">
        {mobileItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              active(href) ? 'text-brand-600 dark:text-sun-300' : 'text-muted'}`}>
            <Icon size={20} /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
