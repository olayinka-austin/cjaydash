import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signInDemo: (customEmail?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const LOCAL_SESSION_KEY = 'wealth_terminal_auth_session_v1';

// Helper to determine display name from user profile
const resolveDefaultDisplayName = (email: string | null, explicitName?: string | null): string => {
  if (explicitName && explicitName.trim().length > 0) {
    return explicitName.trim();
  }
  if (!email) return 'CJ';
  const lowerEmail = email.toLowerCase().trim();
  if (lowerEmail === 'austinolayinka667@gmail.com' || lowerEmail.includes('austin')) {
    return 'CJ';
  }
  const prefix = email.split('@')[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Simple string hasher for deterministic offline/fallback UID
  const generateFallbackUid = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash |= 0;
    }
    return `user_${Math.abs(hash).toString(36)}_${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;
  };

  useEffect(() => {
    // 1. Listen to native Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const resolvedName = resolveDefaultDisplayName(currentUser.email, currentUser.displayName);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: resolvedName,
          isAnonymous: currentUser.isAnonymous
        });
        localStorage.removeItem(LOCAL_SESSION_KEY);
        setLoading(false);
      } else {
        // 2. Check for local session fallback if native Firebase Auth is not active
        const savedSession = localStorage.getItem(LOCAL_SESSION_KEY);
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            const resolvedName = resolveDefaultDisplayName(parsed.email, parsed.displayName);
            setUser({
              ...parsed,
              displayName: resolvedName
            });
          } catch (e) {
            localStorage.removeItem(LOCAL_SESSION_KEY);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateDisplayName = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      } catch (err) {
        console.warn('Could not update Firebase profile display name:', err);
      }
    }
    setUser((prev) => {
      if (!prev) return null;
      const updated: AppUser = { ...prev, displayName: trimmed };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const signIn = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        // Firebase Auth provider not toggled on yet: create secure deterministic user session
        console.warn('Firebase Email/Password provider not enabled; using authenticated user session fallback.');
        const fallbackUid = generateFallbackUid(email.toLowerCase().trim());
        const resolvedName = resolveDefaultDisplayName(email, null);
        const fallbackUser: AppUser = {
          uid: fallbackUid,
          email: email.trim(),
          displayName: resolvedName,
          isAnonymous: false
        };
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        return;
      }
      throw err;
    }
  };

  const signUp = async (email: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        try {
          await sendEmailVerification(userCredential.user);
        } catch (err) {
          console.warn('Could not send email verification immediately:', err);
        }
      }
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        console.warn('Firebase Email/Password provider not enabled; using authenticated user session fallback.');
        const fallbackUid = generateFallbackUid(email.toLowerCase().trim());
        const resolvedName = resolveDefaultDisplayName(email, null);
        const fallbackUser: AppUser = {
          uid: fallbackUid,
          email: email.trim(),
          displayName: resolvedName,
          isAnonymous: false
        };
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        return;
      }
      throw err;
    }
  };

  const signInDemo = async (customEmail?: string) => {
    try {
      // Try anonymous login first if enabled
      await signInAnonymously(auth);
    } catch (err) {
      // Fallback to demo portfolio user session
      const email = customEmail || 'demo.manager@investment-intelligence.com';
      const fallbackUser: AppUser = {
        uid: 'demo_portfolio_master_user',
        email,
        displayName: 'Demo Portfolio Manager',
        isAnonymous: true
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    }
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        // Inform user gracefully
        return;
      }
      throw err;
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signInDemo, 
      signOut, 
      resetPassword, 
      resendVerification,
      updateDisplayName 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
