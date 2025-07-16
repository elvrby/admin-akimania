"use client";
import AdminSidebar from "../../components/admin/adminSidebar";
import { useEffect, useState } from "react";
import Image from "next/image";
import { onAuthStateChanged, getUserRoles } from "@/libs/firebase/auth";
import { User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { firebaseFirestore } from "@/libs/firebase/config";
import Link from "next/link";

const AdminPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalWarranties, setTotalWarranties] = useState(0);

  // Ambil data auth dan statistik
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const roles = await getUserRoles(authUser.uid);
        setIsAdmin(roles === "admin");
        await fetchDashboardStats();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Ambil data users & warranty
  const fetchDashboardStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(firebaseFirestore, "users"));
      const warrantySnapshot = await getDocs(collection(firebaseFirestore, "warranty"));
      setTotalUsers(usersSnapshot.size);
      setTotalWarranties(warrantySnapshot.size);
    } catch (error) {
      console.error("Gagal mengambil statistik:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSidebarToggle = (isOpen: boolean) => {
    if (isDesktop) {
      setIsSidebarOpen(isOpen);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isWide = window.innerWidth >= 1024; // lg: ≥1024px
      setIsDesktop(isWide);
      setIsSidebarOpen(isWide); // otomatis buka sidebar hanya di desktop
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-blue-500 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "3s" }}
            ></div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-white text-2xl font-bold mb-3 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">Loading Dashboard...</h2>
            <p className="text-purple-200 text-sm">Preparing your admin experience</p>
            <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!loading && (!user || !isAdmin)) {
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

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : "lg:ml-16"}`}>
          <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
            {/* Enhanced Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-400/20 via-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/20 via-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            <div className="relative  lg:p-8">
              {/* Enhanced Header */}
              <div className="mb-12 flex items-center justify-between">
                <div className="p-4">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 bg-clip-text text-transparent mb-1">Admin Dashboard</h1>
                  <p className="text-slate-600 text-lg font-medium">Welcome to your management center</p>
                </div>
                <div className="text-right rounded-2xl p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{formatTime(currentTime)}</div>
                  <div className="text-sm text-slate-600 mt-1">{formatDate(currentTime)}</div>
                </div>
              </div>

              {/* Enhanced Welcome Section */}
              <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 mb-10 relative overflow-hidden">
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-2xl"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                    <div className="relative group">
                      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-1 shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300">
                        <Image
                          className="rounded-full w-full h-full object-cover border-4 border-white group-hover:border-purple-100 transition-all duration-300"
                          src="/Image/Logo-akimania.jpg"
                          alt="Logo Akimania"
                          width={144}
                          height={144}
                        />
                      </div>
                      <div className="absolute bottom-3 right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                      <h2 className="lg:text-4xl text-2xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-3">
                        {getGreeting()}, {user?.displayName || "Admin"}! 👋
                      </h2>
                      <p className="text-slate-600 lg:text-xl text-lg mb-6">Ready to manage your Akimania platform today?</p>
                      <div className="flex flex-col sm:flex-row gap-6 text-sm">
                        <div className="flex items-center gap-3 text-slate-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="font-medium">Administrator</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 p-4">
                  <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">+12.5%</div>
                          <div className="text-xs text-slate-500">vs last month</div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm font-medium mb-2">Total Users</p>
                      <p className="text-3xl font-bold text-slate-900 mb-2">{totalUsers.toLocaleString()}</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">+8.2%</div>
                          <div className="text-xs text-slate-500">vs last month</div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm font-medium mb-2">Active Warranties</p>
                      <p className="text-3xl font-bold text-slate-900 mb-2">{totalWarranties.toLocaleString()}</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">+5.7%</div>
                          <div className="text-xs text-slate-500">vs last month</div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm font-medium mb-2">Total Products</p>
                      <p className="text-3xl font-bold text-slate-900 mb-2">55</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full" style={{ width: "91%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link
                        href={"/admin/addWarranty"}
                        passHref
                        className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300 text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="font-medium text-slate-900">Add User</p>
                        <p className="text-xs text-slate-600">Create new user account</p>
                      </Link>

                      <Link
                        href={"/admin/Warranty"}
                        passHref
                        className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300 text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="font-medium text-slate-900">View Reports</p>
                        <p className="text-xs text-slate-600">Analytics and insights</p>
                      </Link>

                      <button className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300 text-left">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="font-medium text-slate-900">Settings</p>
                        <p className="text-xs text-slate-600">Configure system</p>
                      </button>

                      <button className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300 text-left">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4h16zM10 9v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1"
                            />
                          </svg>
                        </div>
                        <p className="font-medium text-slate-900">Backup</p>
                        <p className="text-xs text-slate-600">Data backup tools</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
