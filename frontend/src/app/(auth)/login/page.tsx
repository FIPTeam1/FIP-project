'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getFriendlyError } from '@/lib/api';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/recipes');
    }
  }, [user, loading, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/recipes');
    } catch (err: unknown) {
      setError(getFriendlyError(err, 'login'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
        <span className="loading loading-spinner loading-lg" style={{ color: '#5555FF' }} />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-[#F0F0F0] px-10 py-12">

        {/* FIP Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#FCAF3B' }}
          >
            <span className="text-2xl font-bold text-white select-none">FIP</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#111827]">Welcome back</h1>
          <p className="text-[14px] text-[#909090] mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-[#FEE2E2] border border-[#F04C4C]/30 rounded-lg px-4 py-3 mb-5 flex items-start gap-2">
            <span className="text-[#F04C4C] text-lg leading-none mt-0.5">!</span>
            <span className="text-[14px] text-[#F04C4C]">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-[#111827]" htmlFor="email">
              Email <span className="text-[#F04C4C]">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input input-bordered w-full bg-white border-[#F0F0F0] text-[14px] focus:border-[#5555FF] focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-[#111827]" htmlFor="password">
              Password <span className="text-[#F04C4C]">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="input input-bordered w-full bg-white border-[#F0F0F0] text-[14px] focus:border-[#5555FF] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn w-full text-[14px] font-semibold text-white mt-2 border-none"
            style={{ backgroundColor: '#5555FF' }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-[14px] text-[#909090] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: '#5555FF' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
