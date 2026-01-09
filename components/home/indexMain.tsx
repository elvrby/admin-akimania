"use client";

import { Inter } from 'next/font/google';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Firebase Imports ---
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { firebaseAuth } from '@/libs/firebase/config'; 
import { signInWithGoogle } from '@/libs/firebase/auth'; 

// --- Server Action Import (PENTING untuk Middleware) ---
import { createSession } from '@/actions/auth-actions';

const inter = Inter({ subsets: ['latin'] });

const IndexMain: React.FC = () => {
  const router = useRouter();
  
  // State Management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Helper: Handle Post-Login (Cookie & Redirect) ---
  const handleAuthSuccess = async (uid: string) => {
    try {
      // 1. Panggil Server Action untuk set Cookie 'user_session'
      await createSession(uid);
      
      // 2. Redirect ke halaman admin
      // Gunakan 'refresh' agar Next.js mengevaluasi ulang route berdasarkan cookie baru
      router.refresh(); 
      router.replace('/app/admin'); // Gunakan replace agar user tidak bisa back ke login
    } catch (err) {
      console.error("Session creation failed:", err);
      setError("Gagal membuat sesi login.");
      setLoading(false);
    }
  };

  // --- Handle Login: Email & Password ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Login ke Firebase (Client Side)
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      
      // 2. Jika sukses, pasang cookie session & redirect
      console.log("Login Email sukses");
      await handleAuthSuccess(userCredential.user.uid);

    } catch (err: any) {
      console.error(err);
      setLoading(false); // Stop loading jika error
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Email atau password salah.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan. Silakan coba lagi nanti.");
      } else {
        setError("Terjadi kesalahan: " + err.message);
      }
    }
  };

  // --- Handle Login: Google ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Login Google (menggunakan helper Anda)
      const uid = await signInWithGoogle();
      
      if (uid) {
        console.log("Login Google sukses, UID:", uid);
        // 2. Jika sukses, pasang cookie session & redirect
        await handleAuthSuccess(uid);
      } else {
        // User menutup popup / cancel
        setLoading(false);
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("Gagal login dengan Google.");
      setLoading(false);
    }
  };

  return (
    <main className={`${inter.className} min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk ke akun Anda
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Email/Password */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">Ingat saya</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Lupa password?</a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : "Masuk dengan Email"}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Atau</span>
          </div>
        </div>

        {/* Tombol Google */}
        <div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full inline-flex justify-center py-3 px-4 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Masuk dengan Google
          </button>
        </div>

        <p className="mt-2 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Daftar sekarang
          </a>
        </p>

      </div>
    </main>
  );
};

export default IndexMain;