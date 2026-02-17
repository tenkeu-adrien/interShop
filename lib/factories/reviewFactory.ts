// lib/factories/reviewFactory.ts
import { faker } from '@faker-js/faker';
import { Review } from '@/types';

/**
 * Creates a mock Review with realistic test data
 * @param overrides - Optional partial Review object to override default values
 * @returns A complete Review object with generated data
 */
export function createMockReview(overrides?: Partial<Review>): Review {
  const rating = overrides?.rating ?? faker.number.int({ min: 1, max: 5 });
  
  // Generate more positive comments for higher ratings
  const positiveComments = [
    'Excellent product! Highly recommend.',
    'Great quality and fast delivery.',
    'Exactly as described. Very satisfied.',
    'Outstanding service and product quality.',
    'Will definitely order again!',
    'Perfect! Exceeded my expectations.',
    'Amazing quality for the price.',
    'Very happy with this purchase.'
  ];

  const neutralComments = [
    'Product is okay, nothing special.',
    'Decent quality for the price.',
    'As expected, no surprises.',
    'Average product, does the job.',
    'It\'s fine, meets basic requirements.'
  ];

  const negativeComments = [
    'Not as described. Disappointed.',
    'Poor quality, would not recommend.',
    'Arrived damaged and late.',
    'Does not match the pictures.',
    'Very disappointed with this purchase.',
    'Quality is much lower than expected.'
  ];

  let comment: string;
  if (rating >= 4) {
    comment = faker.helpers.arrayElement(positiveComments);
  } else if (rating === 3) {
    comment = faker.helpers.arrayElement(neutralComments);
  } else {
    comment = faker.helpers.arrayElement(negativeComments);
  }

  // Add more detailed comment sometimes
  if (faker.datatype.boolean({ probability: 0.6 })) {
    comment += ' ' + faker.lorem.sentence();
  }

  const hasImages = faker.datatype.boolean({ probability: 0.3 });
  const hasResponse = faker.datatype.boolean({ probability: 0.4 });
  const createdAt = overrides?.createdAt ?? faker.date.past();

  return {
    id: faker.string.uuid(),
    productId: faker.string.uuid(),
    clientId: faker.string.uuid(),
    orderId: faker.string.uuid(),
    rating,
    comment: overrides?.comment ?? comment,
    images: hasImages 
      ? Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => faker.image.url())
      : undefined,
    response: hasResponse
      ? {
          content: faker.helpers.arrayElement([
            'Thank you for your feedback! We appreciate your business.',
            'We\'re glad you\'re satisfied with your purchase!',
            'Thank you for choosing our product. We hope to serve you again.',
            'We appreciate your review and will continue to improve our service.',
            'Sorry to hear about your experience. Please contact us to resolve this issue.'
          ]),
          createdAt: faker.date.between({ from: createdAt, to: new Date() })
        }
      : undefined,
    createdAt,
    ...overrides
  };
}
