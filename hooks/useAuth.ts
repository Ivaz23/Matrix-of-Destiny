
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signInGuest as fbSignInGuest, 
  signInWithTelegram as fbSignInTelegram,
  getLocalCustomUser,
  resetPassword,
  logout 
} from '../services/firebase';

export interface AppAuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  providerId?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AppAuthUser | User | null>(() => getLocalCustomUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // First check local custom/telegram user
    const localUser = getLocalCustomUser();
    if (localUser && isMounted) {
      setUser(localUser);
      setLoading(false);
    }

    // Safety timeout: If Firebase auth hangs in iframe/preview, don't block the UI
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    try {
      const unsubscribe = onAuthStateChanged(
        auth, 
        (currentUser) => {
          if (isMounted) {
            if (currentUser) {
              setUser(currentUser);
            } else {
              const currentLocal = getLocalCustomUser();
              setUser(currentLocal);
            }
            setLoading(false);
            clearTimeout(timer);
          }
        },
        (error) => {
          console.warn("Firebase onAuthStateChanged error:", error);
          if (isMounted) {
            setLoading(false);
            clearTimeout(timer);
          }
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(timer);
        unsubscribe();
      };
    } catch (e) {
      console.warn("Failed to subscribe to auth state:", e);
      setLoading(false);
      clearTimeout(timer);
    }
  }, []);

  const handleTelegramSignIn = async (telegramInput: { username?: string; id?: string; first_name?: string; photo_url?: string }) => {
    const tgUser = await fbSignInTelegram(telegramInput);
    setUser(tgUser);
    return tgUser;
  };

  const handleGuestSignIn = async () => {
    const guestUser = await fbSignInGuest();
    setUser(guestUser);
    return guestUser;
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  return {
    user,
    loading,
    signIn: signInWithGoogle,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithTelegram: handleTelegramSignIn,
    signInGuest: handleGuestSignIn,
    resetPassword,
    signOut: handleSignOut
  };
};


