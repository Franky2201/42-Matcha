import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { REGISTER_MUTATION } from '../lib/mutations';

const FORBIDDEN_PASSWORDS = ['password', 'admin', 'qwerty', '123456', 'welcome', 'love'];

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const lowerPassword = password.toLowerCase();
    if (FORBIDDEN_PASSWORDS.some(word => lowerPassword.includes(word))) {
      setError('Votre mot de passe contient un mot anglais trop commun ou est trop faible.');
      return;
    }

    try {
      const { data } = await registerMutation({ 
        variables: { email, username, firstname, lastname, password } 
      });

      if (data?.register?.user) {
        setSuccess('Inscription réussie ! Vous allez être redirigé vers la connexion.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data?.register?.message || "Erreur lors de l'inscription");
      }
    } catch {
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Inscription</h1>
      
      {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}
      {success && <div className="mb-4 text-green-600 font-semibold text-center">{success}</div>}

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <input
          type="text"
          placeholder="Prénom"
          required
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <input
          type="text"
          placeholder="Nom de famille"
          required
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />
        
        <input
          type="password"
          placeholder="Mot de passe"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Chargement...' : 'S\'inscrire'}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link to="/login" className="hover:underline">
          J'ai déjà un compte
        </Link>
      </div>
    </div>
  );
}
