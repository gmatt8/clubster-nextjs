"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function ManagerSignupPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

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
      return;
    }

    setMessage(
      "Signup successful! Check your email to verify your account. You will be redirected to the login page."
    );

    // Reindirizza alla pagina di login dopo 3 secondi
    setTimeout(() => {
      router.push("/auth/manager/login");
    }, 3000);
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
        Manage Your Events Easily and Effectively
      </h2>

      {/* Box viola */}
      <div className="bg-[#5F4EE4] w-full max-w-sm p-8 rounded-[2rem] shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Sign up
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
            Sign Up
          </button>
        </form>

        {/* Messaggi di errore o successo */}
        {error && <p className="text-red-200 mt-3 text-center">{error}</p>}
        {message && <p className="text-green-200 mt-3 text-center">{message}</p>}

        <p className="mt-6 text-center text-sm text-white">
          Already have an account?{" "}
          <a href="/auth/manager/login" className="underline">
            Log in
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-sm text-gray-500">
        © 2025 Clubster
      </footer>
    </div>
  );
}
