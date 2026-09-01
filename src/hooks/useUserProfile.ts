"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { UserProfile, Location } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          role: "user",
          homeLocation: null,
          notificationRadius: 5,
        };
        setDoc(userRef, defaultProfile);
        setProfile(defaultProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateHomeLocation = async (location: Location) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { homeLocation: location }, { merge: true });
  };

  const updateNotificationRadius = async (radius: number) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { notificationRadius: radius }, { merge: true });
  };

  return { profile, loading, updateHomeLocation, updateNotificationRadius };
}
