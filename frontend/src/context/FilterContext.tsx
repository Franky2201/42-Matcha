/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';

export type SortBy = 'age' | 'distance' | 'fame' | 'tags' | null;
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
	ageMin: number | '';
	ageMax: number | '';
	fameMin: number | '';
	fameMax: number | '';
	distanceMax: number | '';
	tags: string[];
	sortBy: SortBy;
	sortOrder: SortOrder;
}

interface FilterContextType {
	filters: FilterState;
	updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
	addTag: (tag: string) => void;
	removeTag: (tag: string) => void;
	resetFilters: () => void;
}

const defaultState: FilterState = {
	ageMin: '',
	ageMax: '',
	fameMin: '',
	fameMax: '',
	distanceMax: '',
	tags: [],
	sortBy: null,
	sortOrder: 'asc',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
	const [filters, setFilters] = useState<FilterState>(defaultState);

	const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const addTag = (tag: string) => {
		const cleanTag = tag.trim().toLowerCase();
		if (cleanTag && !filters.tags.includes(cleanTag)) {
			setFilters((prev) => ({ ...prev, tags: [...prev.tags, cleanTag] }));
		}
	};

	const removeTag = (tag: string) => {
		setFilters((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
	};

	const resetFilters = () => {
		setFilters(defaultState);
	};

	return (
		<FilterContext.Provider value={{ filters, updateFilter, addTag, removeTag, resetFilters }}>
			{children}
		</FilterContext.Provider>
	);
}

export const useFilter = () => {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error('useFilter must be used within a FilterProvider');
	}
	return context;
};
