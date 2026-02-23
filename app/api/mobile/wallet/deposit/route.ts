import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, paymentMethodId, clientName, amount } = body;
    
    console.log('💰 [API] POST /api/mobile/wallet/deposit', { userId, paymentMethodId, amount });
    
    // Validation
    if (!userId || !paymentMethodId || !clientName || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants'
        },
        { status: 400 }
      );
    }
    
    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le montant doit être supérieur à 0'
        },
        { status: 400 }
      );
    }
    
    // Vérifier que l'utilisateur existe
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
      type: 'deposit',
      amount,
      fees: 0,
      totalAmount: amount,
      currency: 'FCFA',
      status: 'pending',
      paymentMethodId,
      paymentMethodName: paymentMethod.name,
      paymentMethodType: paymentMethod.type,
      clientName,
      description: `Dépôt via ${paymentMethod.name}`,
      reference: `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
    
    console.log(`✅ [API] Deposit transaction created: ${transactionRef.id}`);
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionRef.id,
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      message: 'Demande de dépôt créée avec succès'
    });
  } catch (error: any) {
    console.error('❌ [API] Error creating deposit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la création du dépôt'
      },
      { status: 500 }
    );
  }
}
