import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white py-4 px-8 w-full"> {/* Ensure full width */}
      <div className="flex justify-between items-center">
        {/* Left side (Logo or Home link) */}
        <div className="text-lg font-bold">
          <Link href="/" className="hover:text-gray-300">Cinema E-Booking</Link>
        </div>

        {/* Right side (Links for navigation) */}
        <div className="space-x-6">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/login" className="hover:text-gray-300">Login</Link>
          <Link href="/create-account" className="hover:text-gray-300">Create Account</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
