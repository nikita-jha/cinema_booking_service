"use client";

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword, browserSessionPersistence, browserLocalPersistence, setPersistence, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '../../context/UserContext';

const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { setUser } = useUser();

    useEffect(() => {
        // Check if user credentials are stored in localStorage
        const savedEmail = localStorage.getItem("rememberedEmail");
        const savedPassword = localStorage.getItem("rememberedPassword");
        const savedRememberMe = localStorage.getItem("rememberMe") === 'true';

        if (savedEmail && savedPassword && savedRememberMe) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({
                        id: firebaseUser.uid,
                        name: userData.name || '',
                        email: firebaseUser.email || '',
                        userType: userData.userType,
                    });
                    if (userData.userType === 'Customer') {
                        router.push('/');
                    } else {
                        router.push('/adminHome');
                    }
                }
            } else {
                setUser(null);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [setUser, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userType = userData.userType;

                localStorage.setItem("user", JSON.stringify(userData));

                // If "Remember Me" is checked, store email and password
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email);
                    localStorage.setItem("rememberedPassword", password);
                    localStorage.setItem("rememberMe", 'true');
                } else {
                    localStorage.removeItem("rememberedEmail");
                    localStorage.removeItem("rememberedPassword");
                    localStorage.setItem("rememberMe", 'false');
                }

                setUser({
                    id: userCredential.user.uid,
                    name: `${userData.firstName} ${userData.lastName}` || '',
                    email: userCredential.user.email || '',
                    userType: userType,
                });

                if (userType.toLowerCase() === 'customer') {
                    router.push('/');
                } else if (userType.toLowerCase() === 'admin') {
                    router.push('/adminHome');
                }

            } else {
                console.error("User document not found");
                setErrorMessage("User data not found. Please contact support.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Login failed. Please check your email and password.");
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
                        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Login</h1>
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="username" className="block text-lg font-medium text-gray-700">
                                    Email: <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="username"
                                    placeholder="Enter your email"
                                    required
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg text-gray-800"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                                    Password: <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    required
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg text-gray-800"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
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
