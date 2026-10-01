import { useState, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Query,
  DocumentData,
  QueryConstraint,
  where,
  WhereFilterOp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface UsePaginationOptions {
  collectionName: string;
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Array<{ field: string; operator: WhereFilterOp; value: any }>;
}

interface PaginationState<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  totalLoaded: number;
  error: string | null;
}

export function usePagination<T = DocumentData>(options: UsePaginationOptions) {
  const {
    collectionName,
    pageSize = 20,
    orderByField = 'createdAt',
    orderDirection = 'desc',
    filters = [],
  } = options;

  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    loading: false,
    hasMore: true,
    page: 0,
    totalLoaded: 0,
    error: null,
  });

  const [lastVisible, setLastVisible] = useState<any>(null);

  // Fonction pour construire la requête avec filtres
  const buildQuery = useCallback(
    (isFirstPage: boolean) => {
      const constraints: QueryConstraint[] = [];

      // Ajouter les filtres
      filters.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator, value));
      });

      // Ajouter le tri
      constraints.push(orderBy(orderByField, orderDirection));

      // Ajouter la pagination
      constraints.push(limit(pageSize));

      // Ajouter le curseur pour les pages suivantes
      if (!isFirstPage && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      return query(collection(db, collectionName), ...constraints);
    },
    [collectionName, pageSize, orderByField, orderDirection, filters, lastVisible]
  );

  // Charger la première page
  const loadFirstPage = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const q = buildQuery(true);
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);

      setState({
        data: items,
        loading: false,
        hasMore: items.length === pageSize,
        page: 1,
        totalLoaded: items.length,
        error: null,
      });
    } catch (error) {
      console.error('Error loading first page:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erreur lors du chargement des données',
      }));
    }
  }, [buildQuery, pageSize]);

  // Charger la page suivante
  const loadNextPage = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const q = buildQuery(false);
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);

      setState((prev) => ({
        data: [...prev.data, ...items],
        loading: false,
        hasMore: items.length === pageSize,
        page: prev.page + 1,
        totalLoaded: prev.totalLoaded + items.length,
        error: null,
      }));
    } catch (error) {
      console.error('Error loading next page:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erreur lors du chargement de la page suivante',
      }));
    }
  }, [buildQuery, pageSize, state.hasMore, state.loading]);

  // Recharger depuis le début
  const refresh = useCallback(() => {
    setLastVisible(null);
    setState({
      data: [],
      loading: false,
      hasMore: true,
      page: 0,
      totalLoaded: 0,
      error: null,
    });
    loadFirstPage();
  }, [loadFirstPage]);

  return {
    ...state,
    loadFirstPage,
    loadNextPage,
    refresh,
  };
}
