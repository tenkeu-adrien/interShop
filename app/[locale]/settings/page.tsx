'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  User,
  Lock,
  MapPin,
  CalendarDays,
  Car,
  Gift,
  Globe,
  Sun,
  Shuffle,
  ShieldCheck,
  Newspaper,
  CircleHelp,
  Info,
  Mail,
  MessageCircle,
  Bell,
  ChevronRight,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';
import { NotificationPreferences } from '@/types';

const ACCENT = 'text-[#0a1fd6]';
const ACCENT_BG = 'bg-[#0a1fd6]';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'sw', label: 'Kiswahili' },
];

const DEFAULT_PREFERENCES: NotificationPreferences = { email: true, sms: true, push: true };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-500 mb-3">{title}</h2>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-200 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function RowContent({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  return (
    <>
      <Icon size={22} className={`${ACCENT} shrink-0`} />
      <span className="flex-1 min-w-0 text-lg text-gray-900 text-start">{label}</span>
      {value && <span className="text-sm text-gray-500 shrink-0">{value}</span>}
    </>
  );
}

const ROW_CLASS = 'w-full flex items-center gap-4 px-5 py-5 hover:bg-gray-50 transition-colors';

function LinkRow({ href, icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className={ROW_CLASS}>
      <RowContent icon={icon} label={label} />
      <ChevronRight size={22} className="text-gray-500 shrink-0 rtl:rotate-180" />
    </Link>
  );
}

function ButtonRow({
  onClick,
  icon,
  label,
  value,
  open,
}: {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  value?: string;
  open?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={ROW_CLASS} aria-expanded={open}>
      <RowContent icon={icon} label={label} value={value} />
      <ChevronRight
        size={22}
        className={`text-gray-500 shrink-0 transition-transform ${open ? 'rotate-90' : 'rtl:rotate-180'}`}
      />
    </button>
  );
}

function ChoiceList<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="bg-gray-50 px-5 py-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className="w-full flex items-center justify-between py-3 text-gray-800"
        >
          <span className={option.value === selected ? 'font-semibold' : ''}>{option.label}</span>
          {option.value === selected && <Check size={18} className={ACCENT} />}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-5">
      <RowContent icon={icon} label={label} />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? ACCENT_BG : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            checked ? 'start-7' : 'start-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { selectedCurrency, setCurrency } = useCurrencyStore();
  const [openPanel, setOpenPanel] = useState<'language' | 'currency' | null>(null);

  const preferences = { ...DEFAULT_PREFERENCES, ...user?.notificationPreferences };

  const comingSoon = () => toast(t('coming_soon'));

  const changeLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const togglePreference = async (channel: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;
    const next = { ...preferences, [channel]: value };
    setUser({ ...user, notificationPreferences: next });
    try {
      await updateDoc(doc(db, 'users', user.id), { notificationPreferences: next });
    } catch (error) {
      console.error('Erreur enregistrement préférences de notification:', error);
      setUser({ ...user, notificationPreferences: preferences });
      toast.error(t('save_error'));
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Section title={t('account')}>
          <LinkRow href="/profile" icon={User} label={t('update_profile')} />
          <LinkRow href="/forgot-password" icon={Lock} label={t('update_password')} />
          <ButtonRow onClick={comingSoon} icon={MapPin} label={t('saved_addresses')} />
          <ButtonRow onClick={comingSoon} icon={CalendarDays} label={t('my_bookings')} />
          <LinkRow href="/orders" icon={Car} label={t('my_shipments')} />
        </Section>

        <Section title={t('wallet_referral')}>
          <LinkRow href="/wallet" icon={User} label={t('wallet')} />
          <LinkRow href="/affiliate" icon={Gift} label={t('refer_friend')} />
        </Section>

        <Section title={t('preferences')}>
          <div>
            <ButtonRow
              onClick={() => setOpenPanel(openPanel === 'language' ? null : 'language')}
              icon={Globe}
              label={t('language')}
              value={LANGUAGES.find((l) => l.code === locale)?.label}
              open={openPanel === 'language'}
            />
            {openPanel === 'language' && (
              <ChoiceList
                options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
                selected={locale}
                onSelect={changeLocale}
              />
            )}
          </div>
          <ButtonRow onClick={comingSoon} icon={Sun} label={t('theme')} />
          <div>
            <ButtonRow
              onClick={() => setOpenPanel(openPanel === 'currency' ? null : 'currency')}
              icon={Shuffle}
              label={t('currency')}
              value={selectedCurrency}
              open={openPanel === 'currency'}
            />
            {openPanel === 'currency' && (
              <ChoiceList
                options={Object.values(SUPPORTED_CURRENCIES).map((c) => ({
                  value: c.code,
                  label: `${c.code} — ${c.name}`,
                }))}
                selected={selectedCurrency}
                onSelect={(code) => {
                  setCurrency(code);
                  setOpenPanel(null);
                }}
              />
            )}
          </div>
        </Section>

        <Section title={t('legal_privacy')}>
          <ButtonRow onClick={comingSoon} icon={ShieldCheck} label={t('privacy_policy')} />
          <ButtonRow onClick={comingSoon} icon={Newspaper} label={t('terms')} />
        </Section>

        <Section title={t('help')}>
          <LinkRow href="/contact" icon={CircleHelp} label={t('support')} />
          <LinkRow href="/about" icon={Info} label={t('about_us')} />
        </Section>

        <Section title={t('notifications')}>
          <ToggleRow icon={Mail} label={t('email')} checked={preferences.email} onChange={(v) => togglePreference('email', v)} />
          <ToggleRow icon={MessageCircle} label={t('sms')} checked={preferences.sms} onChange={(v) => togglePreference('sms', v)} />
          <ToggleRow icon={Bell} label={t('push')} checked={preferences.push} onChange={(v) => togglePreference('push', v)} />
        </Section>
      </div>
    </div>
  );
}
