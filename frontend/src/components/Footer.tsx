import { Link } from 'react-router-dom';

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="mt-auto w-full border-t border-black/5 bg-transparent px-4 py-6 md:px-8">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-neutral-500 md:flex-row md:gap-0">
				<div className="flex items-center gap-4">
					<Link to="/cgu" className="hover:text-neutral-900 transition-colors">
						CGU
					</Link>
					<Link to="/legal" className="hover:text-neutral-900 transition-colors">
						Mentions légales
					</Link>
				</div>

				<div className="flex flex-col items-end font-medium">
					<span>&copy; {currentYear} Matcha.</span>
					<span>
						<a href="https://github.com/franky2201" target="_blank" rel="noopener noreferrer" className="text-neutral-700 hover:underline">gde-win</a>
						{' '} & {' '}
						<a href="https://github.com/juhanse" target="_blank" rel="noopener noreferrer" className="text-neutral-700 hover:underline">juhanse</a>
					</span>
				</div>
			</div>
		</footer >
	);
}
