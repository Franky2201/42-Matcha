import { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Tag } from '../ui/Tag';

export function TagInput() {
	const { formData, updateField, errors } = useProfile();
	const [inputValue, setInputValue] = useState('');

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && inputValue.trim()) {
			e.preventDefault();
			const newTag = inputValue.trim().replace(/^#/, '').toLowerCase();
			if (!formData.tags.includes(newTag)) {
				updateField('tags', [...formData.tags, newTag]);
			}
			setInputValue('');
		}
	};

	const removeTag = (tagToRemove: string) => {
		updateField('tags', formData.tags.filter((tag) => tag !== tagToRemove));
	};

	return (
		<div className="w-full">
			<label className="mb-2 block text-sm font-semibold text-neutral-700">Intérêts (Tags)</label>
			<div className="mb-3 flex flex-wrap gap-2">
				{formData.tags.map((tag) => (
					<Tag key={tag} tag={tag} onRemove={removeTag} />
				))}
			</div>
			<input
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Appuyez sur Entrée pour ajouter (ex: vegan)"
				className="block w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3 font-medium text-neutral-800 backdrop-blur-sm transition focus:border-primary focus:bg-white focus:outline-hidden"
			/>
			{errors.tags && <p className="mt-1 text-sm font-medium text-red-500">{errors.tags}</p>}
		</div>
	);
}
