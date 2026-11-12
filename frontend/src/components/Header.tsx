import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuth } from '../hooks/useAuth';

export function Header() {
	const { user } = useUser();
	const { logout } = useAuth();

	if (!user) return null;

	return (
		<header className="sticky top-0 z-50 w-full border-b border-olive-200 bg-olive-100 px-4 py-3 backdrop-blur-xl md:px-8">
			<div className="mx-auto flex max-w-6xl items-center justify-between">
				<Link to="/" className="text-2xl font-bold tracking-tighter text-neutral-900">
					Matcha<span className="text-primary">.</span>
				</Link>

				<nav className="flex items-center gap-4">
					<Link to="/profile" className="flex cursor-pointer items-center gap-4 transition hover:opacity-90">
						<div className="flex flex-col items-end">
							<span className="text-sm font-semibold text-neutral-900">
								{user.username}
							</span>
							<span className="flex items-center gap-1 text-xs font-medium text-amber-500">
								⭐ {user.rating.toFixed(1)}
							</span>
						</div>
						<img
							src={user.avatarUrl}
							alt={`Avatar de ${user.username}`}
							className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
						/>
					</Link>

					<button
						onClick={logout}
						title="Se déconnecter"
						className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-red-100/50 text-red-500 transition hover:bg-red-100 hover:text-red-600 focus:outline-hidden focus:ring-2 focus:ring-red-400"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
							<polyline points="16 17 21 12 16 7"></polyline>
							<line x1="21" y1="12" x2="9" y2="12"></line>
						</svg>
					</button>
				</nav>
			</div>
		</header>
	);
}
