import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { FORGOT_PASSWORD_MUTATION } from '../lib/mutations';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [forgotPasswordMutation, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const { data } = await forgotPasswordMutation({
        variables: { email }
      });

      if (data?.requestPasswordReset) {
        setMessage(data.requestPasswordReset);
        setEmail('');
      }
    } catch {
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[url('https://images.pexels.com/photos/14208568/pexels-photo-14208568.jpeg')] bg-cover bg-center p-4">
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-3xl border border-white/50 bg-white/60 px-6 py-12 backdrop-blur-2xl sm:px-10">
        <div className="mx-auto w-full">
          <h1 className="font-semibold text-3xl text-neutral-600 tracking-tighter">
            Mot de passe oublié
          </h1>
          <p className="mt-4 mb-6 font-medium text-base text-neutral-500">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-xl bg-red-100 p-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 rounded-xl bg-green-100 p-3 text-center text-sm font-medium text-green-600">
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="mb-2 block text-neutral-600">Email</p>
                <input
                  className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 text-neutral-900 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                  id="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>

              <div className="col-span-full pt-2">
                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 font-medium text-white duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </div>
            </div>

            <Link to="/login" className="mx-auto mt-6 flex justify-center text-center text-neutral-500 hover:text-black leading-tight duration-200">
              Retour à la connexion
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
