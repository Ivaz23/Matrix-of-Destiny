
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signInGuest, 
  resetPassword,
  logout 
} from '../services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: If Firebase auth hangs in iframe/preview, don't block the UI
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    try {
      const unsubscribe = onAuthStateChanged(
        auth, 
        (currentUser) => {
          if (isMounted) {
            setUser(currentUser);
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

  return {
    user,
    loading,
    signIn: signInWithGoogle,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInGuest,
    resetPassword,
    signOut: logout
  };
};

