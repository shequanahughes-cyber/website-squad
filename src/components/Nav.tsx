"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export default function Nav() {
  const { user, profile, loading } = useAuth();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg text-headline">
          Web Design Squad
        </Link>
        <nav className="flex items-center gap-6 text-sm text-body">
          <Link href="/order" className="hover:text-headline">
            Order
          </Link>
          <Link href="/terms" className="hover:text-headline">
            Terms
          </Link>
          {!loading && user && profile?.role === "staff" && (
            <Link href="/staff/dashboard" className="hover:text-headline">
              Staff dashboard
            </Link>
          )}
          {!loading && user && profile?.role === "client" && (
            <Link href="/dashboard" className="hover:text-headline">
              Dashboard
            </Link>
          )}
          {!loading && user && (
            <button
              type="button"
              onClick={() => signOut(getFirebaseAuth())}
              className="hover:text-headline"
            >
              Log out
            </button>
          )}
          {!loading && !user && (
            <Link href="/login" className="hover:text-headline">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
