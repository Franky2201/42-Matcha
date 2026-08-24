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
        <Link to="/login" className="underline">Retour à la connexion</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Nouveau mot de passe</h1>

      {error && <div className="mb-4 text-red-600 font-semibold text-center max-w-sm">{error}</div>}
      {success && <div className="mb-4 text-green-600 font-semibold text-center max-w-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Modification...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
