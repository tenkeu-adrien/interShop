'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('about')}</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white">{t('who_we_are')}</Link></li>
              <li><Link href="/contact" className="hover:text-white">{t('contact')}</Link></li>
              <li><Link href="/careers" className="hover:text-white">{t('careers')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('buyers')}</h3>
            <ul className="space-y-2">
              <li><Link href="/how-to-buy" className="hover:text-white">{t('how_to_buy')}</Link></li>
              <li><Link href="/buyer-protection" className="hover:text-white">{t('buyer_protection')}</Link></li>
              <li><Link href="/shipping" className="hover:text-white">{t('shipping')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('sellers')}</h3>
            <ul className="space-y-2">
              <li><Link href="/sell" className="hover:text-white">{t('sell_on_platform')}</Link></li>
              <li><Link href="/seller-center" className="hover:text-white">{t('seller_center')}</Link></li>
              <li><Link href="/seller-fees" className="hover:text-white">{t('seller_fees')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t('marketers')}</h3>
            <ul className="space-y-2">
              <li><Link href="/affiliate" className="hover:text-white">{t('affiliate_program')}</Link></li>
              <li><Link href="/marketing-tools" className="hover:text-white">{t('marketing_tools')}</Link></li>
              <li><Link href="/commissions" className="hover:text-white">{t('commissions')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} InterAppshop. {t('rights_reserved')}</p>
          <p>Notre devise <span className=""> {t('tagline')}</span></p>
        </div>
      </div>
    </footer>
  );
}
