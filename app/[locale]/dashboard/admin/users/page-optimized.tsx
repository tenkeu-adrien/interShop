'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  Users, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Store,
  Tag,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User as UserType, UserRole, ApprovalStatus } from '@/types';
import { toDate } from '@/lib/utils/date';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthStore();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Construire les filtres pour Firestore
  const filters = [];
  if (roleFilter !== 'all') {
    filters.push({ field: 'role', operator: '==' as const, value: roleFilter });
  }
  if (statusFilter !== 'all') {
    filters.push({ field: 'approvalStatus', operator: '==' as const, value: statusFilter });
  }

  const {
    data: users,
    loading: loadingUsers,
    hasMore,
    loadFirstPage,
    loadNextPage,
    refresh,
    totalLoaded,
  } = usePagination<UserType>({
    collectionName: 'users',
    pageSize: 20,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    filters,
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadFirstPage();
    }
    
    const roleParam = searchParams.get('role');
    if (roleParam && ['client', 'fournisseur', 'marketiste', 'admin'].includes(roleParam)) {
      setRoleFilter(roleParam as UserRole);
    }
  }, [user, roleFilter, statusFilter]);

  // Filtrage local par recherche
  const filteredUsers = users.filter(u => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.phone?.includes(searchLower)
    );
  });

  const handleApprove = async (userId: string) => {
    try {
      const updates = { 
        approvalStatus: 'approved' as const, 
        approvedBy: user?.id, 
        approvedAt: new Date(), 
        isActive: true 
      };
      await updateDoc(doc(db, 'users', userId), updates);
      refresh();
      toast.success(tAdmin('user_approved'));
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error(tAdmin('error_approving'));
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      const updates = { 
        approvalStatus: 'rejected' as const, 
        rejectionReason: reason, 
        isActive: false 
      };
      await updateDoc(doc(db, 'users', userId), updates);
      refresh();
      toast.success(tAdmin('user_rejected'));
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error(tAdmin('error_rejecting'));
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(tAdmin('delete_confirmation') + ' ?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      refresh();
      toast.success(tAdmin('user_deleted'));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(tAdmin('error_deleting'));
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isActive: !isActive });
      refresh();
      toast.success(isActive ? tAdmin('user_deactivated') : tAdmin('user_activated'));
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(tAdmin('error_updating'));
    }
  };

  const openModal = (user: UserType, mode: 'view' | 'edit' | 'delete') => {
    setSelectedUser(user);
    setModalMode(mode);
    setShowModal(true);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'client': return <UserCheck size={16} />;
      case 'fournisseur': return <Store size={16} />;
      case 'marketiste': return <Tag size={16} />;
      case 'admin': return <Shield size={16} />;
      default: return <Users size={16} />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'fournisseur': return 'bg-purple-100 text-purple-800';
      case 'marketiste': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="text-green-600" size={40} />
                {tAdmin('user_management')}
              </h1>
              <p className="text-gray-600">{totalLoaded} utilisateurs chargés</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refresh}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                disabled={loadingUsers}
              >
                <RefreshCw size={18} className={loadingUsers ? 'animate-spin' : ''} />
                {tCommon('refresh')}
              </button>
              <Link
                href="/dashboard/admin"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                {tAdmin('back_to_dashboard')}
              </Link>
            </div>
          </div>

          {/* Stats - calculées sur les données chargées */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">{tAdmin('total')}</p>
              <p className="text-2xl font-bold">{totalLoaded}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <UserCheck size={14} /> {tAdmin('clients')}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'client').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow">
              <p className="text-purple-600 text-sm flex items-center gap-1">
                <Store size={14} /> {tAdmin('suppliers')}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'fournisseur').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm flex items-center gap-1">
                <Tag size={14} /> {tAdmin('marketers')}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.role === 'marketiste').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm flex items-center gap-1">
                <Check size={14} /> {tAdmin('approved')}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.approvalStatus === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={tAdmin('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="all">{tAdmin('all_roles')}</option>
                <option value="client">{tAdmin('clients')}</option>
                <option value="fournisseur">{tAdmin('suppliers')}</option>
                <option value="marketiste">{tAdmin('marketers')}</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="all">{tAdmin('all_statuses')}</option>
                <option value="approved">{tAdmin('approved')}</option>
                <option value="pending">{tAdmin('pending_approval')}</option>
                <option value="rejected">{tAdmin('rejected')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loadingUsers && users.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={48} />
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('user')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('registration_date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('active')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                              {u.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.displayName}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={12} /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                            {getRoleIcon(u.role)}
                            {tCommon(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(u.approvalStatus)}`}>
                            {u.approvalStatus === 'approved' && <Check size={14} />}
                            {u.approvalStatus === 'pending' && <Clock size={14} />}
                            {u.approvalStatus === 'rejected' && <XCircle size={14} />}
                            {tAdmin(u.approvalStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {u.createdAt ? toDate(u.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(u.id, u.isActive)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              u.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {u.isActive ? tCommon('yes') : tCommon('no')}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {u.approvalStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(u.id)}
                                  className="text-green-600 hover:text-green-800"
                                  title={tAdmin('approve')}
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => handleReject(u.id, 'Rejeté par admin')}
                                  className="text-red-600 hover:text-red-800"
                                  title={tAdmin('reject')}
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openModal(u, 'view')}
                              className="text-blue-600 hover:text-blue-800"
                              title={tAdmin('view')}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="text-red-600 hover:text-red-800"
                              title={tAdmin('delete')}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bouton charger plus */}
              {hasMore && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <button
                    onClick={loadNextPage}
                    disabled={loadingUsers}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                  >
                    {loadingUsers ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <ChevronRight size={18} />
                        Charger plus
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal simplifié */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Détails utilisateur</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold">{selectedUser.displayName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p>{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rôle</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {getRoleIcon(selectedUser.role)}
                    {tCommon(selectedUser.role)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.approvalStatus)}`}>
                    {tAdmin(selectedUser.approvalStatus)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
