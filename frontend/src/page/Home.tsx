import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FilterSection } from '../components/home/Filter';
import { ProfileGrid } from '../components/home/ProfileGrid';
import { useUser } from '../context/UserContext';
import { FilterProvider, useFilter } from '../context/FilterContext';
import { EXPLORE_PROFILES_QUERY, type ExploreProfileNode } from '../services/explore';
import { calculateDistance } from '../utils/distance';
import { getImageUrl } from '../utils/getImage';
import type { GridProfile } from '../types/ui';

const ITEMS_PER_PAGE = 10;

function HomeContent() {
	const { isAuthenticated } = useAuth();
	const { user } = useUser();
	const { filters } = useFilter();
	const [currentPage, setCurrentPage] = useState(1);

	const { data, loading, error } = useQuery(EXPLORE_PROFILES_QUERY, {
		variables: {
			limit: ITEMS_PER_PAGE,
			offset: (currentPage - 1) * ITEMS_PER_PAGE,
			ageMin: filters.ageMin || null,
			ageMax: filters.ageMax || null,
			fameMin: filters.fameMin || null,
			fameMax: filters.fameMax || null,
			distanceMax: filters.distanceMax || null,
			tags: filters.tags.length > 0 ? filters.tags : null,
			sortBy: filters.sortBy,
			sortOrder: filters.sortOrder
		},
		skip: !isAuthenticated || !user,
		fetchPolicy: 'cache-and-network',
	});

	if (error) {
		console.error("Erreur GraphQL Explore:", error);
	}

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
				{error && (
					<div className="p-4 text-center font-bold text-red-500">
						Erreur de chargement: {error.message}
					</div>
				)}

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

export default function Home() {
	return (
		<FilterProvider>
			<HomeContent />
		</FilterProvider>
	);
}
