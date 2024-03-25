import {
	ipcMain as electronIpcMain,
	IpcMainEvent as electronIpcMainEvent,
	WebContents as electronWebContents,
} from "electron";
import { EIpcChannel, EIpcReplyChannel, TIpcPayload, TIpcReplyPayload } from "@src/types";

/**
 * This is a wrapper around electron's WebContents that adds type safety.
 * Define your channels, messages, and replies in `@src/types/ipc-shared/index.ts`.
 * These are sent from the main process to the renderer process.
 */
export type WebContents = Omit<electronWebContents, "send"> & {
	/**
	 * Send a message to the renderer process.
	 * @param channel The channel to send the message to.
	 * @param payload The message to send.
	 */
	send: <T extends EIpcChannel>(channel: T, payload: TIpcPayload<T>) => void;
};

/**
 * This is a wrapper around electron's ipcMain that adds type safety.
 */
export type TIpcMainEvent<R extends EIpcReplyChannel> = Omit<electronIpcMainEvent, "reply"> & {
	/**
	 * Send a reply to the renderer process.
	 * @param channel The channel to send the reply to.
	 * @param payload The message to send.
	 */
	reply: (channel: R, payload: TIpcReplyPayload<R>) => void;
};

type TChannelCallback<T extends EIpcChannel, R extends EIpcReplyChannel>
	= (event: TIpcMainEvent<R>, payload: TIpcPayload<T>) => void;

/**
 * This is a wrapper around electron's ipcMain that adds type safety.
 * Define your channels, messages, and replies in `@src/types/ipc-shared/index.ts`.
 */
export const ipcMain = {
	/**
	 * Listen for a message from the renderer process.
	 * @param channel The channel to listen for.
	 * @param callback The function to call when a message is received.
	 */
	on<T extends EIpcChannel, R extends EIpcReplyChannel>(
		channel: T,
		callback: TChannelCallback<T, R>,
	): void {
		electronIpcMain.on(channel, (event, payload) => {
			callback(event, payload);
		});
	},
	/**
	 * Listen for a message from the renderer process once.
	 * @param channel The channel to listen for.
	 * @param callback The function to call when a message is received.
	 */
	once<T extends EIpcChannel, R extends EIpcReplyChannel>(
		channel: T,
		callback: TChannelCallback<T, R>,
	): void {
		electronIpcMain.once(channel, (event, payload) => {
			callback(event, payload);
		});
	},
};
