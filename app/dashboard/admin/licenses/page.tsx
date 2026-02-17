'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Filter, Download, TrendingUp, Calendar, DollarSign, Plus, X } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { FournisseurSubscription, LicenseTier } from '@/types';
import toast from 'react-hot-toast';

// Helper function to convert Firestore Timestamp to Date
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

interface SubscriptionWithUser extends FournisseurSubscription {
  userName?: string;
  userEmail?: string;
}

export default function AdminLicensesPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<LicenseTier | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  
  // Form state for adding license
  const [selectedUserId, setSelectedUserId] = useState('');
  const [licenseTier, setLicenseTier] = useState<LicenseTier>('basic');
  const [durationMonths, setDurationMonths] = useState(1);
  const [productQuota, setProductQuota] = useState(10);
  const [price, setPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    expiringThisMonth: 0,
    byTier: { free: 0, basic: 0, premium: 0, enterprise: 0 }
  });
  
  useEffect(() => {
    fetchSubscriptions();
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (filterTier === 'all') {
      setFilteredSubscriptions(subscriptions);
    } else {
      setFilteredSubscriptions(subscriptions.filter(s => s.licenseTier === filterTier));
    }
  }, [filterTier, subscriptions]);
  
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, where('role', '==', 'fournisseur'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || doc.data().name || 'Inconnu',
        email: doc.data().email || ''
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const subsRef = collection(db, 'subscriptions');
      const subsQuery = query(subsRef, orderBy('startDate', 'desc'));
      const subsSnapshot = await getDocs(subsQuery);
      
      const subsData: SubscriptionWithUser[] = [];
      
      for (const doc of subsSnapshot.docs) {
        const sub = { id: doc.id, ...doc.data() } as FournisseurSubscription;
        
        // Fetch user info
        const userDoc = await getDocs(
          query(collection(db, 'users'), where('id', '==', sub.fournisseurId))
        );
        
        const userData = userDoc.docs[0]?.data();
        
        subsData.push({
          ...sub,
          userName: userData?.name || userData?.displayName || 'Inconnu',
          userEmail: userData?.email || ''
        });
      }
      
      setSubscriptions(subsData);
      calculateStats(subsData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = (subs: FournisseurSubscription[]) => {
    const now = Date.now();
    const oneMonthFromNow = now + (30 * 24 * 60 * 60 * 1000);
    
    const stats = {
      totalRevenue: 0,
      activeSubscriptions: 0,
      expiringThisMonth: 0,
      byTier: { free: 0, basic: 0, premium: 0, enterprise: 0 }
    };
    
    subs.forEach(sub => {
      if (sub.status === 'active') {
        stats.activeSubscriptions++;
        
        const endDate = toDate(sub.endDate).getTime();
        if (endDate <= oneMonthFromNow && endDate > now) {
          stats.expiringThisMonth++;
        }
      }
      
      stats.byTier[sub.licenseTier]++;
    });
    
    setStats(stats);
  };
  
  const handleAddLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast.error('Veuillez sélectionner un fournisseur');
      return;
    }
    
    setSubmitting(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      const newSubscription = {
        fournisseurId: selectedUserId,
        licenseTier,
        status: 'active' as const,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        autoRenew: false,
        productQuota,
        price,
        currency: 'USD',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await addDoc(collection(db, 'subscriptions'), newSubscription);
      
      toast.success('Licence ajoutée avec succès');
      setShowAddModal(false);
      resetForm();
      fetchSubscriptions();
    } catch (error) {
      console.error('Error adding license:', error);
      toast.error('Erreur lors de l\'ajout de la licence');
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setSelectedUserId('');
    setLicenseTier('basic');
    setDurationMonths(1);
    setProductQuota(10);
    setPrice(0);
  };
  
  const exportToCSV = () => {
    const headers = ['Fournisseur', 'Email', 'Licence', 'Statut', 'Début', 'Fin', 'Auto-renouvellement'];
    const rows = filteredSubscriptions.map(sub => [
      sub.userName || '',
      sub.userEmail || '',
      sub.licenseTier,
      sub.status,
      toDate(sub.startDate).toLocaleDateString('fr-FR'),
      toDate(sub.endDate).toLocaleDateString('fr-FR'),
      sub.autoRenew ? 'Oui' : 'Non'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Export CSV réussi');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des licences</h1>
          <p className="text-gray-600">Gérez les abonnements de tous les fournisseurs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Ajouter une licence
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Shield className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Abonnements actifs</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Calendar className="text-yellow-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Expirent ce mois</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.expiringThisMonth}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Premium+</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.byTier.premium + stats.byTier.enterprise}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-full">
              <DollarSign className="text-purple-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Total licences</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{subscriptions.length}</p>
        </motion.div>
      </div>
      
      {/* Filters and Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <span className="font-semibold text-gray-700">Filtrer par:</span>
            </div>
            
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as LicenseTier | 'all')}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Toutes les licences</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Exporter CSV
          </button>
        </div>
      </div>
      
      {/* Subscriptions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fournisseur</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Licence</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date début</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date fin</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Auto-renew</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub, idx) => {
                const daysUntilExpiration = Math.ceil(
                  (toDate(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0;
                
                return (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{sub.userName}</div>
                        <div className="text-sm text-gray-500">{sub.userEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        sub.licenseTier === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                        sub.licenseTier === 'premium' ? 'bg-blue-100 text-blue-700' :
                        sub.licenseTier === 'basic' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.licenseTier.charAt(0).toUpperCase() + sub.licenseTier.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sub.status === 'active' ? 'Actif' : 'Expiré'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {toDate(sub.startDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          {toDate(sub.endDate).toLocaleDateString('fr-FR')}
                        </span>
                        {isExpiringSoon && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                            {daysUntilExpiration}j
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm ${sub.autoRenew ? 'text-green-600' : 'text-gray-400'}`}>
                        {sub.autoRenew ? 'Oui' : 'Non'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Shield className="mx-auto mb-3 text-gray-300" size={48} />
            <p>Aucun abonnement trouvé</p>
          </div>
        )}
      </div>
      {/* Add License Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ajouter une licence</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddLicense} className="space-y-6">
                {/* Fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fournisseur *
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Type de licence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de licence *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['free', 'basic', 'premium', 'enterprise'] as LicenseTier[]).map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setLicenseTier(tier)}
                        className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                          licenseTier === tier
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Durée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (mois) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="36"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 1, 3, 6, 12"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    La licence sera valide pendant {durationMonths} mois
                  </p>
                </div>
                
                {/* Quota de produits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de produits autorisés *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productQuota}
                    onChange={(e) => setProductQuota(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 10, 50, 100, -1 (illimité)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Entrez -1 pour un nombre illimité de produits
                  </p>
                </div>
                
                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Prix en dollars américains (USD)
                  </p>
                </div>
                
                {/* Résumé */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Résumé</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Licence:</span> {licenseTier.charAt(0).toUpperCase() + licenseTier.slice(1)}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Durée:</span> {durationMonths} mois
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Produits:</span> {productQuota === -1 ? 'Illimité' : productQuota}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Prix:</span> ${price.toFixed(2)} USD
                    </p>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Ajout en cours...' : 'Ajouter la licence'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
