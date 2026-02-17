'use client';

import { useState, useEffect } from 'react';
import { verifyEmailCode, resendEmailVerificationCode } from '@/lib/firebase/verification';
import { Mail, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailVerificationProps {
  userId: string;
  email: string;
  displayName: string;
  onSuccess: () => void;
}

export default function EmailVerification({ userId, email, displayName, onSuccess }: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(240); // 4 minutes en secondes
  const [canResend, setCanResend] = useState(false);

  // Timer pour l'expiration du code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  // Formater le temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gérer la saisie du code (seulement des chiffres)
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  // Vérifier le code
  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    setLoading(true);

    try {
      await verifyEmailCode(userId, code);
      toast.success('Email vérifié avec succès ! 🎉');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Code de vérification incorrect');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code
  const handleResend = async () => {
    setResending(true);

    try {
      await resendEmailVerificationCode(userId, email, displayName);
      toast.success('Un nouveau code a été envoyé à votre email');
      setTimer(240); // Réinitialiser le timer
      setCanResend(false);
      setCode('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setResending(false);
    }
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6 && !loading) {
      handleVerify();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Icône et titre */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vérifiez votre email
          </h2>
          <p className="text-gray-600">
            Nous avons envoyé un code de vérification à
          </p>
          <p className="text-orange-600 font-semibold mt-1">{email}</p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-blue-900 font-medium">
            {timer > 0 ? (
              <>Code expire dans {formatTime(timer)}</>
            ) : (
              <>Code expiré</>
            )}
          </span>
        </div>

        {/* Input du code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code de vérification
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={loading || timer === 0}
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            Entrez le code à 6 chiffres
          </p>
        </div>

        {/* Bouton de vérification */}
        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 6 || timer === 0}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Vérification...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Vérifier
            </>
          )}
        </button>

        {/* Bouton de renvoi */}
        <button
          onClick={handleResend}
          disabled={resending || !canResend}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {resending ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              {canResend ? 'Renvoyer le code' : `Renvoyer (${formatTime(timer)})`}
            </>
          )}
        </button>

        {/* Aide */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Vous ne recevez pas le code ?</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Vérifiez votre dossier spam/courrier indésirable</li>
            <li>Assurez-vous que l'adresse email est correcte</li>
            <li>Attendez quelques minutes avant de renvoyer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
