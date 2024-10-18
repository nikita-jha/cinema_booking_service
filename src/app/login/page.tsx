"use client";

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent the default form submission
        try {
            // Authenticate user using email and password
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect to a different page after successful login
            // For example: router.push('/dashboard'); // Uncomment and import useRouter
            alert("Login successful!");
        } catch (error) {
            setErrorMessage("Login failed. Please check your email and password.");
            console.error("Login error:", error);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            alert("Please enter your email first.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("Error sending password reset email:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-10">
                        <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="username" className="block text-lg font-medium text-gray-700">
                                    Email:
                                </label>
                                <input
                                    type="email"
                                    id="username"
                                    placeholder="Enter your email"
                                    required
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                                    Password:
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    required
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg hover:bg-blue-700 transition duration-200">
                                    Login
                                </button>
                            </div>
                        </form>
                        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                        <div className="mt-6 flex justify-between text-lg text-blue-500">
                            <Link href="/register" className="hover:underline">Create Account</Link>
                            <a href="#" className="hover:underline" onClick={handleForgotPassword}>
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
