// app/auth/manager/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";

export default function ManagerLoginPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      const user = data?.user;
      if (!user) {
        setError("No user found.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Unable to retrieve user role.");
        setLoading(false);
        return;
      }

      if (profile.role !== "manager") {
        setError("Unauthorized access. This form is for managers.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      router.push("/manager/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] to-[#eef2ff] flex flex-col items-center justify-center px-4">
{/* Logo */}
      <img
        src="/images/clubster-manager-logo.png"
        alt="Clubster Manager Logo"
        className="w-44 h-auto mb-4"
      />

      {/* Titolo */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-1">
        Welcome Back
      </h2>
      <p className="text-sm text-gray-500 mb-8">Log in to your manager account</p>

      {/* Card Login */}
      <div className="bg-[#5F4EE4] w-full max-w-sm p-8 rounded-3xl shadow-xl">
        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Log In
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
            Log In
          </button>
        </form>

        {error && (
          <p className="text-red-100 text-sm mt-4 text-center">{error}</p>
        )}

        <p className="mt-6 text-center text-sm text-white">
          Don't have an account?{" "}
          <a href="/auth/manager/signup" className="underline font-medium">
            Sign up
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-sm text-gray-400">© 2025 Clubster</footer>
    </div>
  );
}
