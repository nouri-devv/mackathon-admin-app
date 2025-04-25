import Link from 'next/link';
import { CalendarIcon, StarIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useAdmin } from '../hooks/useAdmin';

export default function Sidebar() {
  const { logout } = useAdmin();

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
      </div>
      <nav className="mt-2 flex-1">
        <Link 
          href="/"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <HomeIcon className="h-5 w-5 mr-3" />
          Home
        </Link>
        <Link 
          href="/events"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <CalendarIcon className="h-5 w-5 mr-3" />
          Events
        </Link>
      </nav>
      <div className="p-4 border-t">
        <button 
          onClick={logout}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center"
        >
          Logout
        </button>
      </div>
    </div>
  );
}