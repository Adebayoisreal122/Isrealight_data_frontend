import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="card !p-6">{children}</div>
      </div>
    </div>
  );
}
