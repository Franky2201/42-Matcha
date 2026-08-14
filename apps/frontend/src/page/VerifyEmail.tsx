import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { VERIFY_EMAIL_MUTATION } from '../lib/mutations';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('');
  const hasRun = useRef(false);

  const [verifyEmailMutation, { loading }] = useMutation(VERIFY_EMAIL_MUTATION);

  useEffect(() => {
    if (!token || hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        const { data } = await verifyEmailMutation({ variables: { token } });
        setMessage(data?.verifyEmail || 'Erreur inconnue.');
      } catch {
        setMessage('Une erreur inattendue est survenue.');
      }
    };

    verify();
  }, [token, verifyEmailMutation]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Vérification du compte</h1>
      
      {!token ? (
        <p className="text-red-600 font-semibold mb-8 text-center">
          Aucun jeton de vérification fourni dans l'URL.
        </p>
      ) : loading ? (
        <p className="text-gray-600 mb-8 text-center">
          Vérification en cours, veuillez patienter...
        </p>
      ) : (
        <p className="font-semibold mb-8 text-center">{message}</p>
      )}

      <Link 
        to="/login" 
        className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
      >
        Aller à la connexion
      </Link>
    </div>
  );
}
