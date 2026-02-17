'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { 
  Tag, 
  Search, 
  Filter,
  Copy,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  ChevronLeft,
  Calendar,
  Percent,
  TrendingUp,
  Users
} from 'lucide-react';
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MarketingCode } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MarketisteCodesPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  
  const [codes, setCodes] = useState<MarketingCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<MarketingCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    commissionRate: 10,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });

  useEffect(() => {
    // if (!loading && (!user || user.role !== 'marketiste')) {
    //   router.push('/dashboard');
    //   return;
    // }

    if (user && user.role !== 'marketiste') {
      loadCodes();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterCodes();
  }, [codes, searchQuery, statusFilter]);

  const loadCodes = async () => {
    if (!user) return;
    
    setLoadingCodes(true);
    try {
      const codesQuery = query(
        collection(db, 'marketingCodes'),
        where('marketisteId', '==', user.id)
      );
      const codesSnapshot = await getDocs(codesQuery);
      const codesData = codesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as MarketingCode[];
      setCodes(codesData);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Erreur lors du chargement des codes');
    } finally {
      setLoadingCodes(false);
    }
  };

  const filterCodes = () => {
    let filtered = [...codes];

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(c => c.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(c => !c.isActive);
    }

    setFilteredCodes(filtered);
  };

  const handleCreateCode = async () => {
    if (!user || !newCode.code) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const codeData: Omit<MarketingCode, 'id'> = {
        code: newCode.code.toUpperCase(),
        marketisteId: user.id,
        commissionRate: newCode.commissionRate / 100,
        validFrom: new Date(newCode.validFrom),
        validUntil: newCode.validUntil ? new Date(newCode.validUntil) : undefined,
        isActive: true,
        usageCount: 0,
        totalEarnings: 0,
      };

      await addDoc(collection(db, 'marketingCodes'), codeData);
      toast.success('Code créé avec succès !');
      setShowCreateModal(false);
      setNewCode({
        code: '',
        commissionRate: 10,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
      });
      loadCodes();
    } catch (error) {
      console.error('Error creating code:', error);
      toast.error('Erreur lors de la création du code');
    }
  };

  const handleToggleCode = async (codeId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'marketingCodes', codeId), {
        isActive: !isActive
      });
      toast.success(isActive ? 'Code désactivé' : 'Code activé');
      loadCodes();
    } catch (error) {
      console.error('Error toggling code:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) return;
    
    try {
      await deleteDoc(doc(db, 'marketingCodes', codeId));
      toast.success('Code supprimé');
      loadCodes();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copié !');
  };

  if (loading || loadingCodes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // if (!user || user.role !== 'marketiste') {
  //   return null;
  // }

  const totalEarnings = codes.reduce((sum, c) => sum + c.totalEarnings, 0);
  const totalUsage = codes.reduce((sum, c) => sum + c.usageCount, 0);
  const activeCodes = codes.filter(c => c.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Tag className="text-yellow-600" size={40} />
                Mes codes marketing
              </h1>
              <p className="text-gray-600">Gérez tous vos codes promotionnels</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/marketiste"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Retour
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Nouveau code
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <Tag size={14} /> Total
              </p>
              <p className="text-2xl font-bold">{codes.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle size={14} /> Actifs
              </p>
              <p className="text-2xl font-bold text-green-600">{activeCodes}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <Users size={14} /> Utilisations
              </p>
              <p className="text-2xl font-bold text-blue-600">{totalUsage}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm flex items-center gap-1">
                <TrendingUp size={14} /> Gains
              </p>
              <p className="text-xl font-bold text-yellow-600">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCodes.map((code) => (
            <motion.div
              key={code.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-mono font-bold text-lg">
                    {code.code}
                  </div>
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded"
                    title="Copier"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {code.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Percent size={14} /> Commission
                  </span>
                  <span className="font-bold text-yellow-600">{(code.commissionRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Users size={14} /> Utilisations
                  </span>
                  <span className="font-semibold">{code.usageCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp size={14} /> Gains totaux
                  </span>
                  <span className="font-bold text-green-600">${code.totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar size={14} /> Début
                  </span>
                  <span className="text-sm">{new Date(code.validFrom).toLocaleDateString('fr-FR')}</span>
                </div>
                {code.validUntil && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} /> Fin
                    </span>
                    <span className="text-sm">{new Date(code.validUntil).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleToggleCode(code.id, code.isActive)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 ${
                    code.isActive 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {code.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  {code.isActive ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => handleDeleteCode(code.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCodes.length === 0 && (
          <div className="text-center py-16">
            <Tag className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-500 text-lg mb-4">Aucun code trouvé</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Créer votre premier code
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Créer un code marketing</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                      placeholder="PROMO2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux de commission (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newCode.commissionRate}
                      onChange={(e) => setNewCode({ ...newCode, commissionRate: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newCode.validFrom}
                      onChange={(e) => setNewCode({ ...newCode, validFrom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      value={newCode.validUntil}
                      onChange={(e) => setNewCode({ ...newCode, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateCode}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Créer le code
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
