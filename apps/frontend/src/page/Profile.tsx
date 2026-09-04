import { Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { LOGOUT_MUTATION } from '../lib/mutations';
import { ME_QUERY } from '../lib/queries';
import { Header } from '../components/Header';
import type { CurrentUser } from '../types/ui';

export default function ProfilePage() {
	const { isAuthenticated, logout } = useAuth();
	const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION);

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
			<div className="flex min-h-screen items-center justify-center bg-white">
				<p className="font-medium text-neutral-500">Chargement du profil...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
				<p className="font-medium text-red-600">Erreur lors de la récupération du profil.</p>
				<button onClick={handleLogout} className="text-sm font-semibold underline">
					Se déconnecter
				</button>
			</div>
		);
	}

	const currentUser: CurrentUser = {
		username: data?.me?.username || 'Utilisateur',
		rating: data?.me?.fameRating || 0,
		avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
	};

	return (
		<div className="flex min-h-screen flex-col bg-white bg-cover bg-center bg-fixed">
			<div className="relative z-10 flex min-h-screen flex-col">
				<Header user={currentUser} />

				<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 md:px-8">
					<div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-white/50 bg-white/60 px-6 py-12 shadow-xl backdrop-blur-2xl sm:px-10">

						<div className="mb-8 flex flex-col items-center text-center">
							<div className="mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md">
								<img
									src={currentUser.avatarUrl}
									alt={currentUser.username}
									className="h-full w-full object-cover"
								/>
							</div>
							<h1 className="text-2xl font-bold tracking-tight text-neutral-900">
								{data?.me?.firstname} {data?.me?.lastname}
							</h1>
							<p className="text-sm font-medium text-neutral-500">@{currentUser.username}</p>
						</div>

						<button
							onClick={handleLogout}
							disabled={logoutLoading}
							className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-red-500 px-5 py-3 font-medium text-white duration-200 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
								<polyline points="16 17 21 12 16 7"></polyline>
								<line x1="21" y1="12" x2="9" y2="12"></line>
							</svg>
							{logoutLoading ? 'Déconnexion...' : 'Se déconnecter'}
						</button>
					</div>
				</main>
			</div>
		</div>
	);
}
