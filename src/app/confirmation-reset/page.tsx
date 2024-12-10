"use client";

import Navbar from "../../components/Navbar";

const ResetConfirmationPage = () => {
    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <h1 className="text-3xl font-bold mb-8 text-center">Password Reset Successful</h1>
                </div>
                <div className="flex justify-center">
                    <div className="bg-white border rounded-lg shadow-md p-12 max-w-3xl text-center w-full">
                        <h1 className="text-5xl font-bold mb-6 text-gray-900">🎉</h1>
                        <p className="text-xl mb-4 text-gray-800">
                            Your password has been successfully reset!
                        </p>
                        <p className="text-xl text-gray-500 mb-4">
                            Please close this window and return to the login page to log in with your new password.
                        </p>
                        <p className="text-xl text-gray-500">
                            If you encounter any issues, you can try resetting your password again or contact support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetConfirmationPage;
