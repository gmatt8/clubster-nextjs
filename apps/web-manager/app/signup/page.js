// apps/web-manager/app/signup/page.js
"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";

export default function ManagerSignupPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "manager",
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setMessage("Signup successful! Please verify your email. Redirecting...");
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-2xl px-8 py-10">
        <div className="flex justify-center mb-6">
          <img
            src="/images/clubster-manager-logo.png"
            alt="Clubster Manager Logo"
            className="w-36 h-auto"
          />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Create your manager account
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Start managing your club and events with Clubster
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 bg-white text-sm text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 bg-white text-sm text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition duration-150"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            Sign Up
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 font-medium underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
