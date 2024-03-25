/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * We have to declare the global variable `process` because it is not defined in the renderer process.
 */
declare var process: {
	[key: string]: any;
	env: {
		[key: string]: any;
		NODE_ENV: string;
	};
};
