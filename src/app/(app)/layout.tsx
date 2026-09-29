'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Home, Smartphone, Tv, Wallet, Wifi, Zap } from 'lucide-react';
import Shell, { NavItem } from '@/components/Shell';
import { useAuth } from '@/components/AuthProvider';
import { FullSpinner } from '@/components/ui';

const items: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/buy/airtime', label: 'Airtime', icon: Smartphone },
  { href: '/buy/data', label: 'Data', icon: Wifi },
  { href: '/buy/cable', label: 'Cable TV', icon: Tv },
  { href: '/buy/electricity', label: 'Electricity', icon: Zap },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/transactions', label: 'History', icon: History },
];
const mobileItems = [items[0], items[2], items[1], items[5], items[6]];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  if (loading || !user) return <FullSpinner />;
  return <Shell home="/dashboard" items={items} mobileItems={mobileItems} showBalance>{children}</Shell>;
}
