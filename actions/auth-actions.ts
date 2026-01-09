'use server'

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/constants'; // Pastikan path import benar

export async function createSession(uid: string) {
  // Set cookie yang akan dibaca oleh Middleware
  cookies().set(SESSION_COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 minggu
    path: '/',
  });
}

export async function removeSession() {
  // Hapus cookie saat logout
  cookies().delete(SESSION_COOKIE_NAME);
}