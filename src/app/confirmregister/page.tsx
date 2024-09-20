import Navbar from '../../components/Navbar';
import Link from 'next/link';

const EmailConfirmationPage = () => {
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmationPage;
