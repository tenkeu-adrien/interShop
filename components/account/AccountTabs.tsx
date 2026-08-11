'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  XCircle,
  Package,
  Truck,
  Star,
  FileText,
  History,
  RotateCcw,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';

type AccountRole = 'client' | 'fournisseur';

interface AccountTab {
  key: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const ORDER_TABS: { key: string; status: string; icon: LucideIcon; color: string }[] = [
  { key: 'echoue', status: 'cancelled', icon: XCircle, color: 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white' },
  { key: 'emballage', status: 'processing', icon: Package, color: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' },
  { key: 'expedition', status: 'shipped', icon: Truck, color: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' },
  { key: 'details', status: 'all', icon: FileText, color: 'bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white' },
  { key: 'historique', status: 'all', icon: History, color: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' },
  { key: 'rembours', status: 'refunded', icon: RotateCcw, color: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' },
  { key: 'recu', status: 'delivered', icon: CheckCircle, color: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white' },
];

export function AccountTabs({ role }: { role: AccountRole }) {
  const t = useTranslations('accountTabs');

  const base = role === 'fournisseur' ? '/dashboard/fournisseur/orders' : '/orders';

  const tabs: AccountTab[] = ORDER_TABS.map(({ key, status, icon, color }) => ({
    key,
    icon,
    color,
    href: `${base}?status=${status}`,
  }));

  if (role === 'fournisseur') {
    tabs.splice(3, 0, {
      key: 'avis',
      href: '/dashboard/fournisseur/reviews',
      icon: Star,
      color: 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={18} className="text-green-600" />
        {t('title')}
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {tabs.map(({ key, href, icon: Icon, color }) => (
          <Link
            key={key}
            href={href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all text-center"
          >
            <div className={`p-3 rounded-full transition-colors ${color}`}>
              <Icon size={22} />
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
              {t(key)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
