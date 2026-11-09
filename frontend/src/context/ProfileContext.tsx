/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client/react';
import { UPDATE_PROFILE_MUTATION } from '../services/profile';
import { useUser } from './UserContext';

export interface ProfileData {
	firstname: string;
	lastname: string;
	email: string;
	gender: string;
	preference: string;
	biography: string;
	tags: string[];
	photos: (File | string | null)[];
}

export interface ProfileContextType {
	formData: ProfileData;
	errors: Record<string, string>;
	isSubmitting: boolean;
	updateField: <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => void;
	submitForm: (e: React.FormEvent) => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
	const { user } = useUser();
	const [updateProfile, { loading: isSubmitting }] = useMutation(UPDATE_PROFILE_MUTATION);

	const [formData, setFormData] = useState<ProfileData>({
		firstname: '',
		lastname: '',
		email: '',
		gender: '',
		preference: '',
		biography: '',
		tags: [],
		photos: [null, null, null, null, null],
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (user) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData((prev) => {
				const prefilledPhotos = [...prev.photos];
				user.photos.forEach((url, i) => {
					if (i < 5) prefilledPhotos[i] = url;
				});

				return {
					firstname: user.firstname,
					lastname: user.lastname,
					email: user.email,
					gender: user.gender || '',
					preference: user.preference || '',
					biography: user.biography || '',
					tags: user.tags || [],
					photos: prefilledPhotos,
				};
			});
		}
	}, [user]);

	const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field as string]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field as string];
				return newErrors;
			});
		}
	};

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!formData.firstname.trim()) newErrors.firstname = 'Le prénom est requis';
		if (!formData.lastname.trim()) newErrors.lastname = 'Le nom est requis';
		if (!emailRegex.test(formData.email)) newErrors.email = 'Email invalide';
		if (!formData.gender) newErrors.gender = 'Veuillez sélectionner un genre';
		if (!formData.preference) newErrors.preference = 'Veuillez sélectionner une préférence';
		if (formData.biography.length > 500) newErrors.biography = 'La biographie doit faire moins de 500 caractères';
		if (formData.tags.length === 0) newErrors.tags = 'Ajoutez au moins un intérêt';
		if (!formData.photos[0]) newErrors.photos = 'La photo de profil (première photo) est obligatoire';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const submitForm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		try {
			const newFiles = formData.photos.filter((p) => p instanceof File) as File[];
			const newPhotosBase64 = await Promise.all(
				newFiles.map((file) => {
					return new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.readAsDataURL(file);
						reader.onload = () => resolve(reader.result as string);
						reader.onerror = reject;
					});
				})
			);

			const photoMapping = formData.photos.map((p) => {
				if (p instanceof File) return 'NEW';
				if (typeof p === 'string') return p;
				return null;
			});

			await updateProfile({
				variables: {
					firstname: formData.firstname.trim(),
					lastname: formData.lastname.trim(),
					email: formData.email.trim(),
					gender: formData.gender || null,
					preference: formData.preference || null,
					biography: formData.biography.trim() || null,
					tags: formData.tags,
					newPhotos: newPhotosBase64.length > 0 ? newPhotosBase64 : null,
					photoMapping: JSON.stringify(photoMapping),
				},
			});
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch (err) {
			console.error(err);
			setErrors({ global: 'Erreur lors de la sauvegarde du profil. Vérifiez la console.' });
		}
	};

	return (
		<ProfileContext.Provider value={{ formData, errors, isSubmitting, updateField, submitForm }}>
			{children}
		</ProfileContext.Provider>
	);
}
