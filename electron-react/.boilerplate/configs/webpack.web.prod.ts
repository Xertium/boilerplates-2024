/**
 * Webpack configuration for production browser process
 */

import path from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { baseConfig } from "./webpack.base";
import { webpackPaths } from "./webpack.paths";
import { checkNodeEnv } from "../scripts/check-node-env";
import { deleteSourceMaps } from "../scripts/delete-source-maps";

checkNodeEnv("production");
deleteSourceMaps();

const webProdConfig: webpack.Configuration = {
	devtool: process.env.DEBUG_PROD === "true" ? "source-map" : false,

	mode: "production",

	target: ["web"],

	entry: [path.join(webpackPaths.srcRendererPath, "index.tsx")],

	output: {
		publicPath: "./",
		path: webpackPaths.webDistPath,
		filename: "web.renderer.prod.js",
		library: {
			type: "umd",
		},
	},

	module: {
		rules: [
			// style-loader css-loader for css files with MiniCssExtractPlugin.loader
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"postcss-loader",
				],
			},
			// asset/resource for fonts
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource",
			},
			// asset/resource for images except
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

	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
	},

	plugins: [
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
			NODE_ENV: "production",
			DEBUG_PROD: false,
		}),

		new MiniCssExtractPlugin({
			filename: "style.css",
		}),

		new HtmlWebpackPlugin({
			filename: "index.html",
			template: path.join(webpackPaths.srcRendererPath, "index.ejs"),
			minify: {
				collapseWhitespace: true,
				removeAttributeQuotes: true,
				removeComments: true,
			},
			isBrowser: false,
			isDevelopment: false,
		}),

		new webpack.DefinePlugin({
			// Set variables to replace in code if nessessary
		}),
	],
};

export default merge(baseConfig, webProdConfig);
