import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProfileProvider } from '../context/ProfileContext';
import { ProfileForm } from '../components/profile/ProfileForm';

export default function ProfilePage() {
	const { isAuthenticated, logout } = useAuth();
	const { user } = useUser();
	const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (!user) return null;

	return (
		<div className="relative z-10 flex min-h-screen flex-col bg-zinc-200">
			<Header />

			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-8">
				<div className="flex flex-col gap-8 md:flex-row md:items-start">

					<aside className="flex w-full flex-col gap-6 md:sticky md:top-24 md:w-1/3">
						<div className="flex flex-col items-center rounded-3xl border border-white/50 bg-white/60 px-6 py-8 shadow-xl backdrop-blur-2xl">
							<img
								src={user.avatarUrl}
								alt={user.username}
								className="mb-4 h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
							/>
							<h1 className="text-2xl font-bold tracking-tight text-neutral-900">
								{user.firstname} {user.lastname}
							</h1>
							<p className="text-sm font-medium text-neutral-500">@{user.username}</p>

							<div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">
								<span className="font-bold">⭐ {user.rating.toFixed(1)}</span>
								<span className="text-xs font-medium">Score de popularité</span>
							</div>

							<nav className="mt-8 flex w-full flex-col gap-2">
								<button
									onClick={() => setActiveTab('view')}
									className={`rounded-xl px-4 py-3 text-left font-medium transition ${activeTab === 'view' ? 'bg-primary text-white' : 'bg-white/50 text-neutral-700 hover:bg-white/80'}`}
								>
									Tableau de bord
								</button>
								<button
									onClick={() => setActiveTab('edit')}
									className={`rounded-xl px-4 py-3 text-left font-medium transition ${activeTab === 'edit' ? 'bg-primary text-white' : 'bg-white/50 text-neutral-700 hover:bg-white/80'}`}
								>
									Modifier le profil
								</button>
								<button
									onClick={logout}
									className="mt-4 inline-flex items-center gap-3 rounded-xl bg-red-100 px-4 py-3 font-medium text-red-600 transition hover:bg-red-200"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
										<polyline points="16 17 21 12 16 7"></polyline>
										<line x1="21" y1="12" x2="9" y2="12"></line>
									</svg>
									Se déconnecter
								</button>
							</nav>
						</div>
					</aside>

					<section className="flex flex-1 flex-col gap-8 rounded-3xl border border-white/50 bg-white/60 p-6 shadow-xl backdrop-blur-2xl sm:p-10">
						<div>
							<h2 className="text-2xl font-bold text-neutral-900">
								{activeTab === 'view' ? 'Tableau de bord' : 'Édition du profil'}
							</h2>
							<p className="text-neutral-600">
								{activeTab === 'view'
									? 'Aperçu de votre activité et paramètres de localisation.'
									: 'Mettez à jour vos informations pour optimiser vos matchs.'}
							</p>
						</div>

						{activeTab === 'view' ? (
							<>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="rounded-2xl border border-white/40 bg-white/50 p-6 backdrop-blur-sm">
										<h3 className="mb-2 text-lg font-semibold text-neutral-800">Vues du profil</h3>
										<div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-black/10 bg-black/5 text-neutral-500">
											[Composant Vues à venir]
										</div>
									</div>
									<div className="rounded-2xl border border-white/40 bg-white/50 p-6 backdrop-blur-sm">
										<h3 className="mb-2 text-lg font-semibold text-neutral-800">Vos Likes</h3>
										<div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-black/10 bg-black/5 text-neutral-500">
											[Composant Likes à venir]
										</div>
									</div>
								</div>
								<div className="rounded-2xl border border-white/40 bg-white/50 p-6 backdrop-blur-sm">
									<h3 className="mb-2 text-lg font-semibold text-neutral-800">Localisation</h3>
									<p className="mb-4 text-sm text-neutral-600">
										Votre positionnement est requis pour le système de matching. Vous pouvez utiliser le GPS ou définir votre ville manuellement.
									</p>
									<div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-black/10 bg-black/5 text-neutral-500">
										[Composant Map/GPS à venir]
									</div>
								</div>
							</>
						) : (
							<ProfileProvider>
								<ProfileForm />
							</ProfileProvider>
						)}
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
}
