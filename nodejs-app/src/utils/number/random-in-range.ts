/**
 * Returns a random number between a min and a max value. Min is optional and is 0 by default.
 * @param max Number to be the max value.
 * @param min Number to be the min value.
 * @returns A random number between min and max.
 */
export const randomInRange = (max: number, min?: number): number => {
	return Math.floor(Math.random() * (max - (min || 0)) + (min || 0));
};
