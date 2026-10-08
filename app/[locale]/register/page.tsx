'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerUser } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { useGeolocationStore } from '@/store/geolocationStore';
import { MapPin, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import PasswordInput from '@/components/ui/PasswordInput';
import { PHONE_COUNTRIES, getPhoneCountry, sanitizePhoneNumber, isValidPhoneNumber } from '@/lib/data/phoneCountries';

export default function RegisterPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { requestLocation, userLocation, loading: locLoading } = useGeolocationStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'client' as UserRole,
    phoneNumber: '',
    countryCode: '+243', // RDC par défaut
  });
  const [shopData, setShopData] = useState({
    shopName: '',
    shopCategory: [] as string[],
    shopCurrency: 'USD' as 'USD' | 'CDF',
    city: '',
    country: '',
  });
  const [positionCaptured, setPositionCaptured] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneCountry = getPhoneCountry(formData.countryCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('err_pass_mismatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('err_pass_short'));
      return;
    }

    if (!formData.displayName.trim()) {
      toast.error(t('err_name_required'));
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error(t('err_phone_required'));
      return;
    }

    if (!isValidPhoneNumber(formData.phoneNumber, formData.countryCode)) {
      toast.error(t('err_phone_length', { count: phoneCountry.length, country: phoneCountry.name }));
      return;
    }

    // Validation boutique obligatoire pour les fournisseurs
    if (formData.role === 'fournisseur') {
      if (!shopData.shopName.trim()) {
        toast.error(t('err_shop_name_required'));
        return;
      }
      if (shopData.shopCategory.length === 0) {
        toast.error(t('err_shop_category_required'));
        return;
      }
      if (!userLocation) {
        toast.error(t('err_position_required'));
        return;
      }
      if (!shopData.city.trim()) {
        toast.error(t('err_city_required'));
        return;
      }
      if (!shopData.country.trim()) {
        toast.error(t('err_country_required'));
        return;
      }
    }

    setLoading(true);

    try {
      const user = await registerUser(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role,
        {
          phoneNumber: formData.phoneNumber,
          phoneCountryCode: formData.countryCode,
          ...(formData.role === 'fournisseur' && {
            shop: {
              shopName: shopData.shopName.trim(),
              shopCategory: shopData.shopCategory,
              shopCurrency: shopData.shopCurrency,
              shopLocation: {
                latitude: userLocation!.latitude,
                longitude: userLocation!.longitude,
                city: shopData.city.trim(),
                country: shopData.country.trim(),
              },
            },
          }),
        }
      );
      setUser(user);
      toast.success(t('success'));
      
      // Rediriger vers la page de vérification email
      router.push('/verify-email');
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      // Messages d'erreur plus clairs
      if (error.code === 'auth/email-already-in-use') {
        toast.error(t('err_email_in_use'));
      } else if (error.code === 'auth/invalid-email') {
        toast.error(t('err_invalid_email'));
      } else if (error.code === 'auth/weak-password') {
        toast.error(t('err_weak_password'));
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error(t('err_op_not_allowed'));
      } else {
        toast.error(t('err_generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8">
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

          <h2 className="text-3xl font-bold text-center mb-8">{t('title')}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('full_name')}
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('account_type')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  { value: 'client', label: t('account_client') },
                  { value: 'fournisseur', label: t('account_fournisseur') },
                  { value: 'marketiste', label: t('account_marketiste') },
                ] as { value: UserRole; label: string }[]).map((role) => (
                  <label
                    key={role.value}
                    className={`flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-1 border-2 rounded-lg px-3 sm:px-2 py-2 cursor-pointer transition-colors sm:text-center text-sm sm:text-xs min-w-0 ${
                      formData.role === role.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={() => setFormData({ ...formData, role: role.value })}
                      className="accent-orange-500 shrink-0"
                    />
                    <span className="font-semibold min-w-0 break-words">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phone')}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      countryCode: e.target.value,
                      phoneNumber: sanitizePhoneNumber(formData.phoneNumber, e.target.value),
                    })
                  }
                  className="w-28 shrink-0 px-1 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {PHONE_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code} {country.name}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phoneNumber: sanitizePhoneNumber(e.target.value, formData.countryCode),
                    })
                  }
                  placeholder={phoneCountry.example}
                  maxLength={phoneCountry.length + 1}
                  required
                  className="flex-1 min-w-0 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 break-words">
                {t('phone_format')} {formData.countryCode}{formData.phoneNumber || 'X'.repeat(phoneCountry.length)}
                {' · '}
                {t('phone_digits', { current: formData.phoneNumber.length, count: phoneCountry.length })}
              </p>
            </div>

            {/* Boutique (fournisseur uniquement) */}
            {formData.role === 'fournisseur' && (
              <div className="border-2 border-orange-200 rounded-lg p-4 space-y-4 bg-orange-50/40">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <MapPin size={18} className="text-orange-500" />
                    {t('shop_title')}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('shop_subtitle')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('shop_name_label')}
                  </label>
                  <input
                    type="text"
                    value={shopData.shopName}
                    onChange={(e) => setShopData({ ...shopData, shopName: e.target.value })}
                    placeholder={t('shop_name_placeholder')}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('shop_category_label')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {SHOP_CATEGORIES.map(cat => {
                      const checked = shopData.shopCategory.includes(cat);
                      return (
                        <label
                          key={cat}
                          className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm ${
                            checked
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setShopData({
                                ...shopData,
                                shopCategory: checked
                                  ? shopData.shopCategory.filter(c => c !== cat)
                                  : [...shopData.shopCategory, cat],
                              })
                            }
                            className="accent-orange-500"
                          />
                          <span className="text-gray-800">{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('shop_category_placeholder')} ({shopData.shopCategory.length})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('shop_currency_label')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['USD', 'CDF'] as const).map((currency) => (
                      <label
                        key={currency}
                        className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                          shopData.shopCurrency === currency
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shopCurrency"
                          value={currency}
                          checked={shopData.shopCurrency === currency}
                          onChange={() => setShopData({ ...shopData, shopCurrency: currency })}
                          className="accent-orange-500"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {currency === 'USD' ? 'USD ($)' : 'CDF (FC)'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currency === 'USD' ? t('currency_usd_name') : t('currency_cdf_name')}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {shopData.shopCurrency === 'CDF' && (
                    <p className="text-xs text-gray-500 mt-2">
                      {t('cdf_note')}
                    </p>
                  )}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('position_label')}
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      await requestLocation();
                      const loc = useGeolocationStore.getState().userLocation;
                      if (loc) {
                        setPositionCaptured(true);
                        try {
                          const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.latitude}&lon=${loc.longitude}&zoom=17&addressdetails=1&accept-language=fr`
                          );
                          if (res.ok) {
                            const data = await res.json();
                            const a = data?.address || {};
                            const city =
                              a.city ||
                              a.town ||
                              a.village ||
                              a.hamlet ||
                              a.municipality ||
                              a.city_district ||
                              a.locality ||
                              a.county ||
                              a.state_district ||
                              '';
                            const country = a.country || '';
                            setShopData((s) => ({
                              ...s,
                              city: city || s.city,
                              country: country || s.country,
                            }));
                          }
                        } catch (err) {
                          console.error('Erreur géocodage inverse:', err);
                        }
                      }
                    }}
                    disabled={locLoading}
                    className={`w-full px-4 py-2 border rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      positionCaptured
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-red-300 text-red-700 hover:bg-red-100'
                    } disabled:opacity-50`}
                  >
                    {locLoading ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        {t('position_loading')}
                      </>
                    ) : positionCaptured && userLocation ? (
                      <>
                        <MapPin size={16} className="text-green-600" />
                        {t('position_captured')} {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                      </>
                    ) : (
                      <>
                        <MapPin size={16} />
                        {t('position_capture')}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('position_note')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('city_label')}
                      </label>
                      <input
                        type="text"
                        value={shopData.city}
                        onChange={(e) => setShopData({ ...shopData, city: e.target.value })}
                        placeholder={t('city_placeholder')}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('country_label')}
                      </label>
                      <input
                        type="text"
                        value={shopData.country}
                        onChange={(e) => setShopData({ ...shopData, country: e.target.value })}
                        placeholder={t('country_placeholder')}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('confirm_password')}
              </label>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('submitting') : t('submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('have_account')}{' '}
              <Link href="/login" className="text-orange-600 hover:underline">
                {t('login_link')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
