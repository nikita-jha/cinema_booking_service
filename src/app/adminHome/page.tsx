"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";

const AdminPortalHomePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="header relative">
          <h1 className="text-4xl font-bold text-center mb-24 text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-md mx-auto">
          <Link href="/admin/manage-movies">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Movies
            </button>
          </Link>

          <Link href="/admin/manage-users">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Users
            </button>
          </Link>

          <Link href="/admin/manage-promotions">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Promotions
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPortalHomePage;
