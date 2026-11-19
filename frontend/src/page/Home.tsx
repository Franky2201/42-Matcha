import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FilterSection } from '../components/home/Filter';
import { ProfileGrid } from '../components/home/ProfileGrid';
import { useUser } from '../context/UserContext';
import { EXPLORE_PROFILES_QUERY, type ExploreProfileNode } from '../services/explore';
import { calculateDistance } from '../utils/distance';
import type { GridProfile } from '../types/ui';
import { getImageUrl } from '../utils/getImage';

const ITEMS_PER_PAGE = 10;

export default function Home() {
	const { isAuthenticated } = useAuth();
	const { user } = useUser();
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
			avatarUrl: getImageUrl(p.photos?.[0], `${p.firstname}+${p.lastname}`)
		};
	});

	return (
		<div className="relative z-10 flex min-h-screen flex-col bg-zinc-200">
			<Header />

			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-8">
				<FilterSection />

				<section className="flex flex-1 flex-col py-8">
					{loading && gridProfiles.length === 0 ? (
						<div className="flex flex-1 items-center justify-center font-bold text-neutral-500">
							Chargement des profils...
						</div>
					) : (
						<ProfileGrid
							profiles={gridProfiles}
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					)}
				</section>
			</main>

			<Footer />
		</div>
	);
}
