"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth, getCurrentUser } from "@/lib/api";

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role: string;
  is_approved: boolean;
  provider?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getCurrentUser()
      .then((response: any) => {
        // Backend bisa return { user: {...} } atau langsung {...}
        const userData = response.user || response;
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch user info");
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      // Panggil backend untuk invalidasi token di server
      await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "") + "/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(() => {
            // Ambil token dari cookie untuk Authorization
            const match = typeof document !== "undefined"
              ? document.cookie.match(/(?:^|; )token=([^;]*)/)
              : null;
            const token = match ? decodeURIComponent(match[1]) : null;
            return token ? { Authorization: `Bearer ${token}` } : {};
          })(),
        },
      });
    } catch (e) {
      // Abaikan error, lanjutkan hapus cookie di client
    }

    // Hapus cookie (dashboard tidak pakai localStorage)
    document.cookie = "token=; path=/; domain=localhost; Max-Age=0";
    // Redirect ke login 3000
    window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL || "http://localhost:3000/login";
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard B4T</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">User Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-medium text-gray-800">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-lg font-medium text-gray-800">{user.username}</p>
                  </div>
                  {user.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-medium text-gray-800">{user.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {user.provider && (
                    <div>
                      <p className="text-sm text-gray-500">Login Provider</p>
                      <p className="text-lg font-medium text-gray-800 capitalize">{user.provider}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-500 italic">
                  🔒 Session shared dari login di port 3000
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No user data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

