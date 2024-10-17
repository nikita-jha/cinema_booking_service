"use client"; // Add this line to indicate it's a client component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import { auth } from '../../lib/firebase/config'; // Firebase auth import
import Navbar from '../../components/Navbar';
import Link from 'next/link';

const EmailConfirmationPage = () => {
    const router = useRouter();

    // Check if the user has verified their email
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const user = auth.currentUser;

            if (user) {
                await user.reload(); // Reload user data to get the latest info
                if (user.emailVerified) {
                    console.log('Email is verified!');
                    clearInterval(intervalId); // Stop the interval once verified
                    router.push('/login'); // Redirect to login page
                }
            }
        }, 3000); // Check every 3 seconds

        // Cleanup the interval when the component is unmounted
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
                        <h1 className="text-5xl font-bold mb-6">Confirm Your Email Address</h1> 
                        <p className="text-xl mb-4">Please check your email for a confirmation link to verify your account.</p>
                        <p className="text-xl">
                            If you haven't received the email, you can 
                            <Link href="/resend-confirmation" className="text-blue-500 underline"> click here to resend it</Link>.
                        </p>
                        <p className="text-xl mt-6 text-gray-500">Once your email is verified, you will be redirected to the login page.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmationPage;
