"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../controller/firebase/config';
import { db } from '../../controller/firebase/config';
import { doc, updateDoc } from 'firebase/firestore'; 
import Navbar from '../../../components/Navbar';

const EmailConfirmationPage = () => {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const checkEmailVerification = async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload(); // Reload user to get updated emailVerified status
                if (user.emailVerified) {
                    setIsVerified(true);

                    // Update emailVerification status to 'verified' in Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    await updateDoc(userDocRef, {
                        emailVerification: "verified"
                    });

                    // Automatically sign out and redirect to login after verification
                    auth.signOut().then(() => {
                        setTimeout(() => router.push('/login'), 3000);
                    });
                }
            }
        };

        const intervalId = setInterval(checkEmailVerification, 3000);

        return () => clearInterval(intervalId);
    }, [router]);

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <h1 className="text-3xl font-bold mb-8 text-center">Registration Confirmation</h1> 
                </div>
                <div className="flex justify-center">
                    <div className="bg-white border rounded-lg shadow-md p-12 max-w-3xl text-center w-full">
                        <h1 className="text-5xl font-bold mb-6 text-gray-900">Confirm Your Email Address</h1> 
                        {isVerified ? (
                            <p className="text-xl mb-4 text-gray-800">Your email has been verified. You will be redirected to the login page shortly.</p>
                        ) : (
                            <p className="text-xl mb-4 text-gray-800">Please check your inbox and click the verification link to confirm your email address.</p>
                        )}

                        <p className="text-xl mt-6 text-gray-500">Once your email is verified, you can proceed to log in.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmationPage;
