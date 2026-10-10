import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or initialize user profile in Firestore
  const fetchUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      } else {
        // Create new user profile document for first-time Google sign in
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Valued Guest',
          role: 'user',
          wishlist: [],
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, newProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      // Fallback in-memory profile
      setUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Valued Guest',
        role: 'user',
        wishlist: [],
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, provider);
    if (res.user) {
      await fetchUserProfile(res.user);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!currentUser || !userProfile) {
      return false; // Not logged in
    }

    const currentWishlist = userProfile.wishlist || [];
    const isSaved = currentWishlist.includes(productId);
    const updatedWishlist = isSaved
      ? currentWishlist.filter((id) => id !== productId)
      : [...currentWishlist, productId];

    // Optimistic UI update
    const updatedProfile = { ...userProfile, wishlist: updatedWishlist };
    setUserProfile(updatedProfile);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { wishlist: updatedWishlist });
    } catch (err) {
      console.error('Error updating wishlist in Firestore:', err);
      // Try fallback setDoc with merge if updateDoc fails
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { wishlist: updatedWishlist }, { merge: true });
      } catch (innerErr) {
        handleFirestoreError(innerErr, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }

    return true; // Operation completed
  };

  const isInWishlist = (productId: string): boolean => {
    if (!userProfile || !userProfile.wishlist) return false;
    return userProfile.wishlist.includes(productId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        logout,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
