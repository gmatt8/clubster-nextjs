// apps/web-manager/app/settings/scan-access/page.js
'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@lib/supabase-browser';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import ManagerLayout from '../../ManagerLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ScanAccessPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [clubId, setClubId] = useState(null);

  const supabase = createBrowserSupabase();

  useEffect(() => {
    const fetchClubId = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found");
        setLoading(false);
        return;
      }

      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("id")
        .eq("manager_id", user.id)
        .single();

      if (clubError || !clubData?.id) {
        console.error("Club not found for manager:", clubError);
        setLoading(false);
        return;
      }

      setClubId(clubData.id);
      fetchCodes();
    };

    fetchClubId();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scan-access', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCodes(data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!clubId) {
      alert("Missing club_id");
      return;
    }

    const name = prompt("Enter a name for this access code:");
    if (!name) return;

    setCreating(true);

    const body = {
      name,
      club_id: clubId,
      expires_at: null,
    };

    try {
      const res = await fetch('/api/scan-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const newData = await res.json();
      if (!res.ok) throw new Error(newData.error);

      if (Array.isArray(newData) && newData.length > 0) {
        setCodes((prev) => [newData[0], ...prev]);
      }
    } catch (e) {
      console.error("Create error:", e);
      alert('Error: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this code?')) return;

    try {
      const res = await fetch(`/api/scan-access?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Delete error:", e);
      alert('Could not delete code');
    }
  };

  return (
    <ManagerLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Scan Access Codes</h1>
          <button
            onClick={handleCreateCode}
            disabled={creating}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {creating ? 'Creating...' : 'New Code'}
          </button>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Created</th>
                <th className="px-4 py-3 text-left font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center">
                    <LoadingSpinner className="mx-auto h-6 w-6 text-indigo-600" />
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No access codes found.
                  </td>
                </tr>
              ) : (
                codes.map((code) => (
                  <tr key={code.id}>
                    <td className="px-4 py-3 font-mono text-indigo-700">{code.code}</td>
                    <td className="px-4 py-3">{code.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(code.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(code.id)}>
                        <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerLayout>
  );
}
