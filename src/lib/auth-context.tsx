"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

export type UserProfile = {
  role: "client" | "staff";
  email: string;
  orderIds: string[];
};

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      unsubProfile?.();
      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }

      const userRef = doc(db, "users", user.uid);
      unsubProfile = onSnapshot(userRef, async (snap) => {
        if (!snap.exists()) {
          // Self-registration always creates role: "client".
          await setDoc(userRef, {
            role: "client",
            email: user.email ?? "",
            orderIds: [],
            createdAt: serverTimestamp(),
          });
          return;
        }
        const data = snap.data();
        setState({
          user,
          profile: {
            role: data.role === "staff" ? "staff" : "client",
            email: data.email ?? user.email ?? "",
            orderIds: data.orderIds ?? [],
          },
          loading: false,
        });
      });
    });

    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
