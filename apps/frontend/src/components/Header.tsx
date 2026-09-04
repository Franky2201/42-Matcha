import { Link } from 'react-router-dom';
import type { CurrentUser } from '../types/ui';

interface HeaderProps {
	user: CurrentUser;
}

export function Header({ user }: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-olive-200 bg-olive-100 px-4 py-3 backdrop-blur-xl md:px-8">
			<div className="mx-auto flex max-w-6xl items-center justify-between">
				<Link to="/" className="text-2xl font-bold tracking-tighter text-neutral-900">
					Matcha<span className="text-primary">.</span>
				</Link>

				<Link to="/profile" className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition">
					<div className="flex flex-col items-end">
						<span className="text-sm font-semibold text-neutral-900">
							{user.username}
						</span>
						<span className="flex items-center gap-1 text-xs font-medium text-amber-500">
							⭐ {user.rating.toFixed(1)}
						</span>
					</div>
					<div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
						<img
							src={user.avatarUrl}
							alt={`Avatar de ${user.username}`}
							className="h-full w-full object-cover"
						/>
					</div>
				</Link>
			</div>
		</header>
	);
}
