// apps/web-customer/app/settings/login-and-security/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import CustomerLayout from "../../CustomerLayout";
import SettingsHeader from "@components/settings/SettingsHeader";

export default function CustomerSettingsLoginSecurityPage() {
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
        setError("Unable to retrieve user");
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
      setError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!userEmail) {
      setError("User email is missing");
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        setError("Current password is incorrect");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError("Unexpected error while changing password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerLayout>
      <div className="px-6 py-12 max-w-screen-md mx-auto">
        <SettingsHeader title="Login and Security" />

        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow p-6">
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
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 text-sm font-medium"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
          {message && <p className="text-green-600 mt-4 text-sm">{message}</p>}
        </div>
      </div>
    </CustomerLayout>
  );
}