'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ApiError } from '@/lib/api';
import { ErrorText, Field, Spinner } from '@/components/ui';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Create your account</h1>
        <p className="text-sm text-muted">It takes less than a minute.</p>
      </div>
      <Field label="Full name"><input className="input" required value={form.name} onChange={set('name')} /></Field>
      <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} /></Field>
      <Field label="Phone number" hint="e.g. 08012345678"><input className="input" type="tel" required value={form.phone} onChange={set('phone')} /></Field>
      <Field label="Password" hint="At least 8 characters"><input className="input" type="password" minLength={8} required value={form.password} onChange={set('password')} /></Field>
      <ErrorText msg={error} />
      <button className="btn btn-primary w-full" disabled={busy}>{busy && <Spinner />} Create account</button>
      <p className="text-center text-sm text-muted">Already registered? <Link href="/login" className="font-semibold text-brand-600 dark:text-sun-300">Log in</Link></p>
    </form>
  );
}
