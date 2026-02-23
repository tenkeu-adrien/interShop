import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">À propos</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white">Qui sommes-nous</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white">Carrières</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Acheteurs</h3>
            <ul className="space-y-2">
              <li><Link href="/how-to-buy" className="hover:text-white">Comment acheter</Link></li>
              <li><Link href="/buyer-protection" className="hover:text-white">Protection acheteur</Link></li>
              <li><Link href="/shipping" className="hover:text-white">Livraison</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Vendeurs</h3>
            <ul className="space-y-2">
              <li><Link href="/sell" className="hover:text-white">Vendre sur la plateforme</Link></li>
              <li><Link href="/seller-center" className="hover:text-white">Centre vendeur</Link></li>
              <li><Link href="/seller-fees" className="hover:text-white">Frais</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Marketistes</h3>
            <ul className="space-y-2">
              <li><Link href="/affiliate" className="hover:text-white">Programme affiliation</Link></li>
              <li><Link href="/marketing-tools" className="hover:text-white">Outils marketing</Link></li>
              <li><Link href="/commissions" className="hover:text-white">Commissions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 InterAppshop. Tous droits réservés.</p>
                <p>Notre devise <span className=""> Le marché digital sans frontières</span></p>
        </div>
      </div>
    </footer>
  );
}
