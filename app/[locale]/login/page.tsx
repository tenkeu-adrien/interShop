'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginUser, loginWithGoogle, loginWithFacebook, getAuthErrorKey } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('seed.admin.1@interappshop.test');
  const [password, setPassword] = useState('InterShop@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      setUser(user);
      toast.success(tAuth('login_success'));
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(tErrors(getAuthErrorKey(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try {
      const user = await loginWithGoogle();
      setUser(user);
      toast.success(tAuth('login_success'));
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(tErrors(getAuthErrorKey(error)));
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    try {
      const user = await loginWithFacebook();
      setUser(user);
      toast.success(tAuth('login_success'));
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(tErrors(getAuthErrorKey(error)));
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo InterAppShop */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="InterAppshop"
                className="object-contain mx-auto"
                width={200}
                height={60}
                priority={true}
              />
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">{tAuth('sign_in')}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tAuth('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tAuth('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? tCommon('loading') : tAuth('sign_in')}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">{tAuth('or_continue_with')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.27-2.09 3.57-5.17 3.57-8.84z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11C3.24 21.3 7.28 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.61H1.26A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11z" />
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
              </svg>
              {socialLoading === 'google' ? tCommon('loading') : tAuth('continue_with_google')}
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white rounded-lg py-3 font-medium hover:bg-[#166fe0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
              </svg>
              {socialLoading === 'facebook' ? tCommon('loading') : tAuth('continue_with_facebook')}
            </button>
          </div>

          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="text-orange-600 hover:underline block">
              {tAuth('forgot_password')}
            </Link>
            <p className="text-gray-600">
              {tAuth('no_account')}{' '}
              <Link href="/register" className="text-orange-600 hover:underline">
                {tAuth('sign_up')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
