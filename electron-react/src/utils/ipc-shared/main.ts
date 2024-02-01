import {
	ipcMain as electronIpcMain,
	IpcMainEvent as electronIpcMainEvent,
	WebContents as electronWebContents,
} from "electron";
import { TIpcChannel, TIpcMessage, TIpcMessageReply } from "@src/types";

/**
 * This is a wrapper around electron's ipcMain that adds type safety.
*/
export type TIpcMainEvent<TReply extends TIpcChannel> = Omit<electronIpcMainEvent, "reply"> & {
	reply: (
		channel: TReply,
		message: TIpcMessageReply<TReply>,
	) => void;
};

/**
 * This is a wrapper around electron's ipcMain that adds type safety.
 * Define your channels, messages, and replies in `@src/types/ipc-shared/index.ts`.
*/
export const ipcMain = {
	on<T extends TIpcChannel>(
		channel: T,
		func: (event: TIpcMainEvent<T>, message: TIpcMessage<T>) => void,
	): void {
		electronIpcMain.on(channel, (event, message) => {
			func(event as TIpcMainEvent<T>, message as TIpcMessage<T>);
		});
	},
	once<T extends TIpcChannel>(
		channel: T,
		func: (event: TIpcMainEvent<T>, message: TIpcMessage<T>) => void
	): void {
		electronIpcMain.once(channel, (event, message) => {
			func(event as TIpcMainEvent<T>, message as TIpcMessage<T>);
		});
	},
};

/**
 * This is a wrapper around electron's WebContents that adds type safety.
 * Define your channels, messages, and replies in `@src/types/ipc-shared/index.ts`.
 * These are sent from the main process to the renderer process.
*/
export type WebContents = Omit<electronWebContents, "send" > & {
	send: <T extends TIpcChannel>(
		channel: T,
		message: TIpcMessage<T>,
	) => void;
};
