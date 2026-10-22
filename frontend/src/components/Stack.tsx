import type { MockProfile } from '../types/ui';

interface ProfileStackProps {
	profile: MockProfile;
}

export function ProfileStack({ profile }: ProfileStackProps) {
	return (
		<div className="flex w-full flex-col items-center justify-center">
			<div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-white/40 shadow-xl">
				<img
					src={profile.imageUrl}
					alt={profile.name}
					className="absolute inset-0 h-full w-full object-cover"
				/>

				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

				<div className="absolute bottom-0 left-0 w-full p-6 text-white">
					<div className="flex items-baseline gap-2">
						<h2 className="text-3xl font-bold">{profile.name}</h2>
						<span className="text-xl font-medium opacity-90">{profile.age}</span>
					</div>

					<div className="mt-1 flex items-center gap-2 text-sm opacity-80">
						<span>📍 À {profile.distance} km</span>
						<span>•</span>
						<span className="flex items-center gap-1">⭐ {profile.rating}</span>
					</div>

					<div className="mt-4 flex flex-wrap gap-2">
						{profile.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md"
							>
								#{tag}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="mt-8 flex items-center justify-center gap-6">
				<button
					type="button"
					className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition-transform hover:scale-110 hover:bg-neutral-50 focus:outline-hidden"
					aria-label="Passer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
						<path d="M18 6 6 18" /><path d="m6 6 12 12" />
					</svg>
				</button>

				<button
					type="button"
					className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform hover:scale-110 hover:bg-primary-hover focus:outline-hidden"
					aria-label="Liker"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="none">
						<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
					</svg>
				</button>
			</div>
		</div>
	);
}
