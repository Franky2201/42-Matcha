import { useRef } from 'react';
import { useProfile } from '../../hooks/useProfile';

export function PhotoUploader() {
	const { formData, updateField, errors } = useProfile();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const activeIndexRef = useRef<number>(0);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const newPhotos = [...formData.photos];
			newPhotos[activeIndexRef.current] = file;
			updateField('photos', newPhotos);
		}
	};

	const removePhoto = (index: number) => {
		const newPhotos = [...formData.photos];
		newPhotos[index] = null;
		updateField('photos', newPhotos);
	};

	const triggerUpload = (index: number) => {
		activeIndexRef.current = index;
		fileInputRef.current?.click();
	};

	return (
		<div className="w-full">
			<label className="mb-2 block text-sm font-semibold text-neutral-700">Photos (La 1ère est votre photo de profil)</label>
			<div className="grid grid-cols-3 gap-3 md:grid-cols-5">
				{formData.photos.map((photo, index) => {
					const previewUrl = photo instanceof File ? URL.createObjectURL(photo) : photo;

					return (
						<div key={index} className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-dashed border-white/60 bg-white/40 transition hover:bg-white/60">
							{previewUrl ? (
								<>
									<img src={previewUrl} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
									<button
										type="button"
										onClick={() => removePhoto(index)}
										className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white backdrop-blur-md transition hover:bg-red-500"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
									</button>
									{index === 0 && (
										<span className="absolute bottom-0 left-0 w-full bg-primary/80 py-1 text-center text-xs font-bold text-white backdrop-blur-sm">PROFIL</span>
									)}
								</>
							) : (
								<button
									type="button"
									onClick={() => triggerUpload(index)}
									className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-400 transition hover:text-primary"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
									<span className="text-xs font-medium">{index === 0 ? 'Photo de profil' : 'Ajouter'}</span>
								</button>
							)}
						</div>
					);
				})}
			</div>
			<input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
			{errors.photos && <p className="mt-1 text-sm font-medium text-red-500">{errors.photos}</p>}
		</div>
	);
}
