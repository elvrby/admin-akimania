"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, getUserRoles } from "@/libs/firebase/auth";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { User } from "firebase/auth";
import { firebaseFirestore } from "@/libs/firebase/config";
import AdminSidebar from "../../../components/admin/adminSidebar";

interface WarrantyData {
  id: string;
  warrantyCode: string;
  purchaseDate: string;
  expiration: string;
}

const WarrantyPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [warranties, setWarranties] = useState<WarrantyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Ambil data auth dan statistik
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const roles = await getUserRoles(authUser.uid);
        setIsAdmin(roles === "admin");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchWarranties = async (search: string = "") => {
    try {
      const colRef = collection(firebaseFirestore, "warranty");
      let q = search ? query(colRef, where("warrantyCode", "==", search)) : colRef;

      const snapshot = await getDocs(q);
      const fetched: WarrantyData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          warrantyCode: data.warrantyCode,
          purchaseDate: new Date(data.purchaseDate.seconds * 1000).toISOString().split("T")[0],
          expiration: new Date(data.expiration.seconds * 1000).toISOString().split("T")[0],
        };
      });

      setWarranties(fetched);
    } catch (error) {
      console.error("Gagal mengambil data garansi:", error);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(firebaseFirestore, "warranty", id));
      setWarranties((prev) => prev.filter((item) => item.id !== id));
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Gagal menghapus garansi:", error);
    }
  };

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  const handleSearch = () => {
    fetchWarranties(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchWarranties();
  };

  const isExpired = (expiration: string) => {
    return new Date(expiration) < new Date();
  };

  const getStatusBadge = (expiration: string) => {
    const expirationDate = new Date(expiration);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    } else if (daysUntilExpiry <= 30) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Expiring Soon</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-ping mx-auto opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading warranty data...</p>
        </div>
      </div>
    );
  }
  if (!isLoading && (!user || !isAdmin)) {
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
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex flex-1">
        <AdminSidebar onToggle={handleSidebarToggle} />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : "lg:ml-16"}`}>
          <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Warranty Management</h1>
                    <p className="text-slate-600 text-base sm:text-lg">Kelola dan pantau semua garansi produk</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active: {warranties.filter((w) => !isExpired(w.expiration)).length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Expired: {warranties.filter((w) => isExpired(w.expiration)).length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Total: {warranties.length}</span>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari berdasarkan kode garansi..."
                      className="pl-10 pr-4 py-2.5 sm:py-3 text-black border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all duration-200"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="hidden sm:inline">Search</span>
                    </button>
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all duration-200 flex items-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Warranty Table - Desktop */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kode Garansi</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal Pembelian</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal Expired</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {warranties.length > 0 ? (
                        warranties.map((warranty) => (
                          <tr key={warranty.id} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{warranty.warrantyCode}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">{warranty.purchaseDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">{warranty.expiration}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(warranty.expiration)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setShowDeleteModal(warranty.id)}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-12 text-center text-slate-500 col-span-full" colSpan={5}>
                            <div className="flex flex-col items-center space-y-3">
                              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <div className="text-slate-500">
                                <p className="text-lg font-medium">No warranty data found</p>
                                <p className="text-sm">Try adjusting your search or add new warranty</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warranty Cards - Mobile */}
              <div className="md:hidden space-y-4">
                {warranties.length > 0 ? (
                  warranties.map((warranty) => (
                    <div key={warranty.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900 text-sm">{warranty.warrantyCode}</h3>
                          <p className="text-xs text-slate-500 mt-1">Warranty Code</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(warranty.expiration)}
                          <button onClick={() => setShowDeleteModal(warranty.id)} className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Purchase Date</p>
                          <p className="text-sm font-medium text-slate-900">{warranty.purchaseDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Expiration Date</p>
                          <p className="text-sm font-medium text-slate-900">{warranty.expiration}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="text-slate-500">
                      <p className="text-lg font-medium">No warranty data found</p>
                      <p className="text-sm">Try adjusting your search or add new warranty</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Confirm Delete</h3>
            </div>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this warranty? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors duration-200">
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyPage;
