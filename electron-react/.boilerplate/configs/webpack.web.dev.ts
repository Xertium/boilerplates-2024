/**
 * Webpack config for development browser process
 */

import path from "path";
import webpack from "webpack";
import chalk from "chalk";
import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { baseConfig } from "./webpack.base";
import { webpackPaths } from "./webpack.paths";
import { checkNodeEnv } from "../scripts/check-node-env";

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === "production") {
	checkNodeEnv("development");
}

const port = process.env.PORT || 1212;

const webDevConfig: webpack.Configuration = {
	devtool: "inline-source-map",

	mode: "development",

	target: ["web"],

	entry: [
		`webpack-dev-server/client?http://localhost:${port}`,
		"webpack/hot/only-dev-server",
		path.join(webpackPaths.srcRendererPath, "index.tsx"),
	],

	output: {
		publicPath: `http://localhost:${port}/`,
		path: webpackPaths.webDevPath,
		filename: "web.renderer.dev.js",
		library: {
			type: "umd",
		},
	},

	module: {
		rules: [
			// style-loader css-loader for css files
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			// asset/resource for fonts
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource",
			},
			// asset/resource for images
			{
				test: /\.(png|jpg|jpeg|gif)$/i,
				type: "asset/resource",
			},
			// Svgr for svg files
			{
				test: /\.svg$/,
				use: [
					{
						loader: "@svgr/webpack",
						options: {
							prettier: false,
							svgo: false,
							svgoConfig: {
								plugins: [{ removeViewBox: false }],
							},
							titleProp: true,
							ref: true,
						},
					},
					"file-loader",
				],
			},
		],
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		/**
		 * Create global constants which can be configured at compile time.
		 *
		 * Useful for allowing different behaviour between development builds and
		 * release builds
		 *
		 * NODE_ENV should be production so that modules do not perform certain
		 * development checks
		 *
		 * By default, use 'development' as NODE_ENV. This can be overriden with
		 * 'staging', for example, by changing the ENV variables in the npm scripts
		 */
		new webpack.EnvironmentPlugin({
			TARGET: "web",
			NODE_ENV: "development",
		}),

		new webpack.LoaderOptionsPlugin({
			debug: true,
		}),

		new ReactRefreshWebpackPlugin(),

		new HtmlWebpackPlugin({
			filename: path.join("index.html"),
			template: path.join(webpackPaths.srcRendererPath, "index.ejs"),
			minify: {
				collapseWhitespace: true,
				removeAttributeQuotes: true,
				removeComments: true,
			},
			isBrowser: true,
			env: process.env.NODE_ENV,
			isDevelopment: process.env.NODE_ENV !== "production",
		}),
	],

	node: {
		__dirname: false,
		__filename: false,
	},

	devServer: {
		port,
		open: true,
		compress: true,
		hot: true,
		headers: { "Access-Control-Allow-Origin": "*" },
		static: {
			publicPath: `http://localhost:${port}`,
		},
		historyApiFallback: {
			verbose: true,
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setupMiddlewares(middlewares: any) {
			console.log(chalk.green("Starting web-dev server..."));
			return middlewares;
		},
	},
};

export default merge(baseConfig, webDevConfig);
