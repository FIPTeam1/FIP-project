'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
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
      await register({
        email,
        password,
        username,
        first_name: firstName,
        last_name: lastName,
      });
      router.replace('/recipes');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-secondary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="w-full max-w-md mx-auto px-8 py-12 bg-white rounded-box shadow-sm">
      {/* Logo placeholder */}
      <div className="w-24 h-24 rounded-full bg-base-200 mx-auto mb-6 flex items-center justify-center text-3xl select-none">
        🍲
      </div>

      <h1 className="text-title text-center mb-8 text-base-content">Create Account</h1>

      {error && (
        <div role="alert" className="alert alert-error mb-6 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* First Name + Last Name side by side */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="label" htmlFor="firstName">
              <span className="label-text font-medium">
                First Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              required
              className="input input-bordered w-full"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Juan"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="label" htmlFor="lastName">
              <span className="label-text font-medium">
                Last Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              required
              className="input input-bordered w-full"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="dela Cruz"
            />
          </div>
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="label" htmlFor="username">
            <span className="label-text font-medium">
              Username <span className="text-error">*</span>
            </span>
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            className="input input-bordered w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="juandelacruz"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="label" htmlFor="email">
            <span className="label-text font-medium">
              Email <span className="text-error">*</span>
            </span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="label" htmlFor="password">
            <span className="label-text font-medium">
              Password <span className="text-error">*</span>
            </span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-secondary w-full text-btn mt-2"
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Creating account…
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-base-content/70 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-secondary font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
