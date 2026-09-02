
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile,
  signOut 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  doc, 
  setDoc, 
  getDoc,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress benign connection retry / offline info logs in console
try {
  setLogLevel('error');
} catch (e) {
  // Ignore if already set
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with robust multi-tab local caching and forced long polling for sandboxed iframes
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalForceLongPolling: true
  },
  firebaseConfig.firestoreDatabaseId
);

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Translate Firebase Auth error codes to user-friendly Russian messages
export function formatAuthError(error: any): string {
  if (!error) return "Произошла неизвестная ошибка авторизации";
  const code = error.code || "";
  const msg = error.message || String(error);

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return "Неверный email или пароль. Пожалуйста, проверьте введенные данные или зарегистрируйтесь.";
  }
  if (code === 'auth/invalid-email') {
    return "Некорректный формат адреса электронной почты (например: user@example.com).";
  }
  if (code === 'auth/email-already-in-use') {
    return "Пользователь с таким email уже зарегистрирован. Пожалуйста, войдите в систему.";
  }
  if (code === 'auth/weak-password') {
    return "Слишком простой пароль. Пароль должен содержать минимум 6 символов.";
  }
  if (code === 'auth/user-disabled') {
    return "Данный аккаунт был заблокирован.";
  }
  if (code === 'auth/too-many-requests') {
    return "Слишком много неудачных попыток входа. Пожалуйста, подождите несколько минут или сбросьте пароль.";
  }
  if (code === 'auth/network-request-failed') {
    return "Сетевая ошибка при подключении к сервису авторизации. Проверьте интернет или включите офлайн-режим.";
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return "Окно входа Google было закрыто до завершения.";
  }
  if (code === 'auth/operation-not-allowed') {
    return "Вход через Google временно отключен в консоли Firebase для данного проекта. Войдите с помощью Email и пароля или выберите «Быстрый вход в 1 клик».";
  }
  if (code === 'auth/unauthorized-domain') {
    return "Домен приложения не добавлен в список разрешенных в Firebase Auth (Authorized Domains). Чтобы войти через Google, добавьте домен run.app в Firebase Console -> Authentication -> Settings -> Authorized domains, либо используйте надежный вход через Email / Пароль.";
  }
  if (code === 'auth/popup-blocked') {
    return "Всплывающее окно Google заблокировано браузером. Разрешите всплывающие окна или используйте вход по email.";
  }

  return msg.replace('Firebase: ', '');
}

// Safe connection validation
export async function testConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error) {
    // Gracefully handle offline or network delay
    console.debug("Firestore offline or local-cache active:", error);
  }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create or update user profile in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Искатель',
        photoURL: user.photoURL,
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.warn("Could not sync user profile to Firestore (using local session):", dbErr);
    }
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return null;
    }
    console.error("Error signing in with Google:", error);
    throw new Error(formatAuthError(error));
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Искатель',
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.warn("Firestore sync skipped:", dbErr);
    }
    
    return user;
  } catch (error: any) {
    console.error("Error signing in with Email:", error);
    throw new Error(formatAuthError(error));
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;
    
    const resolvedName = displayName?.trim() || email.split('@')[0] || 'Искатель';
    try {
      await updateProfile(user, { displayName: resolvedName });
    } catch (pErr) {
      console.warn("Could not update profile name:", pErr);
    }

    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: resolvedName,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.warn("Firestore sync skipped:", dbErr);
    }

    return user;
  } catch (error: any) {
    console.error("Error creating account with Email:", error);
    throw new Error(formatAuthError(error));
  }
};

export const signInGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.warn("Firebase anonymous auth skipped/offline, using robust local session:", error);
    // Create instant persistent guest session
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
    const guestUser = {
      uid: guestId,
      displayName: 'Гость (Автономно)',
      email: null,
      photoURL: null,
      isAnonymous: true,
      providerId: 'anonymous'
    };
    localStorage.setItem('chubuk_local_user', JSON.stringify(guestUser));
    return guestUser as any;
  }
};

export const signInWithTelegram = async (telegramInput: { username?: string; id?: string; first_name?: string; photo_url?: string }) => {
  const cleanUsername = (telegramInput.username || telegramInput.first_name || 'Странник').replace('@', '').trim();
  const tgId = telegramInput.id || 'tg_' + Math.random().toString(36).substring(2, 9);
  const tgUser = {
    uid: `tg_${tgId}`,
    displayName: `@${cleanUsername}`,
    email: `${cleanUsername.toLowerCase()}@telegram.user`,
    photoURL: telegramInput.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    isAnonymous: false,
    providerId: 'telegram'
  };

  localStorage.setItem('chubuk_local_user', JSON.stringify(tgUser));

  // Try to sync to Firestore if connected
  try {
    await setDoc(doc(db, 'users', tgUser.uid), {
      ...tgUser,
      authProvider: 'telegram',
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.debug("Firestore offline sync skipped for Telegram user (session saved locally):", e);
  }

  return tgUser as any;
};

export const getLocalCustomUser = () => {
  try {
    const raw = localStorage.getItem('chubuk_local_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearLocalCustomUser = () => {
  try {
    localStorage.removeItem('chubuk_local_user');
  } catch {}
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  } catch (error: any) {
    console.error("Error sending reset password email:", error);
    throw new Error(formatAuthError(error));
  }
};

export const logout = async () => {
  clearLocalCustomUser();
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("SignOut error:", e);
  }
};



