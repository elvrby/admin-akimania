"use client";

import Link from "next/link";
import { useUserSession } from "@/hooks/use-user-session";
import { signInWithGoogle, signOutWithGoogle } from "@/libs/firebase/auth";
import { createSession, removeSession } from "@/actions/auth-actions";

export function AdminHeader({ session }: { session: string | null }) {
  const userSessionId = useUserSession(session);

  const handleSignIn = async () => {
    const userUid = await signInWithGoogle();
    if (userUid) {
      await createSession(userUid);
    }
  };

  const handleSignOut = async () => {
    await signOutWithGoogle();
    await removeSession();
  };

  return (
    <header className="sticky top-0 z-10 w-full flex items-center justify-between p-4 bg-black text-white h-16">
      {!userSessionId ? (
        <button onClick={handleSignIn}>Sign In</button>
      ) : (
        <>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link className="hover:text-gray-400" href="/home">
                  Home
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400">
                  Terms & Use
                </a>
              </li>
            </ul>
          </nav>
          <button onClick={handleSignOut} className="bg-purple-600 hover:bg-green-600 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </>
      )}
    </header>
  );
}

export default AdminHeader;
