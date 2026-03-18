'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { User, Mail, Phone, Shield, Camera, Save, ArrowLeft } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import toast from 'react-hot-toast';

function ProfileContent() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        displayName: form.displayName,
        phoneNumber: form.phoneNumber,
        updatedAt: new Date(),
      });
      setUser({ ...user, displayName: form.displayName, phoneNumber: form.phoneNumber });
      toast.success(tCommon('success'));
    } catch (e) {
      toast.error(tCommon('error'));
    } finally {
      setSaving(false);
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    fournisseur: 'bg-purple-100 text-purple-700',
    marketiste: 'bg-yellow-100 text-yellow-700',
    client: 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <User className="text-green-600" size={32} />
          {t('title')}
        </h1>

        {/* Avatar + role */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.displayName}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`mt-1 inline-block text-xs font-semibold px-3 py-1 rounded-full ${roleColors[user?.role || 'client']}`}>
              {tCommon(user?.role || 'client')}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">{t('personal_info')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('display_name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="+243..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-gray-900 font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? tCommon('loading') : tCommon('save')}
          </button>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="text-green-600" size={20} />
            {t('security')}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{t('email_verified')}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user?.emailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user?.emailVerified ? t('verified') : t('not_verified')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{t('account_status')}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                {user?.accountStatus || 'active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
