import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { LOGIN_MUTATION } from '../lib/mutations';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await loginMutation({ 
        variables: { username, password } 
      });

      if (data?.login?.token) {
        login(data.login.token);
        navigate('/');
      } else {
        setError(data?.login?.message || 'Erreur de connexion');
      }
    } catch {
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Connexion</h1>
      
      {error && (
        <div className="mb-4 text-red-600 font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />
        
        <input
          type="password"
          placeholder="Mot de passe"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-black rounded focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link to="/forgot-password" className="hover:underline">
          Mot de passe oublié ?
        </Link>
        <Link to="/register" className="hover:underline">
          Je n'ai pas encore de compte
        </Link>
      </div>
    </div>
  );
}
