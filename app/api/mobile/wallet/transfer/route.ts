import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, toUserId, amount, description, pin } = body;
    
    console.log('💱 [API] POST /api/mobile/wallet/transfer', { userId, toUserId, amount });
    
    // Validation
    if (!userId || !toUserId || !amount) {
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
    
    if (userId === toUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vous ne pouvez pas transférer à vous-même'
        },
        { status: 400 }
      );
    }
    
    // Utiliser une transaction Firestore pour garantir l'atomicité
    const result = await runTransaction(db, async (transaction) => {
      // Récupérer le wallet de l'expéditeur
      const senderWalletRef = doc(db, 'wallets', userId);
      const senderWalletSnap = await transaction.get(senderWalletRef);
      
      if (!senderWalletSnap.exists()) {
        throw new Error('Portefeuille de l\'expéditeur non trouvé');
      }
      
      const senderWallet = senderWalletSnap.data();
      
      // Vérifier le PIN si fourni
      if (pin && senderWallet.pin && senderWallet.pin !== pin) {
        throw new Error('PIN incorrect');
      }
      
      // Vérifier le solde
      if (senderWallet.balance < amount) {
        throw new Error(`Solde insuffisant. Votre solde: ${senderWallet.balance} FCFA`);
      }
      
      // Récupérer le wallet du destinataire
      const receiverWalletRef = doc(db, 'wallets', toUserId);
      const receiverWalletSnap = await transaction.get(receiverWalletRef);
      
      if (!receiverWalletSnap.exists()) {
        throw new Error('Portefeuille du destinataire non trouvé');
      }
      
      // Récupérer les infos du destinataire
      const receiverUserRef = doc(db, 'users', toUserId);
      const receiverUserSnap = await transaction.get(receiverUserRef);
      
      if (!receiverUserSnap.exists()) {
        throw new Error('Destinataire non trouvé');
      }
      
      const receiverUser = receiverUserSnap.data();
      
      // Créer la transaction de débit (expéditeur)
      const debitTransactionData = {
        userId,
        toUserId,
        type: 'transfer',
        subType: 'debit',
        amount,
        fees: 0,
        totalAmount: amount,
        currency: 'FCFA',
        status: 'completed',
        description: description || `Transfert vers ${receiverUser.displayName}`,
        reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const debitTransactionRef = doc(collection(db, 'transactions'));
      transaction.set(debitTransactionRef, debitTransactionData);
      
      // Créer la transaction de crédit (destinataire)
      const creditTransactionData = {
        userId: toUserId,
        fromUserId: userId,
        type: 'transfer',
        subType: 'credit',
        amount,
        fees: 0,
        totalAmount: amount,
        currency: 'FCFA',
        status: 'completed',
        description: description || `Transfert reçu`,
        reference: debitTransactionData.reference,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const creditTransactionRef = doc(collection(db, 'transactions'));
      transaction.set(creditTransactionRef, creditTransactionData);
      
      // Mettre à jour les soldes
      transaction.update(senderWalletRef, {
        balance: increment(-amount),
        updatedAt: serverTimestamp()
      });
      
      transaction.update(receiverWalletRef, {
        balance: increment(amount),
        updatedAt: serverTimestamp()
      });
      
      return {
        debitTransactionId: debitTransactionRef.id,
        creditTransactionId: creditTransactionRef.id,
        debitTransactionData,
        creditTransactionData
      };
    });
    
    console.log(`✅ [API] Transfer completed: ${result.debitTransactionId}`);
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: result.debitTransactionId,
        ...result.debitTransactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      message: 'Transfert effectué avec succès'
    });
  } catch (error: any) {
    console.error('❌ [API] Error creating transfer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors du transfert'
      },
      { status: 500 }
    );
  }
}
