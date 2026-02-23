import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
}

export function generateSEO({
  title,
  description,
  image = '/logo.png',
  url,
  type = 'website',
  keywords = [],
}: SEOProps): Metadata {
  const siteName = 'InterAppshop';
  const fullTitle = `${title} | ${siteName}`;
  
  return {
    title: fullTitle,
    description,
    keywords: [...keywords, 'e-commerce', 'B2B', 'B2C', 'marketplace', 'alibaba'].join(', '),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'fr_FR',
      type: type === 'product' ? 'website' : type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@interappshop',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
  };
}

export function generateProductStructuredData(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.fournisseurName || 'InterAppshop',
    },
    offers: {
      '@type': 'Offer',
      url: `https://interappshop.com/products/${product.id}`,
      priceCurrency: 'USD',
      price: product.prices[0]?.price || 0,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.fournisseurName || 'InterAppshop',
      },
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };
}

export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
