// apps/web-manager/app/settings/login-and-security/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import ManagerLayout from "../../ManagerLayout";
import ManagerSettingsHeader from "@/components/settings/SettingsHeader";

export default function ManagerSettingsLoginSecurityPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError("Errore nel recupero utente");
      } else if (user) {
        setUserEmail(user.email);
        setUserId(user.id);
      }
    }
    getUser();
  }, [supabase]);

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Compila tutti i campi");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("La nuova password e la conferma non coincidono");
      return;
    }
    if (!userEmail) {
      setError("Impossibile determinare l'email utente");
      return;
    }

    setLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        setError("La password attuale non è corretta");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setMessage("Password aggiornata con successo!");
    } catch (err) {
      setError("Errore sconosciuto durante il cambio password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <ManagerSettingsHeader title="Login and Security" />

        <div className="max-w-md bg-white rounded-lg shadow p-6">
          <form onSubmit={handleChangePassword} className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </form>

          {error && <p className="text-red-600 mt-4">{error}</p>}
          {message && <p className="text-green-600 mt-4">{message}</p>}
        </div>
      </div>
    </ManagerLayout>
  );
}
