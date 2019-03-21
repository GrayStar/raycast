export const degreeToRadian = (degree) => {
	return degree * (Math.PI / 180);
}

export const radianToDegree = (radian) => {
	return radian * (180 / Math.PI);
}

export const radianToVx = (radian) => {
	return Math.cos(radian);
}

export const radianToVy = (radian) => {
	return Math.sin(radian);
}