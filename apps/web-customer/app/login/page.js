// /apps/web-customer/app/login/page.js
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from "@lib/supabase-browser";
import { Loader2, Mail, Lock } from "lucide-react";

export default function CustomerLoginPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("No user found.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      setError('Unable to retrieve user role.');
      setLoading(false);
      return;
    }

    if (profile.role !== 'customer') {
      setError('Unauthorized access. This form is for customers.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push(nextUrl);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 py-10 overflow-hidden relative">
      {/* Decorative Blobs */}
      <div className="absolute -z-10 w-[600px] h-[600px] bg-purple-300 opacity-30 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute -z-10 w-[400px] h-[400px] bg-pink-300 opacity-20 blur-[100px] rounded-full bottom-[-60px] right-[-60px]" />

      <div className="w-full max-w-md px-8 py-10 bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/images/clubster-logo.png" alt="Clubster" className="w-28 h-auto" />
        </div>

        <h1 className="text-center text-2xl font-bold text-gray-800 mb-2">Step into the night</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Log in to access your guestlist, tickets, and exclusive nightlife events.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-white text-gray-800 pl-10 pr-3 py-2 rounded-lg text-sm border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white text-gray-800 pl-10 pr-3 py-2 rounded-lg text-sm border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition duration-150"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            Log In
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}

        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{' '}
          <a
            href={`/signup?next=${encodeURIComponent(nextUrl)}`}
            className="text-purple-600 hover:underline font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}