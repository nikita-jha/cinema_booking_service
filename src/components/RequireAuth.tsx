"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/controller/firebase/config';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const useRequireAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Reload the Firebase user to check if the email is verified
                await user.reload();

                if (!user.emailVerified) {
                    // Redirect to login if the email is not verified
                    router.push('/login');
                    return; // Stop further execution
                }

                // Fetch the user's document from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.status !== 'active') {
                        // If the user's status is not 'active', redirect to login
                        router.push('/login');
                        return; // Stop further execution
                    }
                }
            } else {
                // If user is not logged in, redirect to login
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);
};

export default useRequireAuth;
