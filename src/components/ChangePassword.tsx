import React, { useState } from 'react';
import { auth } from '../lib/firebase/config';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const ChangePassword: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsOpen(false);
        setOldPassword('');
        setNewPassword('');
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No user is currently signed in.');
            }

            // Re-authenticate the user
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            try {
                await reauthenticateWithCredential(user, credential);
            } catch (reauthError) {
                setError('Current password is incorrect. Please try again.');
                return;
            }

            // Update the password
            await updatePassword(user, newPassword);

            setSuccess('Password updated successfully!');
            setTimeout(handleClose, 2000);
        } catch (error) {
            setError('Failed to change password. Please try again later.');
        }
    };

    return (
        <div>
            <button
                onClick={handleOpen}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Change Password
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold mb-4 text-gray-500">Change Password</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Old Password"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                                required
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                                required
                            />
                            {error && <p className="text-red-500 mb-2">{error}</p>}
                            {success && <p className="text-green-500 mb-2">{success}</p>}
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePassword;
