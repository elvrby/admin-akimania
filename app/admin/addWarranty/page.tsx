"use client";
import AdminSidebar from "../../../components/admin/adminSidebar";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, getUserRoles } from "@/libs/firebase/auth";
import SendWarranty from "@/components/GenerateWarranty";

const AddWarrantyPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ username: string; uid: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [warrantyDuration, setWarrantyDuration] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(true);

  const warrantyOptions = [
    { value: 1, label: "1 Bulan" },
    { value: 2, label: "2 Bulan" },
    { value: 6, label: "6 Bulan" },
    { value: 12, label: "1 Tahun" },
    { value: 24, label: "2 Tahun" },
    { value: 36, label: "3 Tahun" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const roles = await getUserRoles(authUser.uid);
        setIsAdmin(roles === "admin");
        setUser({
          username: authUser.displayName || "No username",
          uid: authUser.uid,
        });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  const handleDurationChange = (duration: number) => {
    setWarrantyDuration(duration);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-slate-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Not Found</h1>
          <p className="text-lg text-slate-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1">
        <AdminSidebar onToggle={handleSidebarToggle} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-80" : "ml-16"}`}>
          <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Generator Garansi</h1>
                </div>
                <p className="text-gray-600 text-lg">Buat dan kelola garansi produk dengan mudah</p>
              </div>

              {/* Main Section */}
              <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Selamat datang, {user.username}!</h3>
                      <p className="text-gray-500 text-sm">ID: {user.uid}</p>
                    </div>
                  </div>
                </div>

                {/* Durasi Garansi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pilih Durasi Garansi
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {warrantyOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDurationChange(option.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-center hover:shadow-md ${
                          warrantyDuration === option.value ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.value} bulan</div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-800 font-medium">Durasi yang dipilih:</span>
                      <span className="text-indigo-600 font-bold">{warrantyOptions.find((opt) => opt.value === warrantyDuration)?.label}</span>
                    </div>
                  </div>
                </div>

                {/* Komponen Generate Garansi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Buat Garansi Baru
                  </h3>

                  <SendWarranty username={user.username} uid={user.uid} warrantyDuration={warrantyDuration} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddWarrantyPage;
