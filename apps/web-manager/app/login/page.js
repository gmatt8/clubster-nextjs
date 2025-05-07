// apps/web-manager/app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@lib/supabase-browser";
import { Loader2, Mail, Lock } from "lucide-react";

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

      // Verifica se il manager ha già un club
      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .select("id")
        .eq("manager_id", user.id)
        .single();

      if (clubError && clubError.code !== 'PGRST116') {
        setError("Errore durante la verifica del club.");
        setLoading(false);
        return;
      }

      if (!club) {
        router.push("/verify-club");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
      setLoading(false);
    }
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
          Log in to Clubster Manager
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your credentials to access your dashboard.
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
            Log In
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-indigo-600 font-medium underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}