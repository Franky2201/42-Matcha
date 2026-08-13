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
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Mot de passe oublié</h1>
      <p className="text-gray-600 mb-8 text-center max-w-sm">
        Entrez votre adresse email pour recevoir un lien de réinitialisation.
      </p>

      {error && (
        <div className="mb-4 text-red-600 font-semibold text-center max-w-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 text-green-600 font-semibold text-center max-w-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link to="/login" className="hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
