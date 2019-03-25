const BYTES_PER_PIXEL = 4;

export const getImage = url => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'Anonymous';

		image.onload = () => resolve(image);
		image.onerror = () => reject(image);

		image.src = url;
	})
};

export const getRgbaFromTexture = (texture, x, y) => {
    const sourceIndex = (texture.height * y * BYTES_PER_PIXEL) + (x * BYTES_PER_PIXEL);
    const red = Math.floor(texture.data[sourceIndex]);
    const green = Math.floor(texture.data[sourceIndex + 1]);
    const blue = Math.floor(texture.data[sourceIndex + 2]);
    const alpha = Math.floor(texture.data[sourceIndex + 3]);

    return {
        red,
        green,
        blue,
        alpha
    };
};

export const rgbToHex = (r, g, b) => {
    return `#${ ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1) }`;
};

export const stringTohex = (string) => {
    if (typeof string === 'string' && string[0] === '#') string = string.substr(1);
    return parseInt(string, 16);
}