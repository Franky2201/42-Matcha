export function FilterSection() {
	return (
		<section className="mb-8 w-full rounded-2xl border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-lg">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-neutral-800">Filtres de recherche</h2>
				<button className="text-sm font-medium text-primary hover:underline" type="button">
					Réinitialiser
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div className="h-10 w-full rounded-xl bg-white/50 border border-neutral-200 animate-pulse" />
				<div className="h-10 w-full rounded-xl bg-white/50 border border-neutral-200 animate-pulse" />
				<div className="h-10 w-full rounded-xl bg-white/50 border border-neutral-200 animate-pulse" />
				<div className="h-10 w-full rounded-xl bg-white/50 border border-neutral-200 animate-pulse" />
			</div>
		</section>
	);
}
