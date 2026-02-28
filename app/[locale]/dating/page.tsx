'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Heart, Shield, ChevronLeft } from 'lucide-react';
import { DatingProfileCard } from '@/components/DatingProfileCard';
import { getDatingProfiles } from '@/lib/firebase/datingProfiles';
import { DatingProfile } from '@/types/dating';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function DatingPage() {
  const tDating = useTranslations('dating');
  const tCommon = useTranslations('common');
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(99);
  const [cityFilter, setCityFilter] = useState<string>('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getDatingProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = !genderFilter || p.gender === genderFilter;
    const matchesAge = p.age >= minAge && p.age <= maxAge;
    const matchesCity = !cityFilter || 
      p.location?.city.toLowerCase().includes(cityFilter.toLowerCase());
    
    return matchesSearch && matchesGender && matchesAge && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          {tCommon('back')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="text-pink-500" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">{tDating('title')}</h1>
          </div>
          <p className="text-gray-600">{tDating('subtitle')}</p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">{tDating('privacy_title')}</h3>
            <p className="text-sm text-blue-800">
              {tDating('privacy_notice')}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={tDating('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Filter size={20} />
              {tDating('filters')}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tDating('gender')}</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">{tCommon('all')}</option>
                  <option value="homme">{tDating('male')}</option>
                  <option value="femme">{tDating('female')}</option>
                  <option value="autre">{tDating('other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tDating('min_age')}</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tDating('max_age')}</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tDating('city')}</label>
                <input
                  type="text"
                  placeholder={tDating('enter_city')}
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profiles Grid */}
        {!loading && filteredProfiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile, index) => (
              <DatingProfileCard key={profile.id} profile={profile} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Heart className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">{tDating('no_profiles')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
