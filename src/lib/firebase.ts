import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Firebase configuration with fallback to embedded project credentials
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: (metaEnv.VITE_FIREBASE_API_KEY as string) || appletConfig.apiKey,
  authDomain: (metaEnv.VITE_FIREBASE_AUTH_DOMAIN as string) || appletConfig.authDomain,
  projectId: (metaEnv.VITE_FIREBASE_PROJECT_ID as string) || appletConfig.projectId,
  storageBucket: (metaEnv.VITE_FIREBASE_STORAGE_BUCKET as string) || appletConfig.storageBucket,
  messagingSenderId: (metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || appletConfig.messagingSenderId,
  appId: (metaEnv.VITE_FIREBASE_APP_ID as string) || appletConfig.appId,
};

const databaseId = appletConfig.firestoreDatabaseId || '(default)';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = 'mdsahil012002@gmail.com';

export async function testConnection() {
  return await getDocFromServer(doc(db, 'test', 'connection'));
}
testConnection().catch(() => {});

export async function syncUserToFirestore(user: User): Promise<boolean> {
  if (!user || !user.uid) return false;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userEmail = user.email?.toLowerCase() || '';
    const isAdminUser = userEmail === ADMIN_EMAIL.toLowerCase();

    const now = new Date().toISOString();

    if (!userSnap.exists()) {
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || '',
          role: isAdminUser ? 'admin' : 'user',
          createdAt: now,
          lastLoginAt: now,
        },
        { merge: true }
      );
      return isAdminUser;
    } else {
      const existingData = userSnap.data();
      const isRoleAdmin = existingData?.role === 'admin' || isAdminUser;
      await setDoc(
        userRef,
        {
          email: user.email || existingData?.email || '',
          displayName: user.displayName || existingData?.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || existingData?.photoURL || '',
          role: isRoleAdmin ? 'admin' : 'user',
          lastLoginAt: now,
        },
        { merge: true }
      );
      return isRoleAdmin;
    }
  } catch (err) {
    console.error('Error syncing user document to Firestore:', err);
    return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }
}

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    if (result?.user) {
      await syncUserToFirestore(result.user);
    }
    return result?.user || null;
  } catch (error: any) {
    // Fall back to redirect if popup is blocked
    if (error?.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        throw redirectErr;
      }
    }
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export { getRedirectResult };

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
