import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function OAuthCallback() {
	const { login } = useAuth();

	useEffect(() => {
		login();
		window.location.href = '/';
	}, [login]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-200">
			<div className="text-xl font-bold text-neutral-600">Connexion sécurisée en cours...</div>
		</div>
	);
}
