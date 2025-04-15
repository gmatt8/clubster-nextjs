// app/auth/customer/signup/page.js
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Loader2, Mail, Lock } from "lucide-react";

export default function CustomerSignupPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'customer',
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setMessage('Signup successful! Please verify your email. Redirecting...');
    setTimeout(() => {
      router.push(`/auth/customer/login?next=${encodeURIComponent(nextUrl)}`);
    }, 3000);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b md:bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center px-4 py-10 overflow-x-hidden">
      {/* Gradient blob behind */}
      <div className="absolute -z-10 w-[500px] h-[500px] bg-pink-500 opacity-20 blur-[100px] rounded-full top-[-100px] left-[-100px] animate-pulse" />
      <div className="absolute -z-10 w-[400px] h-[400px] bg-indigo-500 opacity-20 blur-[100px] rounded-full bottom-[-80px] right-[-80px] animate-ping" />

      <div className="w-full max-w-md px-6 py-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl text-white">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/images/clubster-logo.png" alt="Clubster" className="w-28 h-auto" />
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl font-bold mb-2">Let’s get started 🎉</h1>
        <p className="text-sm text-gray-300 text-center mb-6">
          Create your free Clubster account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-black/30 text-white pl-10 pr-3 py-2 rounded-full text-sm border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full bg-black/30 text-white pl-10 pr-3 py-2 rounded-full text-sm border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-full transition duration-150"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            Sign Up
          </button>
        </form>

        {/* Messages */}
        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
        {message && <p className="text-green-300 text-sm mt-3 text-center">{message}</p>}

        <p className="mt-6 text-sm text-center text-gray-300">
          Already have an account?{" "}
          <a
            href={`/auth/customer/login?next=${encodeURIComponent(nextUrl)}`}
            className="text-indigo-300 hover:underline font-medium"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
