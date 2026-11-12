import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { useUser } from '../../context/UserContext';
import { UPDATE_LOCATION_MUTATION } from '../../services/user';

export function LocationSettings() {
	const { user } = useUser();
	const [updateLocation, { loading: isSaving }] = useMutation(UPDATE_LOCATION_MUTATION);
	
	const [lat, setLat] = useState<number | null>(user?.latitude ?? null);
	const [lon, setLon] = useState<number | null>(user?.longitude ?? null);
	const [address, setAddress] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');

	const fetchAddress = useCallback(async (latitude: number, longitude: number) => {
		try {
			const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
			const data = await res.json();
			setAddress(data.address.city || data.address.town || data.address.village || data.address.suburb || 'Localisation personnalisée');
		} catch {
			setAddress('Coordonnées enregistrées');
		}
	}, []);

	useEffect(() => {
		if (lat !== null && lon !== null && !address) {
			fetchAddress(lat, lon);
		}
	}, [lat, lon, address, fetchAddress]);

	const handleGPS = () => {
		setError('');
		setSuccessMsg('');
		setIsLoading(true);

		if (!navigator.geolocation) {
			setError("La géolocalisation n'est pas supportée par ce navigateur.");
			setIsLoading(false);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;
				setLat(latitude);
				setLon(longitude);
				await fetchAddress(latitude, longitude);
				setIsLoading(false);
			},
			() => {
				setError("Accès refusé. Saisissez votre ville manuellement.");
				setIsLoading(false);
			}
		);
	};

	const handleManualSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		
		setError('');
		setSuccessMsg('');
		setIsLoading(true);

		try {
			const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
			const data = await res.json();

			if (data && data.length > 0) {
				const latitude = parseFloat(data[0].lat);
				const longitude = parseFloat(data[0].lon);
				setLat(latitude);
				setLon(longitude);
				setAddress(data[0].display_name.split(',')[0]);
				setSearchQuery('');
			} else {
				setError("Lieu introuvable. Essayez une autre saisie.");
			}
		} catch {
			setError("Erreur lors de la recherche.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		if (lat === null || lon === null) return;
		setError('');
		setSuccessMsg('');
		try {
			await updateLocation({ variables: { latitude: lat, longitude: lon } });
			setSuccessMsg("Localisation sauvegardée avec succès.");
		} catch {
			setError("Erreur lors de la sauvegarde.");
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 sm:flex-row">
				<button
					onClick={handleGPS}
					disabled={isLoading}
					className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white transition hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
					Utiliser le GPS
				</button>
				<form onSubmit={handleManualSearch} className="flex flex-1 gap-2">
					<input
						type="text"
						placeholder="Ou saisir une ville..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full min-w-0 rounded-xl border border-white/40 bg-white/50 px-4 py-3 font-medium text-neutral-800 backdrop-blur-sm transition focus:border-primary focus:bg-white focus:outline-hidden"
					/>
					<button
						type="submit"
						disabled={isLoading || !searchQuery.trim()}
						className="flex cursor-pointer items-center justify-center rounded-xl bg-neutral-800 px-4 py-3 font-bold text-white transition hover:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
					</button>
				</form>
			</div>

			{error && <p className="text-sm font-semibold text-red-500">{error}</p>}
			{successMsg && <p className="text-sm font-semibold text-green-600">{successMsg}</p>}

			{lat !== null && lon !== null ? (
				<div className="overflow-hidden rounded-xl border-2 border-white/60 shadow-inner">
					<iframe
						width="100%"
						height="250"
						frameBorder="0"
						scrolling="no"
						marginHeight={0}
						marginWidth={0}
						src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.015},${lat - 0.015},${lon + 0.015},${lat + 0.015}&layer=mapnik&marker=${lat},${lon}`}
						className="pointer-events-none"
					></iframe>
				</div>
			) : (
				<div className="flex h-[250px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white/50 text-neutral-500">
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
					<span className="font-medium">Aucune localisation définie</span>
					<span className="mt-1 text-xs font-semibold text-red-400">Requis pour le système de matching</span>
				</div>
			)}

			<div className="flex flex-col gap-4 rounded-xl border border-white/40 bg-white/60 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Position actuelle</p>
					<p className="font-bold text-neutral-900">{address || 'Non définie'}</p>
				</div>
				<button
					onClick={handleSave}
					disabled={isSaving || lat === null || lon === null}
					className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 font-bold text-white transition hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
				>
					{isSaving ? 'Enregistrement...' : 'Enregistrer la position'}
				</button>
			</div>
		</div>
	);
}
