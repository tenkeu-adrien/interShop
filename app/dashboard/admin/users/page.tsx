'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
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
  Plus,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User as UserType, UserRole, ApprovalStatus } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthStore();
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    // if (!loading && (!user || user.role !== 'admin')) {
    //   router.push('/dashboard');
    //   return;
    // }

    if (user && user.role !== 'admin') {
      loadUsers();
    }

    // Check URL params for role filter
    const roleParam = searchParams.get('role');
    if (roleParam && ['client', 'fournisseur', 'marketiste', 'admin'].includes(roleParam)) {
      setRoleFilter(roleParam as UserRole);
    }
  }, [user, loading, router, searchParams]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as UserType[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.approvalStatus === statusFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleApprove = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approvalStatus: 'approved',
        approvedBy: user?.id,
        approvedAt: new Date(),
        isActive: true
      });
      toast.success('Utilisateur approuvé');
      loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approvalStatus: 'rejected',
        rejectionReason: reason,
        isActive: false
      });
      toast.success('Utilisateur rejeté');
      loadUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Erreur lors du rejet');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success('Utilisateur supprimé');
      loadUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !isActive
      });
      toast.success(isActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const openModal = (user: UserType, mode: 'view' | 'edit' | 'delete') => {
    setSelectedUser(user);
    setModalMode(mode);
    setShowModal(true);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // if (!user || user.role !== 'admin') {
  //   return null;
  // }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="text-green-600" size={40} />
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600">Gérez tous les utilisateurs de la plateforme</p>
            </div>
            <Link
              href="/dashboard/admin"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Retour
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <UserCheck size={14} /> Clients
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'client').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow">
              <p className="text-purple-600 text-sm flex items-center gap-1">
                <Store size={14} /> Fournisseurs
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'fournisseur').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm flex items-center gap-1">
                <Tag size={14} /> Marketistes
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.role === 'marketiste').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm flex items-center gap-1">
                <Check size={14} /> Approuvés
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
                placeholder="Rechercher par nom ou email..."
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
                <option value="all">Tous les rôles</option>
                <option value="client">Clients</option>
                <option value="fournisseur">Fournisseurs</option>
                <option value="marketiste">Marketistes</option>
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
                <option value="all">Tous les statuts</option>
                <option value="approved">Approuvés</option>
                <option value="pending">En attente</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actif
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((u) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {u.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.displayName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(u.approvalStatus)}`}>
                        {u.approvalStatus === 'approved' && <Check size={12} />}
                        {u.approvalStatus === 'pending' && <AlertCircle size={12} />}
                        {u.approvalStatus === 'rejected' && <X size={12} />}
                        {u.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {u.isActive ? <Check size={12} /> : <X size={12} />}
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(u, 'view')}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Voir"
                        >
                          <Eye size={18} />
                        </button>
                        {u.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Approuver"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(u.id, 'Rejeté par admin')}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Rejeter"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openModal(u, 'delete')}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Affichage de {indexOfFirstUser + 1} à {Math.min(indexOfLastUser, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>
                <span className="px-4 py-1 bg-green-100 text-green-800 rounded-lg font-semibold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalMode === 'view' && 'Détails de l\'utilisateur'}
                    {modalMode === 'edit' && 'Modifier l\'utilisateur'}
                    {modalMode === 'delete' && 'Supprimer l\'utilisateur'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {modalMode === 'view' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b">
                      <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {selectedUser.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{selectedUser.displayName}</h3>
                        <p className="text-gray-600">{selectedUser.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Rôle</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(selectedUser.role)}`}>
                          {getRoleIcon(selectedUser.role)}
                          {selectedUser.role}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Statut</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedUser.approvalStatus)}`}>
                          {selectedUser.approvalStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Actif</p>
                        <p className="font-semibold">{selectedUser.isActive ? 'Oui' : 'Non'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vérifié</p>
                        <p className="font-semibold">{selectedUser.isVerified ? 'Oui' : 'Non'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-semibold">{selectedUser.phoneNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date d'inscription</p>
                        <p className="font-semibold">
                          {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {modalMode === 'delete' && (
                  <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800">
                        Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.displayName}</strong> ?
                        Cette action est irréversible.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(selectedUser.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
