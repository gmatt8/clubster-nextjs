// app/auth/manager/login/page.js
"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

    setMessage(
      "Signup successful! Check your email to verify your account. Redirecting to login..."
    );

    setTimeout(() => {
      router.push("/auth/manager/login");
    }, 3000);
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] to-[#eef2ff] flex flex-col items-center justify-center px-4">
{/* Logo */}
      <img
        src="/images/clubster-manager-logo.png"
        alt="Clubster Manager Logo"
        className="w-44 h-auto mb-4"
      />

      {/* Titolo + sottotitolo */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-1">
        Create Your Manager Account
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Manage your club and events with Clubster
      </p>

      {/* Card Signup */}
      <div className="bg-[#5F4EE4] w-full max-w-sm p-8 rounded-3xl shadow-xl">
        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white text-sm text-gray-900 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white text-sm text-gray-900 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#421AC5] hover:bg-[#3A18AD] text-white text-sm font-semibold py-2 rounded-full transition duration-150"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            Sign Up
          </button>
        </form>

        {/* Messaggi */}
        {error && (
          <p className="text-red-100 text-sm mt-4 text-center">{error}</p>
        )}
        {message && (
          <p className="text-green-100 text-sm mt-4 text-center">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-white">
          Already have an account?{" "}
          <a href="/auth/manager/login" className="underline font-medium">
            Log in
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-sm text-gray-400">© 2025 Clubster</footer>
    </div>
  );
}
