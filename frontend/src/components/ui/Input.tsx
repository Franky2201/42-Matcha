import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
	label: string;
	error?: string;
	as?: 'input' | 'select' | 'textarea';
	options?: { label: string; value: string }[];
}

export function Input({ label, error, as = 'input', options, className = '', ...props }: InputProps) {
	const baseClasses = "block w-full appearance-none rounded-xl border border-white/40 bg-white/50 px-4 py-3 font-medium text-neutral-800 placeholder-neutral-400 backdrop-blur-sm transition focus:border-primary focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20";

	return (
		<div className={`w-full ${className}`}>
			<label className="mb-2 block text-sm font-semibold text-neutral-700">{label}</label>

			{as === 'select' ? (
				<select className={baseClasses} {...props}>
					<option value="" disabled>Sélectionnez une option</option>
					{options?.map((opt) => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
			) : as === 'textarea' ? (
				<textarea className={`${baseClasses} min-h-[100px] resize-y`} {...props} />
			) : (
				<input className={baseClasses} {...props} />
			)}

			{error && <p className="mt-1 text-sm font-medium text-red-500">{error}</p>}
		</div>
	);
}
