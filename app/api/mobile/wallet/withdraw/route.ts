import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { WithdrawSchema, zodValidate } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('💸 [API] POST /api/mobile/wallet/withdraw');

    // Validation Zod
    const validation = zodValidate(WithdrawSchema, body);
    if (!validation.success) {
      const errors = validation.errors;
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: errors.flatten() },
        { status: 400 }
      );
    }
    const { userId, paymentMethodId, amount } = validation.data;

    console.log('💸 [API] Validated withdraw:', { userId, paymentMethodId, amount });

    // Vérifier que l'utilisateur existe et récupérer son wallet
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Utilisateur non trouvé'
        },
        { status: 404 }
      );
    }

    // Récupérer le wallet
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Portefeuille non trouvé'
        },
        { status: 404 }
      );
    }

    const wallet = walletSnap.data();

    // Vérifier le solde
    if (wallet.balance < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Solde insuffisant. Votre solde: ${wallet.balance} FCFA`
        },
        { status: 400 }
      );
    }

    // Vérifier que la méthode de paiement existe
    const methodRef = doc(db, 'paymentMethods', paymentMethodId);
    const methodSnap = await getDoc(methodRef);

    if (!methodSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Méthode de paiement non trouvée'
        },
        { status: 404 }
      );
    }

    const paymentMethod = methodSnap.data();

    // Créer la transaction
    const transactionData = {
      userId,
      type: 'withdrawal',
      amount,
      fees: 0,
      totalAmount: amount,
      currency: 'FCFA',
      status: 'pending',
      paymentMethodId,
      paymentMethodName: paymentMethod.name,
      paymentMethodType: paymentMethod.type,
      description: `Retrait via ${paymentMethod.name}`,
      reference: `WTH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);

    // Mettre à jour le solde (déduire du balance, ajouter au pendingBalance)
    await updateDoc(walletRef, {
      balance: increment(-amount),
      pendingBalance: increment(amount),
      updatedAt: serverTimestamp()
    });

    console.log(`✅ [API] Withdrawal transaction created: ${transactionRef.id}`);

    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionRef.id,
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      message: 'Demande de retrait créée avec succès'
    });
  } catch (error: any) {
    console.error('❌ [API] Error creating withdrawal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la création du retrait'
      },
      { status: 500 }
    );
  }
}
