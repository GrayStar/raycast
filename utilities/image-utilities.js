export const getImage = url => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'Anonymous';

		image.onload = () => resolve(image);
		image.onerror = () => reject(image);

		image.src = url;
	})
}