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
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[url('https://images.pexels.com/photos/14208568/pexels-photo-14208568.jpeg')] bg-cover bg-center p-4">
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-3xl border border-white/50 bg-white/60 px-6 py-12 backdrop-blur-2xl sm:px-10">
        <div className="mx-auto w-full text-center">
          <h1 className="font-semibold text-3xl text-neutral-600 tracking-tighter mb-8">
            Vérification du compte
          </h1>

          {!token ? (
            <p className="mb-8 font-medium text-base text-red-600">
              Aucun jeton de vérification fourni dans l'URL.
            </p>
          ) : loading ? (
            <p className="mb-8 font-medium text-base text-neutral-500">
              Vérification en cours, veuillez patienter...
            </p>
          ) : (
            <p className="mb-8 font-medium text-base text-neutral-900">
              {message}
            </p>
          )}

          <Link
            to="/login"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 font-medium text-white duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    </section>
  );
}
