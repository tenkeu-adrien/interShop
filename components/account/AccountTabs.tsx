'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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

interface OrderTab {
  key: string;
  status: string | null;
  icon: LucideIcon;
  color: string;
}

interface AccountTab extends OrderTab {
  href: string;
}

const ORDER_TABS: OrderTab[] = [
  { key: 'echoue', status: 'cancelled', icon: XCircle, color: 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white' },
  { key: 'emballage', status: 'processing', icon: Package, color: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' },
  { key: 'expedition', status: 'shipped', icon: Truck, color: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' },
  { key: 'details', status: 'all', icon: FileText, color: 'bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white' },
  { key: 'historique', status: null, icon: History, color: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' },
  { key: 'rembours', status: 'refunded', icon: RotateCcw, color: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' },
  { key: 'recu', status: 'delivered', icon: CheckCircle, color: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white' },
];

export function AccountTabs({ role }: { role: AccountRole }) {
  const t = useTranslations('accountTabs');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const base = role === 'fournisseur' ? '/dashboard/fournisseur/orders' : '/orders';
  const reviewsPath = '/dashboard/fournisseur/reviews';

  const tabs: AccountTab[] = ORDER_TABS.map(({ key, status, icon, color }) => ({
    key,
    status,
    icon,
    color,
    href: status === null ? base : `${base}?status=${status}`,
  }));

  const avisTab: AccountTab = {
    key: 'avis',
    status: null,
    href: reviewsPath,
    icon: Star,
    color: 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
  };
  if (role === 'fournisseur') {
    tabs.splice(3, 0, avisTab);
  }

  const isActive = (tab: AccountTab): boolean => {
    if (tab.key === 'avis') {
      return pathname.includes(reviewsPath);
    }
    if (!pathname.includes(base)) return false;
    if (tab.status === null) return statusParam === null;
    return statusParam === tab.status;
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={18} className="text-green-600" />
        {t('title')}
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                active
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-100 hover:shadow-md hover:border-gray-200'
              }`}
            >
              <div className={`p-3 rounded-full transition-colors ${tab.color}`}>
                <Icon size={22} />
              </div>
              <span
                className={`text-xs font-semibold ${
                  active ? 'text-green-700' : 'text-gray-700 group-hover:text-gray-900'
                }`}
              >
                {t(tab.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
