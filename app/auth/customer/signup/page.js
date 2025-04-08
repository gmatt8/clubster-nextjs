'use client';

import { useState } from 'react';
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from 'next/navigation';

export default function CustomerSignupPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    // Sign-up with Supabase, setting the role to "customer"
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
      return;
    }

    // Show a success message and redirect
    setMessage(
      'Sign up successful. Please check your email to verify your account. You will be redirected to the login page.'
    );

    setTimeout(() => {
      router.push('/auth/customer/login');
    }, 3000);
  }

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left section: dark background with sign-up form */}
      <div className="w-full md:w-1/2 bg-black text-white flex flex-col justify-center items-center p-6">
        
        {/* Clubster logo */}
        <img
          src="/images/clubster-logo.png"
          alt="Clubster Logo"
          className="w-40 h-auto mb-8"
        />

        <h1 className="text-3xl mb-4 font-semibold">Create an account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="email"
            placeholder="Enter email address"
            className="border border-gray-700 bg-black p-3 rounded-full
                       focus:outline-none focus:border-indigo-400 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            className="border border-gray-700 bg-black p-3 rounded-full
                       focus:outline-none focus:border-indigo-400 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors
                       text-white p-3 rounded-full font-semibold"
          >
            Sign up
          </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {message && <p className="text-green-500 mt-2">{message}</p>}

        <p className="mt-6">
          Already have an account?{' '}
          <a href="/auth/customer/login" className="text-indigo-400 hover:underline">
            Log in
          </a>
        </p>
      </div>

      {/* Right section: image with overlaid text */}
      <div className="relative w-full md:w-1/2 h-64 md:h-auto">
        <img
          src="/images/regphoto.png"
          alt="Reg Photo"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold text-center">
            Your next party, <br className="hidden md:block" />
            just a click away.
          </h2>
        </div>
      </div>
    </div>
  );
}
