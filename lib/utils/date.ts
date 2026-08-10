/**
 * Convertit une valeur date (Timestamp Firestore, Date JS, string ou number)
 * en objet Date valide. Retourne une Date par défaut si la valeur est absente ou invalide.
 */
export const toDate = (value: unknown): Date => {
  if (!value) {
    return new Date();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'object' && typeof (value as { toDate?: () => unknown }).toDate === 'function') {
    const d = (value as { toDate: () => Date }).toDate();
    return isNaN(d.getTime()) ? new Date() : d;
  }
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? new Date() : d;
};