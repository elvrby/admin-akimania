"use client";
import Link from "next/link";
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/libs/firebase/config";

const AdminSidebar: React.FC<{ onToggle: (isOpen: boolean) => void }> = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle(newState);
  };

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      window.location.href = "/"; // arahkan ke halaman login setelah logout
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const menuItems = [
    {
      href: "/admin/addWarranty",
      label: "Add Warranty",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      href: "/admin/Warranty",
      label: "Warranty",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      href: "/trashbin",
      label: "Trash Bin",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-[calc(100vh)] bg-gradient-to-b from-slate-100 hidden lg:block to-slate-100 transition-all duration-300 ease-in-out ${
          isOpen ? "w-80" : "w-16"
        } overflow-hidden z-30 border-r border-slate-200/50 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Toggle Button */}
          <div className="flex items-center justify-end p-4">
            <button onClick={toggleSidebar} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all duration-200 hover:scale-105  border border-slate-300/50">
              <svg className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Header - Hidden when collapsed */}
          {isOpen && (
            <div className="px-6 pb-6 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0..." />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-black text-xl font-bold">Admin Panel</h2>
                  <p className="text-slate-400 text-sm">Management System</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 px-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="group">
                    <div
                      className={`flex items-center ${
                        isOpen ? "px-4 py-3" : "px-3 py-3 justify-center"
                      } rounded-xl transition-all duration-200 hover:bg-slate-700/50 hover:transform hover:scale-105 cursor-pointer border border-transparent hover:border-slate-600/30 hover:shadow-lg`}
                    >
                      <div className="text-slate-300 group-hover:text-white transition-colors duration-200 flex-shrink-0">{item.icon}</div>
                      {isOpen && <span className="ml-3 text-slate-500 group-hover:text-white font-medium transition-all duration-300 whitespace-nowrap">{item.label}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500/30 transition-all ${isOpen ? "justify-start" : "justify-center"}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              {isOpen && <span className="ml-2 font-medium whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Apakah Anda yakin untuk keluar?</h2>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Yes
              </button>
              <button onClick={() => setShowLogoutConfirm(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
