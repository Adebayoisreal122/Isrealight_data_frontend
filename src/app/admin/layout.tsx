'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, LayoutDashboard, Tags, Users } from 'lucide-react';
import Shell, { NavItem } from '@/components/Shell';
import { useAuth } from '@/components/AuthProvider';
import { FullSpinner } from '@/components/ui';

const items: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/admin/plans', label: 'Plans', icon: Tags },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'admin') router.replace('/dashboard');
  }, [loading, user, router]);
  if (loading || user?.role !== 'admin') return <FullSpinner />;
  return <Shell home="/admin" items={items} mobileItems={items} badge="ADMIN">{children}</Shell>;
}
