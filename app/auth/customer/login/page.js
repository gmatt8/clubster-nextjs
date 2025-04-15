// app/auth/customer/login/page.js
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function CustomerLoginPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Se "next" non è presente, puoi specificare un URL di fallback (es. '/customer/basket' o un'altra pagina)
  const nextUrl = searchParams.get("next") || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    // Log in using email and password
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("No user found.");
      return;
    }

    // Retrieve the user profile to verify that the user is a customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      setError('Unable to retrieve user role.');
      return;
    }

    if (profile.role !== 'customer') {
      setError('Unauthorized access. This form is for customers.');
      await supabase.auth.signOut();
      return;
    }

    // Redirect to the URL indicato nella query string o a quello di default
    router.push(nextUrl);
  }

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left section: login form with dark background */}
      <div className="w-full md:w-1/2 bg-black text-white flex flex-col justify-center items-center p-6">
        {/* Clubster logo */}
        <img
          src="/images/clubster-logo.png"
          alt="Clubster Logo"
          className="w-40 h-auto mb-8"
        />

        <h1 className="text-3xl mb-4 font-semibold">Log in to your account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="email"
            placeholder="Enter email address"
            className="border border-gray-700 bg-black p-3 rounded-full focus:outline-none focus:border-indigo-400 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            className="border border-gray-700 bg-black p-3 rounded-full focus:outline-none focus:border-indigo-400 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white p-3 rounded-full font-semibold"
          >
            Log in
          </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <p className="mt-6 text-sm">
          Don't have an account?{' '}
          <a href={`/auth/customer/signup?next=${encodeURIComponent(nextUrl)}`} className="text-indigo-400 hover:underline">
            Sign up
          </a>
        </p>
        
        <p className="mt-2 text-sm">
          Forgot your password?{' '}
          <a href="/auth/customer/forgot-password" className="text-indigo-400 hover:underline">
            Reset it
          </a>
        </p>
      </div>

      {/* Right section: image with overlaid text */}
      <div className="relative w-full md:w-1/2 h-64 md:h-auto">
        <img
          src="/images/regphoto.png"
          alt="Registration Photo"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold text-center">
            Your next party, <br className="hidden md:block" /> just a click away.
          </h2>
        </div>
      </div>
    </div>
  );
}
