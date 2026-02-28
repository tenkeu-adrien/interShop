'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Filter, Clock, CheckCircle, XCircle, Share2, ChevronLeft } from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ContactRequest } from '@/types';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

interface ContactRequestWithDetails extends ContactRequest {
  profileName?: string;
  clientName?: string;
  intermediaryName?: string;
}

export default function AdminContactRequestsPage() {
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tDating = useTranslations('dating');
  
  const [requests, setRequests] = useState<ContactRequestWithDetails[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ContactRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    shared: 0
  });
  
  useEffect(() => {
    fetchContactRequests();
  }, []);
  
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === filterStatus));
    }
  }, [filterStatus, requests]);
  
  const fetchContactRequests = async () => {
    setLoading(true);
    try {
      const requestsRef = collection(db, 'contactRequests');
      const requestsQuery = query(requestsRef, orderBy('createdAt', 'desc'));
      const requestsSnapshot = await getDocs(requestsQuery);
      
      const requestsData: ContactRequestWithDetails[] = [];
      
      for (const doc of requestsSnapshot.docs) {
        const request = { id: doc.id, ...doc.data() } as ContactRequest;
        
        // Fetch profile info
        const profileDoc = await getDocs(
          query(collection(db, 'products'), where('id', '==', request.profileId))
        );
        const profileData = profileDoc.docs[0]?.data();
        
        // Fetch client info
        const clientDoc = await getDocs(
          query(collection(db, 'users'), where('id', '==', request.clientId))
        );
        const clientData = clientDoc.docs[0]?.data();
        
        // Fetch intermediary info
        const intermediaryDoc = await getDocs(
          query(collection(db, 'users'), where('id', '==', request.intermediaryId))
        );
        const intermediaryData = intermediaryDoc.docs[0]?.data();
        
        requestsData.push({
          ...request,
          profileName: profileData?.datingProfile?.firstName || 'Profil inconnu',
          clientName: clientData?.name || 'Client inconnu',
          intermediaryName: intermediaryData?.name || 'Intermédiaire inconnu'
        });
      }
      
      setRequests(requestsData);
      calculateStats(requestsData);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = (reqs: ContactRequest[]) => {
    const stats = {
      total: reqs.length,
      pending: reqs.filter(r => r.status === 'pending').length,
      approved: reqs.filter(r => r.status === 'approved').length,
      rejected: reqs.filter(r => r.status === 'rejected').length,
      shared: reqs.filter(r => r.status === 'shared').length
    };
    
    setStats(stats);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'approved':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      case 'shared':
        return <Share2 className="text-blue-600" size={20} />;
      default:
        return null;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return tAdmin('pending_approval');
      case 'approved':
        return tAdmin('approved');
      case 'rejected':
        return tAdmin('rejected');
      case 'shared':
        return 'Contact partagé';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'shared':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Link 
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            {tCommon('back')}
          </Link>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        
        <Skeleton className="h-20 rounded-lg mb-6" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back Button */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        {tCommon('back')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tAdmin('contact_messages')}</h1>
        <p className="text-gray-600">Gérez toutes les demandes de contact pour les profils de rencontres</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-full">
              <Heart className="text-purple-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">{tAdmin('total')}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">{tAdmin('pending_approval')}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">{tAdmin('approved')}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Share2 className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Partagés</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.shared}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-2 rounded-full">
              <XCircle className="text-red-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">{tAdmin('rejected')}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
        </motion.div>
      </div>
      
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <span className="font-semibold text-gray-700">Filtrer par statut:</span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">{tAdmin('all_statuses')}</option>
            <option value="pending">{tAdmin('pending_approval')}</option>
            <option value="approved">{tAdmin('approved')}</option>
            <option value="rejected">{tAdmin('rejected')}</option>
            <option value="shared">Contact partagé</option>
          </select>
        </div>
      </div>
      
      {/* Requests Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{tDating('profile')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{tDating('intermediary')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{tAdmin('status')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{tCommon('date')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Heart className="text-pink-500" size={16} />
                      <span className="font-medium text-gray-900">{request.profileName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{request.clientName}</td>
                  <td className="py-3 px-4 text-gray-700">{request.intermediaryName}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {request.createdAt instanceof Date 
                      ? request.createdAt.toLocaleDateString('fr-FR')
                      : (request.createdAt as any).toDate().toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                      {request.message || 'Aucun message'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Heart className="mx-auto mb-3 text-gray-300" size={48} />
            <p>Aucune demande de contact trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
