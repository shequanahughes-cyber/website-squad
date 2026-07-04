"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();

export default function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithPopup(getFirebaseAuth(), googleProvider);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <p className="eyebrow mb-2">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </p>
      <h1 className="font-serif text-2xl text-headline">
        {mode === "signup" ? "Sign up" : "Log in"}
      </h1>

      <form onSubmit={handleEmailPassword} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-headline outline-none focus:border-accent"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-headline outline-none focus:border-accent"
        />
        {error && <p className="text-[12px] text-accent-text">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] text-muted">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-headline hover:bg-panel disabled:opacity-50"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-[12px] text-body">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent-text">
              Log in
            </Link>
          </>
        ) : (
          <>
            Need an account?{" "}
            <Link href="/signup" className="text-accent-text">
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
