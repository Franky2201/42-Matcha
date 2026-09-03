import { Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { LOGOUT_MUTATION } from '../lib/mutations';
import { ME_QUERY } from '../lib/queries';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !isAuthenticated,
  });

  const handleLogout = async () => {
    try {
      await logoutMutation();
    } finally {
      logout();
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">Erreur lors de la récupération du profil.</p>
        <button onClick={handleLogout} className="underline">Se déconnecter</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="mb-8">
        Bienvenue {data?.me?.firstname || 'Utilisateur'}
      </h1>

      <div className="p-6 bg-white rounded-lg border border-gray-100 mb-8">
        <h1>Mon Titre Principal</h1>
        <h2 className="mt-4 mb-2">Une section importante</h2>
        <p>Voici le texte normal de mon application, avec la police Mona Sans.</p>
      </div>

      <button
        onClick={logout}
        className="px-6 py-2 border-2 border-primary rounded hover:bg-primary hover:text-white transition-colors"
      >
        Se déconnecter
      </button>
    </div>
  );
}
