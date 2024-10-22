"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

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
