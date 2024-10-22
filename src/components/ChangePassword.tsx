import React, { useState } from 'react';
import { auth } from '../lib/firebase/config';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const ChangePassword = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showNewPasswordError, setShowNewPasswordError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        console.log('Opening modal...');
    };

    const handleClose = () => {
        setIsOpen(false);
        setOldPassword('');
        setNewPassword('');
        setError('');
        setSuccess('');
        setShowNewPasswordError(false);
    };

    const validateNewPassword = (password) => {
        return /^(?=.*[A-Za-z])(?=.*\d).+$/.test(password); // Password must contain at least one letter and one number
    };

    const handleNewPasswordChange = (e) => {
        const newPass = e.target.value;
        setNewPassword(newPass);
        setShowNewPasswordError(!validateNewPassword(newPass) && newPass !== '');
    };

    const handleOldPasswordChange = (e) => {
        setOldPassword(e.target.value);
    };

    const handlePasswordChange = async () => {
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!validateNewPassword(newPassword)) {
            setShowNewPasswordError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No user is currently signed in.');
            }

            // First, reauthenticate the user
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(user, credential);

            // Then update the password
            await updatePassword(user, newPassword);

            setSuccess('Password updated successfully!');
            console.log('Password updated successfully!');
            
            // Clear form and close modal after success
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.code === 'auth/wrong-password') {
                setError('Current password is incorrect.');
            } else if (error.code === 'auth/weak-password') {
                setError('New password is too weak. Please use a stronger password.');
            } else if (error.code === 'auth/requires-recent-login') {
                setError('Please log out and log back in before changing your password.');
            } else {
                setError('Failed to change password. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-6">
            <button
                onClick={handleOpen}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Change Password
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                        >
                            &#10005;
                        </button>
                        <h3 className="text-lg font-bold mb-4 text-gray-500">Change Password</h3>

                        <div className="mb-4">
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={handleOldPasswordChange}
                                placeholder="Current Password *"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                                required
                                disabled={isSubmitting}
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                placeholder="New Password *"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {showNewPasswordError && (
                            <p className="text-red-500 text-sm mb-2">
                                New password must contain at least one letter and one number.
                            </p>
                        )}
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

                        <div className="flex justify-end mt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 mr-2"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handlePasswordChange}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-blue-300"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePassword;