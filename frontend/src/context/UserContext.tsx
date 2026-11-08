/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '../services/user';
import { useAuth } from '../hooks/useAuth';
import type { CurrentUser } from '../types/ui';

interface UserContextType {
	user: CurrentUser | null;
	loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const { isAuthenticated, logout } = useAuth();

	const { data, loading, error } = useQuery(ME_QUERY, {
		skip: !isAuthenticated,
	});

	useEffect(() => {
		if (isAuthenticated && !loading && (error || (data && !data.me))) {
			logout();
		}
	}, [isAuthenticated, loading, error, data, logout]);

	const user: CurrentUser | null = data?.me ? {
		username: data.me.username,
		email: data.me.email,
		rating: data.me.fameRating || 0,
		avatarUrl: data.me.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
		firstname: data.me.firstname,
		lastname: data.me.lastname,
		gender: data.me.gender || '',
		preference: data.me.preference || '',
		biography: data.me.biography || '',
		tags: data.me.tags || [],
		photos: data.me.photos || [],
	} : null;

	if (loading && isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-900">
				<p className="font-medium text-white">Chargement de votre session...</p>
			</div>
		);
	}

	return (
		<UserContext.Provider value={{ user, loading }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
	}
	return context;
}
