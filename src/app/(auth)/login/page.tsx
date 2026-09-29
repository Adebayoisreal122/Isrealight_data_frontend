'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ApiError } from '@/lib/api';
import { ErrorText, Field, Spinner } from '@/components/ui';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [user, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(email, password);
      router.replace(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted">Log in to continue.</p>
      </div>
      <Field label="Email"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
      <Field label="Password"><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <ErrorText msg={error} />
      <button className="btn btn-primary w-full" disabled={busy}>{busy && <Spinner />} Log in</button>
      <p className="text-center text-sm text-muted">New here? <Link href="/register" className="font-semibold text-brand-600 dark:text-sun-300">Create an account</Link></p>
    </form>
  );
}
