/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from "path";
import { app, BrowserWindow, shell } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import MenuBuilder from "./menu";
import { resolveHtmlPath } from "./util";
import { WebContents } from "../utils";
import { TIpcChannel } from "../types";
import "./ipc";

class AppUpdater {
	constructor() {
		log.transports.file.level = "info";
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === "production") {
	const sourceMapSupport = require("source-map-support");
	sourceMapSupport.install();
}

const isDebug =
	process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

if (isDebug) {
	require("electron-debug")();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const installExtensions = async (): Promise<any> => {
	const installer = require("electron-devtools-installer");
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ["REACT_DEVELOPER_TOOLS"];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload,
		)
		.catch(console.log);
};

const createWindow = async (): Promise<void> => {
	if (isDebug) {
		await installExtensions();
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, "assets")
		: path.join(__dirname, "../../assets");

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		width: 1024,
		height: 728,
		icon: getAssetPath("icon.png"),
		webPreferences: {
			preload: app.isPackaged
				? path.join(__dirname, "preload.js")
				: path.join(__dirname, "../../.boilerplate/dll/preload.js"),
		},
	});

	mainWindow.loadURL(resolveHtmlPath("index.html"));

	mainWindow.on("ready-to-show", () => {
		if (!mainWindow) {
			throw new Error("\"mainWindow\" is not defined");
		}
		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
		}
		// Send a message to the renderer
		console.log("Sending IPC message to renderer");
		const webContents: WebContents = mainWindow.webContents;
		webContents.send(TIpcChannel.MTR_HELLO_WORLD, { hello: "world!" });
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((edata) => {
		shell.openExternal(edata.url);
		return { action: "deny" };
	});

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app
	.whenReady()
	.then(() => {
		createWindow();
		app.on("activate", () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (mainWindow === null) createWindow();
		});
	})
	.catch(console.log);
