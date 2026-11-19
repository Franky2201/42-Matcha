interface TagProps {
	tag: string;
	onRemove?: (tag: string) => void;
	className?: string;
}

export function Tag({ tag, onRemove, className = '' }: TagProps) {
	return (
		<span
			className={`flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-medium text-white ${className}`}
		>
			#{tag}
			{onRemove && (
				<button
					type="button"
					onClick={() => onRemove(tag)}
					className="ml-1 rounded-full p-0.5 transition-colors hover:bg-white/20 focus:outline-hidden"
					aria-label={`Supprimer le tag ${tag}`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			)}
		</span>
	);
}
