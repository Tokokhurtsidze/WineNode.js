import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import type { UserProfile } from '../types/user';
import { useCartStore } from '../stores/useCartStore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUserProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    const profile: Omit<UserProfile, 'createdAt'> & { createdAt: any } = {
      uid: newUser.uid,
      email,
      displayName,
      role: 'user',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', newUser.uid), profile);
  };

  const loginWithGoogle = async () => {
    const { user: googleUser } = await signInWithPopup(auth, googleProvider);
    try {
      const ref = doc(db, 'users', googleUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName || googleUser.email,
          role: 'user',
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      // Firestore write blocked by security rules — auth still succeeded
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearCart();
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
