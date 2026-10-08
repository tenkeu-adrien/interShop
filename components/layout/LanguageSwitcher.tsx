'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'sw', label: 'Kiswahili' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const tCommon = useTranslations('common');

  const changeLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <label className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-full pl-3 pr-2 py-1.5 shadow-sm text-sm text-gray-700">
      <Globe size={16} className="text-green-600 shrink-0" />
      <span className="sr-only">{tCommon('language')}</span>
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="bg-transparent font-medium focus:outline-none cursor-pointer"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
