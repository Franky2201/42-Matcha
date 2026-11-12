import { useProfile } from '../../hooks/useProfile';
import { Input } from '../ui/Input';
import { TagInput } from './TagInput';
import { PhotoUploader } from './PhotoUploader';

export function ProfileForm() {
	const { formData, updateField, submitForm, errors, isSubmitting } = useProfile();

	return (
		<form onSubmit={submitForm} className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2">
				<Input
					label="Prénom"
					value={formData.firstname}
					onChange={(e) => updateField('firstname', e.target.value)}
					error={errors.firstname}
				/>
				<Input
					label="Nom"
					value={formData.lastname}
					onChange={(e) => updateField('lastname', e.target.value)}
					error={errors.lastname}
				/>
			</div>

			<Input
				label="Adresse Email"
				type="email"
				value={formData.email}
				onChange={(e) => updateField('email', e.target.value)}
				error={errors.email}
			/>

			<div className="grid gap-4 md:grid-cols-2">
				<Input
					as="select"
					label="Genre"
					value={formData.gender}
					onChange={(e) => updateField('gender', e.target.value)}
					error={errors.gender}
					options={[
						{ label: 'Homme', value: 'male' },
						{ label: 'Femme', value: 'female' },
						{ label: 'Autre', value: 'other' },
					]}
				/>
				<Input
					as="select"
					label="Préférence sexuelle"
					value={formData.preference}
					onChange={(e) => updateField('preference', e.target.value)}
					error={errors.preference}
					options={[
						{ label: 'Hommes', value: 'male' },
						{ label: 'Femmes', value: 'female' },
						{ label: 'Tous', value: 'all' },
					]}
				/>
			</div>

			<Input
				as="textarea"
				label="Biographie"
				value={formData.biography}
				onChange={(e) => updateField('biography', e.target.value)}
				error={errors.biography}
				placeholder="Parlez de vous en quelques mots..."
			/>

			<TagInput />
			<PhotoUploader />

			{errors.global && (
				<div className="rounded-xl bg-red-100 p-4 text-center font-medium text-red-600">
					{errors.global}
				</div>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-primary px-6 font-bold text-white transition hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
			>
				{isSubmitting ? 'Sauvegarde en cours...' : 'Enregistrer le profil'}
			</button>
		</form>
	);
}
