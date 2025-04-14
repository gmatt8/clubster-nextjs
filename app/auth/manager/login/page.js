"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function ManagerLoginPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      const user = data?.user;
      if (!user) {
        setError("No user found.");
        return;
      }

      // Recupera il ruolo dal profilo
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Unable to retrieve user role.");
        return;
      }

      if (profile.role !== "manager") {
        setError("Unauthorized access. This form is for managers.");
        await supabase.auth.signOut();
        return;
      }

      // Se tutto ok, reindirizza alla dashboard manager
      router.push("/manager/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo in alto */}
      <img
        src="/images/clubster-manager-logo.png"
        alt="Clubster Manager Logo"
        className="w-48 h-auto mb-4"
      />
      {/* Sottotitolo */}
      <h2 className="text-lg md:text-xl text-gray-700 mb-8">
        Welcome Back!
      </h2>

      {/* Box Login */}
      <div className="bg-[#5F4EE4] w-full max-w-sm p-8 rounded-[2rem] shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Log In
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-white text-gray-800 p-2 rounded-full focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white text-gray-800 p-2 rounded-full focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-[#421AC5] hover:bg-[#3A18AD] text-white p-2 rounded-full font-medium transition-colors"
          >
            Log In
          </button>
        </form>

        {error && <p className="text-red-200 mt-3 text-center">{error}</p>}
        <p className="mt-6 text-center text-sm text-white">
          Don't have an account?{" "}
          <a href="/auth/manager/signup" className="underline">
            Sign up
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-sm text-gray-500">© 2025 Clubster</footer>
    </div>
  );
}
