'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
                GA 리포트
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/' 
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                홈
              </Link>
              <Link 
                href="/analytics"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/analytics' 
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                애널리틱스
              </Link>
            </div>
          </div>
          
          {/* 모바일 메뉴 토글 버튼 */}
          <div className="flex items-center sm:hidden">
            <div className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <Link 
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                홈
              </Link>
              <Link 
                href="/analytics"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/analytics' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                애널리틱스
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 