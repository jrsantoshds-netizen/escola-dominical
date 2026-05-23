import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { DatabaseState } from './db';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize standard exports with specific database ID mapping
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Error specification compliance schema
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check Firestore connectivity as demanded by the Firebase Integration skill
export async function validateConnection() {
  try {
    await getDocFromServer(doc(db, 'ebd', 'state'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client appears offline or connection failed.");
    }
  }
}

// Core database handlers
const DOC_PATH = 'ebd/state';

export async function fetchDatabaseFromCloud(): Promise<DatabaseState | null> {
  try {
    // 1. Try to ensure user is authenticated anonymously if possible
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (authError) {
      console.warn("Anonymous sign-in restricted or failed on Firebase project. Proceeding without auth.", authError);
    }

    const docRef = doc(db, 'ebd', 'state');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DatabaseState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, DOC_PATH);
    return null;
  }
}

export async function saveDatabaseToCloud(state: DatabaseState): Promise<void> {
  try {
    // 2. Try to ensure user is authenticated anonymously if possible
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (authError) {
      console.warn("Anonymous sign-in restricted or failed on Firebase project. Proceeding without auth.", authError);
    }

    const docRef = doc(db, 'ebd', 'state');
    await setDoc(docRef, state);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, DOC_PATH);
  }
}
