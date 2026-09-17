import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Store, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PWAInstallButton } from './PWAInstallButton';

export const Layout = () => {
  const { settings } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <Store className="w-4 h-4" />
              </div>
            )}
            <span className="font-semibold text-gray-900 tracking-tight">{settings.storeName}</span>
          </Link>
          
          <PWAInstallButton />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            <Lock className="w-4 h-4" />
            Painel Admin
          </Link>
        </div>
      </footer>
    </div>
  );
};
