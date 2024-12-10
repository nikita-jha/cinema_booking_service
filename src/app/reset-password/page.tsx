"use client";

import { useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/application/firebase/config";

const ResetPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        const oobCode = searchParams.get("oobCode"); // Extract the oobCode from the URL

        if (!oobCode) {
            setErrorMessage("Invalid or missing reset link.");
            return;
        }

        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setErrorMessage('');
            router.push("/confirmation-reset");
        } catch (error) {
            console.error("Error resetting password:", error);
            setErrorMessage("Failed to reset the password. Please try again.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center">
                <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-10">
                    <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Reset Password</h1>
                    <form onSubmit={handlePasswordReset} className="space-y-6">
                        <div>
                            <label htmlFor="newPassword" className="block text-lg font-medium text-gray-700">
                                New Password:
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                placeholder="Enter your new password"
                                required
                                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg text-gray-800"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg hover:bg-blue-700 transition duration-200">
                            Reset Password
                        </button>
                    </form>
                    {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
