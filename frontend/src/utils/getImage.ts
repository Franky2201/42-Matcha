export function getImageUrl(photoPath: string | undefined | null, fallbackName: string = 'User'): string {
	if (!photoPath) {
		return `https://ui-avatars.com/api/?name=${fallbackName}&background=random`;
	}

	if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
		return photoPath;
	}

	const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
	return `/uploads/${cleanPath}`;
}
