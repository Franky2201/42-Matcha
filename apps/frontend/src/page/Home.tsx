import { Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { ME_QUERY } from '../lib/queries';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();

  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !isAuthenticated,
  });

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
        <button onClick={logout} className="underline">Se déconnecter</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">
        Bienvenue {data?.me?.firstname || 'Utilisateur'}
      </h1>
      
      <button
        onClick={logout}
        className="px-6 py-2 border-2 border-black rounded hover:bg-black hover:text-white transition-colors"
      >
        Se déconnecter
      </button>
    </div>
  );
}
