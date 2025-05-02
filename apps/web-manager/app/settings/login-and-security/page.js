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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
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
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (!userEmail) {
      setError("Unable to retrieve user email.");
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        setError("Current password is incorrect.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setMessage("Password updated successfully!");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagerLayout>
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <ManagerSettingsHeader title="Login and Security" />

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Change Password</h2>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {error && <p className="text-red-600 mt-4 text-sm font-medium">{error}</p>}
          {message && <p className="text-green-600 mt-4 text-sm font-medium">{message}</p>}
        </div>
      </div>
    </ManagerLayout>
  );
}
