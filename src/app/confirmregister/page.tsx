"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase/config';
import Navbar from '../../components/Navbar';

const EmailConfirmationPage = () => {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const checkEmailVerification = async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    setIsVerified(true);
                    setTimeout(() => router.push('/login'), 3000);
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

                        <p className="text-xl mt-6 text-gray-500">Once your email is verified, you will be automatically redirected to the login page.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmationPage;
