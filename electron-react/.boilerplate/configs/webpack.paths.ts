/**
 * Paths of the project
 */

import path from "path";

const rootPath = path.resolve(__dirname, "..", "..");

const dllPath = path.resolve(__dirname, "..", "dll");

// Source paths
const srcPath = path.resolve(rootPath, "src");
const srcMainPath = path.resolve(srcPath, "main");
const srcRendererPath = path.resolve(srcPath, "renderer");

// App paths
const releasePath = path.resolve(rootPath, "release");
const appPath = path.resolve(releasePath, "app");
const appPackagePath = path.resolve(appPath, "package.json");
const appNodeModulesPath = path.resolve(appPath, "node_modules");
const srcNodeModulesPath = path.resolve(srcPath, "node_modules");

// Dist paths
const distPath = path.resolve(appPath, "dist");
const distMainPath = path.resolve(distPath, "main");
const distRendererPath = path.resolve(distPath, "renderer");

// Dist paths for web build
const webDevPath = path.resolve(srcPath, "web-dev");
const webDistPath = path.resolve(srcPath, "web-dist");

// Build paths
const buildPath = path.resolve(releasePath, "build");

export const webpackPaths = {
	rootPath,
	dllPath,

	srcPath,
	srcMainPath,
	srcRendererPath,

	releasePath,
	appPath,
	appPackagePath,
	appNodeModulesPath,
	srcNodeModulesPath,

	distPath,
	distMainPath,
	distRendererPath,

	webDevPath,
	webDistPath,

	buildPath,
};
