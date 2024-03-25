import { IpcRendererEvent, ipcRenderer } from "electron";
import { EIpcChannel, EIpcReplyChannel, TIpcPayload, TIpcReplyPayload } from "@src/types";

type TChannelCallback<T> =
	T extends EIpcChannel ? (event: IpcRendererEvent, payload: TIpcPayload<T>) => void :
	T extends EIpcReplyChannel ? (event: IpcRendererEvent, payload: TIpcReplyPayload<T>) => void :
	never;

/**
 * This is a wrapper around electron's ipcRenderer that adds type safety.
 * Define your channels, messages, and replies in `@src/types/ipc-shared/index.ts`.
 */
export const rendererHandler = {
	ipcRenderer: {
		/**
		 * Send a message to the main process.
		 * @param channel The channel to send the message to.
		 * @param payload The message to send.
		 */
		send<T extends EIpcChannel>(
			channel: T,
			payload?: TIpcPayload<T>
		): void {
			ipcRenderer.send(channel, payload);
		},
		/**
		 * Listen for a message from the main process.
		 * @param channel The channel to listen for.
		 * @param callback The function to call when a message is received.
		 */
		on<T extends EIpcChannel | EIpcReplyChannel>(
			channel: T,
			callback: TChannelCallback<T>
		): () => void {
			ipcRenderer.on(channel, callback);

			return (): void => {
				ipcRenderer.removeListener(channel, callback);
			};
		},
		/**
		 * Listen for a message from the main process once.
		 * @param channel The channel to listen for.
		 * @param callback The function to call when a message is received.
		 */
		once<T extends EIpcChannel | EIpcReplyChannel>(
			channel: T,
			callback: TChannelCallback<T>
		): void {
			ipcRenderer.once(channel, (event, payload) => {
				callback(event, payload);
			});
		},
	},
};
