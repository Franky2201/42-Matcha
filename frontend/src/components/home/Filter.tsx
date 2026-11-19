import { useState } from 'react';
import { useFilter, type SortBy } from '../../context/FilterContext';
import { Tag } from '../ui/Tag';

export function FilterSection() {
	const { filters, updateFilter, addTag, removeTag, resetFilters } = useFilter();
	const [tagInput, setTagInput] = useState('');
	const [isOpen, setIsOpen] = useState(true);

	const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag(tagInput);
			setTagInput('');
		}
	};

	const handleAddTagClick = () => {
		addTag(tagInput);
		setTagInput('');
	};

	return (
		<section className="mb-8 w-full rounded-2xl border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-lg transition-all">
			<div
				className="flex cursor-pointer items-center justify-between"
				onClick={() => setIsOpen(!isOpen)}
			>
				<h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-800">
					Recherche avancée
					<svg
						className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
						xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</h2>
				{isOpen && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							resetFilters();
						}}
						className="text-sm font-medium text-primary hover:underline focus:outline-hidden"
						type="button"
					>
						Réinitialiser
					</button>
				)}
			</div>

			{isOpen && (
				<div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="flex flex-col gap-1">
							<label className="text-xs font-semibold text-neutral-600">Âge (min - max)</label>
							<div className="flex items-center gap-2">
								<input
									type="number"
									min="18"
									placeholder="18"
									value={filters.ageMin}
									onChange={(e) => updateFilter('ageMin', e.target.value ? Number(e.target.value) : '')}
									className="h-10 w-full rounded-xl border border-neutral-200 bg-white/50 px-3 text-sm font-medium text-primary placeholder-primary/50 focus:border-primary focus:outline-hidden"
								/>
								<span className="text-neutral-400">-</span>
								<input
									type="number"
									min="18"
									placeholder="99"
									value={filters.ageMax}
									onChange={(e) => updateFilter('ageMax', e.target.value ? Number(e.target.value) : '')}
									className="h-10 w-full rounded-xl border border-neutral-200 bg-white/50 px-3 text-sm font-medium text-primary placeholder-primary/50 focus:border-primary focus:outline-hidden"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs font-semibold text-neutral-600">Popularité (min - max)</label>
							<div className="flex items-center gap-2">
								<input
									type="number"
									min="0"
									max="5"
									step="0.1"
									placeholder="0.0"
									value={filters.fameMin}
									onChange={(e) => updateFilter('fameMin', e.target.value ? Number(e.target.value) : '')}
									className="h-10 w-full rounded-xl border border-neutral-200 bg-white/50 px-3 text-sm font-medium text-primary placeholder-primary/50 focus:border-primary focus:outline-hidden"
								/>
								<span className="text-neutral-400">-</span>
								<input
									type="number"
									min="0"
									max="5"
									step="0.1"
									placeholder="5.0"
									value={filters.fameMax}
									onChange={(e) => updateFilter('fameMax', e.target.value ? Number(e.target.value) : '')}
									className="h-10 w-full rounded-xl border border-neutral-200 bg-white/50 px-3 text-sm font-medium text-primary placeholder-primary/50 focus:border-primary focus:outline-hidden"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<div className="flex items-center justify-between">
								<label className="text-xs font-semibold text-neutral-600">Distance max</label>
								<span className="text-xs font-bold text-primary">
									{filters.distanceMax ? `${filters.distanceMax} km` : 'Illimité'}
								</span>
							</div>
							<div className="flex h-10 items-center px-1">
								<input
									type="range"
									min="1"
									max="500"
									value={filters.distanceMax || 500}
									onChange={(e) => updateFilter('distanceMax', Number(e.target.value))}
									className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs font-semibold text-neutral-600">Trier par</label>
							<div className="flex items-center gap-2">
								<div className="relative w-full">
									<select
										value={filters.sortBy || ''}
										onChange={(e) => updateFilter('sortBy', (e.target.value || null) as SortBy)}
										className="appearance-none h-10 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white/50 pl-3 pr-10 text-sm font-medium text-primary focus:border-primary focus:outline-hidden"
									>
										<option value="">Aucun tri</option>
										<option value="age">Âge</option>
										<option value="distance">Localisation</option>
										<option value="fame">Popularité</option>
										<option value="tags">Tags en commun</option>
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
									</div>
								</div>
								<button
									type="button"
									onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
									disabled={!filters.sortBy}
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white/50 font-bold text-primary transition-colors hover:bg-white disabled:opacity-50"
								>
									{filters.sortOrder === 'asc' ? '↑' : '↓'}
								</button>
							</div>
						</div>
					</div>

					<div className="mt-4 flex flex-col gap-1">
						<label className="text-xs font-semibold text-neutral-600">Tags d'intérêt</label>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<div className="flex flex-1 items-center gap-2">
								<input
									type="text"
									placeholder="Ajouter un tag et appuyer sur Entrée..."
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleTagKeyDown}
									className="h-10 w-full rounded-xl border border-neutral-200 bg-white/50 px-3 text-sm font-medium text-primary placeholder-primary/50 focus:border-primary focus:outline-hidden"
								/>
								<button
									type="button"
									onClick={handleAddTagClick}
									className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
								>
									Ajouter
								</button>
							</div>
						</div>
						<div className="mb-3 flex flex-wrap gap-2">
							{filters.tags.map((tag) => (
								<Tag key={tag} tag={tag} onRemove={removeTag} />
							))}
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
