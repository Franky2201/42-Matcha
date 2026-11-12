import type { GridProfile } from '../../types/ui';

interface ProfileGridProps {
	profiles: GridProfile[];
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function ProfileGrid({ profiles, currentPage, totalPages, onPageChange }: ProfileGridProps) {
	return (
		<div className="flex w-full flex-col items-center gap-8">
			{profiles.length === 0 ? (
				<div className="flex w-full flex-1 items-center justify-center p-12 font-bold text-neutral-500">
					Aucun profil trouvé sur cette page.
				</div>
			) : (
				<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{profiles.map((profile) => (
						<div
							key={profile.id}
							className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/40 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
						>
							<img
								src={profile.avatarUrl}
								alt={`${profile.firstname} ${profile.lastname}`}
								className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
							
							<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

							<div className="absolute bottom-0 left-0 flex w-full flex-col p-4 text-white">
								<h3 className="truncate text-lg font-bold leading-tight">
									{profile.firstname} {profile.lastname}
								</h3>
								
								<div className="mt-1 flex items-center gap-1 text-xs font-medium text-neutral-300">
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
									<span>À {profile.distance} km</span>
								</div>

								<div className="mt-3 flex flex-wrap gap-1.5">
									{profile.tags.slice(0, 3).map((tag) => (
										<span
											key={tag}
											className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-md"
										>
											#{tag}
										</span>
									))}
									{profile.tags.length > 3 && (
										<span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-md">
											+{profile.tags.length - 3}
										</span>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{totalPages > 0 && (
				<div className="flex items-center gap-2">
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/60 font-bold text-neutral-700 shadow-sm backdrop-blur-sm transition hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-40"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
					</button>
					
					<span className="min-w-[4rem] text-center text-sm font-semibold text-neutral-700">
						{currentPage} / {totalPages}
					</span>
					
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
						className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/60 font-bold text-neutral-700 shadow-sm backdrop-blur-sm transition hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-40"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
					</button>
				</div>
			)}
		</div>
	);
}
