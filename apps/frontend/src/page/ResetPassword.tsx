import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { RESET_PASSWORD_MUTATION } from '../lib/mutations';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [resetPasswordMutation, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError("Aucun jeton de sécurité trouvé dans l'URL.");
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const { data } = await resetPasswordMutation({
        variables: { token, newPassword: password }
      });

      if (data?.resetPassword.includes('succès')) {
        setSuccess(data.resetPassword);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data?.resetPassword || 'Erreur lors de la réinitialisation.');
      }
    } catch {
      setError('Une erreur inattendue est survenue.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">Lien invalide ou expiré.</p>
        <Link to="/login" className="underline font-medium text-neutral-600 hover:text-neutral-800">Retour à la connexion</Link>
      </div>
    );
  }

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[url('https://images.pexels.com/photos/14208568/pexels-photo-14208568.jpeg')] bg-cover bg-center p-4">
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-3xl border border-white/50 bg-white/60 px-6 py-12 backdrop-blur-2xl sm:px-10">
        <div className="mx-auto w-full">
          <h1>
            Nouveau mot de passe
          </h1>

          {!token ? (
            <div className="mt-6 flex flex-col gap-6">
              <p className="font-medium text-base text-red-600">
                Lien invalide ou expiré. Aucun jeton de sécurité trouvé dans l'URL.
              </p>
              <Link to="/login" className="underline font-medium text-neutral-600 hover:text-neutral-800">Retour à la connexion</Link>
            </div>
          ) : (
            <>
              <p className="mt-4 mb-6 text-base">
                Choisissez un nouveau mot de passe sécurisé.
              </p>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 rounded-xl bg-red-100 p-3 text-center text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 rounded-xl bg-green-100 p-3 text-center text-sm font-medium text-green-600">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 block">Nouveau mot de passe</p>
                    <input
                      className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                      id="password"
                      placeholder="Votre nouveau mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      type="password"
                    />
                  </div>
                  <div>
                    <p className="mb-2 block text-neutral-600">Confirmer le mot de passe</p>
                    <input
                      className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                      id="confirmPassword"
                      placeholder="Confirmez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      type="password"
                    />
                  </div>

                  <div className="col-span-full pt-2">
                    <button
                      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 font-medium text-white duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Modification...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
