
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
  getDoc 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with robust multi-tab local caching and auto-detected long polling
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalAutoDetectLongPolling: true
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
    return "Данный способ входа временно отключен в конфигурации проекта.";
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
    console.error("Error signing in anonymously:", error);
    throw new Error(formatAuthError(error));
  }
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

export const logout = () => signOut(auth);


