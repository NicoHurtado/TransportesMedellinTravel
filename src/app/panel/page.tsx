'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { Lock } from 'lucide-react';

export default function PanelLogin() {
  const { t, language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Force Spanish language in panel login
    if (language !== 'es') {
      toggleLanguage();
    }
  }, [language, toggleLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple password check (in production, use proper auth)
    if (password === 'medellin2025') {
      // Store auth token
      localStorage.setItem('panel_auth', 'true');
      router.push('/panel/dashboard');
    } else {
      setError(t('invalidPassword'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/medellintravel.png"
            alt="Medellín Travel"
            width={250}
            height={75}
            className="h-16 w-auto"
            priority
          />
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-black rounded-full mx-auto mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-semibold text-center mb-2">
            {t('loginTitle')}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {t('operationTitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                required
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading ? '...' : t('login')}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Demo password: <code className="bg-gray-100 px-2 py-1 rounded">medellin2025</code>
          </p>
        </div>
      </div>
    </div>
  );
}

