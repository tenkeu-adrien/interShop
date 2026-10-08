import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['fr', 'en', 'ar', 'sw'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

type Messages = { [key: string]: string | Messages };

// Complète la langue demandée avec le français pour qu'une clé manquante
// affiche un texte lisible plutôt que son identifiant.
const deepMerge = (base: Messages, override: Messages): Messages => {
  const result: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    result[key] =
      typeof value === 'object' && typeof baseValue === 'object'
        ? deepMerge(baseValue, value)
        : value;
  }
  return result;
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  if (!locale || !locales.includes(locale as Locale)) notFound();

  const fallback = (await import(`./messages/${defaultLocale}.json`)).default;
  const messages =
    locale === defaultLocale
      ? fallback
      : deepMerge(fallback, (await import(`./messages/${locale}.json`)).default);

  return { locale, messages };
});
