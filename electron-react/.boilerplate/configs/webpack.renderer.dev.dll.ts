/**
 * Builds the DLL for development electron renderer process
 */

import path from "path";
import webpack from "webpack";
import { merge } from "webpack-merge";
import { baseConfig } from "./webpack.base";
import { rendererDevConfig } from "./webpack.renderer.dev";
import { webpackPaths } from "./webpack.paths";
import { dependencies } from "../../package.json";
import { checkNodeEnv } from "../scripts/check-node-env";

checkNodeEnv("development");

const { dllPath } = webpackPaths;

export const rendererDevDllConfig: webpack.Configuration = {
	context: webpackPaths.rootPath,

	devtool: "eval",

	mode: "development",

	target: "electron-renderer",

	externals: ["fsevents", "crypto-browserify"],

	module: { ...rendererDevConfig.module },

	entry: {
		renderer: Object.keys(dependencies || {}),
	},

	output: {
		path: dllPath,
		filename: "[name].dev.dll.js",
		library: {
			name: "renderer",
			type: "var",
		},
	},

	plugins: [
		new webpack.DllPlugin({
			path: path.join(dllPath, "[name].json"),
			name: "[name]",
		}),

		/**
		 * Create global constants which can be configured at compile time.
		 *
		 * Useful for allowing different behaviour between development builds and
		 * release builds
		 *
		 * NODE_ENV should be production so that modules do not perform certain
		 * development checks
		 */
		new webpack.EnvironmentPlugin({
			NODE_ENV: "development",
		}),

		new webpack.LoaderOptionsPlugin({
			debug: true,
			options: {
				context: webpackPaths.srcPath,
				output: {
					path: webpackPaths.dllPath,
				},
			},
		}),
	],
};

export default merge(baseConfig, rendererDevDllConfig);
