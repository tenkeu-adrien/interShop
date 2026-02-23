'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200';
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };
  
  return <div className={`${baseStyles} ${variants[variant]} ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-3 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
