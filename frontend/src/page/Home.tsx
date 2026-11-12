import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FilterSection } from '../components/home/Filter';
import { ProfileStack } from '../components/home/Stack';
import { ProfileGrid } from '../components/home/ProfileGrid';
import { useUser } from '../context/UserContext';
import { EXPLORE_PROFILES_QUERY, type ExploreProfileNode } from '../services/explore';
import { calculateDistance } from '../utils/distance';
import type { GridProfile, MockProfile } from '../types/ui';

const ITEMS_PER_PAGE = 10;

export default function Home() {
	const { isAuthenticated } = useAuth();
	const { user } = useUser();
	
	const [viewMode, setViewMode] = useState<'stack' | 'grid'>('grid');
	const [currentPage, setCurrentPage] = useState(1);

	const { data, loading } = useQuery(EXPLORE_PROFILES_QUERY, {
		variables: { limit: ITEMS_PER_PAGE, offset: (currentPage - 1) * ITEMS_PER_PAGE },
		skip: !isAuthenticated || !user,
		fetchPolicy: 'cache-and-network',
	});

	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (!user) return null;

	const exploreProfiles = data?.exploreProfiles || [];
	const totalCount = data?.exploreProfilesCount || 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

	const gridProfiles: GridProfile[] = exploreProfiles.map((p: ExploreProfileNode) => {
		const distance = user.latitude && user.longitude && p.latitude && p.longitude
			? calculateDistance(user.latitude, user.longitude, p.latitude, p.longitude)
			: 0;

		return {
			id: p.id.toString(),
			firstname: p.firstname,
			lastname: p.lastname,
			distance,
			tags: p.tags || [],
			avatarUrl: p.photos?.[0] || `https://ui-avatars.com/api/?name=${p.firstname}+${p.lastname}&background=random`
		};
	});

	const stackProfile: MockProfile | null = exploreProfiles.length > 0 ? {
		id: exploreProfiles[0].id.toString(),
		name: exploreProfiles[0].firstname,
		age: 25,
		distance: gridProfiles[0]?.distance || 0,
		rating: exploreProfiles[0].fameRating || 0,
		tags: exploreProfiles[0].tags || [],
		imageUrl: exploreProfiles[0].photos?.[0] || `https://ui-avatars.com/api/?name=${exploreProfiles[0].firstname}+${exploreProfiles[0].lastname}&background=random`
	} : null;

	return (
		<div className="relative z-10 flex min-h-screen flex-col bg-zinc-200">
			<Header />

			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-8">
				<FilterSection />

				<div className="my-6 flex justify-center">
					<div className="flex rounded-xl bg-white/40 p-1 shadow-inner backdrop-blur-md">
						<button
							onClick={() => setViewMode('grid')}
							className={`cursor-pointer rounded-lg px-6 py-2 text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
						>
							Grille
						</button>
						<button
							onClick={() => setViewMode('stack')}
							className={`cursor-pointer rounded-lg px-6 py-2 text-sm font-bold transition-all ${viewMode === 'stack' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
						>
							Balayage
						</button>
					</div>
				</div>

				<section className="flex flex-1 flex-col py-4">
					{loading && gridProfiles.length === 0 ? (
						<div className="flex flex-1 items-center justify-center font-bold text-neutral-500">
							Chargement des profils...
						</div>
					) : viewMode === 'grid' ? (
						<ProfileGrid 
							profiles={gridProfiles} 
							currentPage={currentPage} 
							totalPages={totalPages}
							onPageChange={setCurrentPage} 
						/>
					) : (
						<div className="flex items-center justify-center">
							{stackProfile ? (
								<ProfileStack profile={stackProfile} />
							) : (
								<div className="font-bold text-neutral-500">Aucun profil à swiper pour le moment.</div>
							)}
						</div>
					)}
				</section>
			</main>

			<Footer />
		</div>
	);
}
