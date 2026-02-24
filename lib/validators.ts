import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────────────────────────
export const LoginSchema = z.object({
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    password: z.string().min(8, 'Minimum 8 caractères'),
});

export const RegisterSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
    displayName: z.string().min(2, 'Minimum 2 caractères'),
    phone: z.string().optional(),
    role: z.enum(['client', 'fournisseur', 'marketiste']),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

// ─── Product Schemas ─────────────────────────────────────────────────────────
export const ProductCreateSchema = z.object({
    name: z.string().min(3, 'Minimum 3 caractères').max(200),
    description: z.string().min(10, 'Minimum 10 caractères'),
    category: z.enum(['ecommerce', 'restaurant', 'hotel', 'dating', 'electronics', 'fashion', 'food', 'other']),
    subcategory: z.string().optional(),
    moq: z.number().int().positive('La quantité minimale doit être positive'),
    prices: z.array(z.object({
        minQty: z.number().int().positive(),
        maxQty: z.number().int().positive().optional(),
        price: z.number().positive('Le prix doit être positif'),
    })).min(1, 'Au moins un niveau de prix requis'),
    stock: z.number().int().min(0),
    country: z.string().min(2),
    deliveryTime: z.string().min(1),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    certifications: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
});

export const ProductQuerySchema = z.object({
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
    category: z.string().optional(),
    search: z.string().max(100).optional(),
    lastDocId: z.string().optional(),
    similarTo: z.string().optional(),
});

// ─── Order Schemas ──────────────────────────────────────────────────────────
export const OrderCreateSchema = z.object({
    clientId: z.string().min(1),
    fournisseurId: z.string().min(1),
    products: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        total: z.number().positive(),
    })).min(1),
    shippingAddress: z.object({
        street: z.string().min(1),
        city: z.string().min(1),
        country: z.string().min(2),
        postalCode: z.string().optional(),
    }),
    marketisteCode: z.string().optional(),
    currency: z.string().default('XAF'),
});

// ─── Wallet Schemas ──────────────────────────────────────────────────────────
export const DepositSchema = z.object({
    userId: z.string().min(1, 'User ID requis'),
    amount: z.number().positive('Le montant doit être supérieur à 0').max(10_000_000),
    paymentMethodId: z.string().min(1, 'Méthode de paiement requise'),
    clientName: z.string().min(2, 'Nom requis'),
});

export const WithdrawSchema = z.object({
    userId: z.string().min(1),
    amount: z.number().positive().max(10_000_000),
    pin: z.string().length(4, 'PIN doit être 4 chiffres').regex(/^\d{4}$/),
    paymentMethodId: z.string().min(1),
});

export const TransferSchema = z.object({
    senderId: z.string().min(1),
    receiverId: z.string().min(1),
    amount: z.number().positive().max(10_000_000),
    pin: z.string().length(4).regex(/^\d{4}$/),
    note: z.string().max(200).optional(),
});

export const PinSetupSchema = z.object({
    userId: z.string().min(1),
    pin: z.string().length(4, 'Le PIN doit être 4 chiffres').regex(/^\d{4}$/),
});

// ─── Chat Schemas ────────────────────────────────────────────────────────────
export const MessageSchema = z.object({
    senderId: z.string().min(1),
    receiverId: z.string().min(1),
    content: z.string().min(1).max(5000),
    type: z.enum(['text', 'image', 'file']).default('text'),
    productId: z.string().optional(),
});

// ─── Types inférés ───────────────────────────────────────────────────────────
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type OrderCreateInput = z.infer<typeof OrderCreateSchema>;
export type DepositInput = z.infer<typeof DepositSchema>;
export type WithdrawInput = z.infer<typeof WithdrawSchema>;
export type TransferInput = z.infer<typeof TransferSchema>;
export type MessageInput = z.infer<typeof MessageSchema>;

// ─── Helper de validation pour API Routes ────────────────────────────────────
export function zodValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}
