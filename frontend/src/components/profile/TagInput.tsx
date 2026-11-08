import { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';

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
			<div className="flex flex-wrap gap-2 mb-3">
				{formData.tags.map((tag) => (
					<span
						key={tag}
						className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-medium text-white"
					>
						#{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="ml-1 rounded-full p-0.5 hover:bg-white/20"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
						</button>
					</span>
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
