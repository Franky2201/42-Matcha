/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '../lib/queries';
import { useAuth } from '../hooks/useAuth';
import type { CurrentUser } from '../types/ui';

interface UserContextType {
	user: CurrentUser | null;
	loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuth();

	const { data, loading } = useQuery(ME_QUERY, {
		skip: !isAuthenticated,
	});

	const user: CurrentUser | null = data?.me ? {
		username: data.me.username,
		rating: data.me.fameRating || 0,
		avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
		firstname: data.me.firstname,
		lastname: data.me.lastname,
	} : null;

	if (loading && isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<p className="font-medium text-neutral-500">Chargement de votre session...</p>
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
