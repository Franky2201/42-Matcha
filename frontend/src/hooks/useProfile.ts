import { useContext } from 'react';
import { ProfileContext } from '../context/ProfileContext';

export const useProfile = () => {
	const context = useContext(ProfileContext);
	if (!context) {
		throw new Error('useProfileForm doit être utilisé dans un ProfileFormProvider');
	}
	return context;
};