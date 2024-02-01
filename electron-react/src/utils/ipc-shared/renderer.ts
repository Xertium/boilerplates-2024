import { IpcRendererEvent, ipcRenderer } from "electron";
import { TIpcChannel, TIpcMessage } from "@src/types";

export const rendererHandler = {
	ipcRenderer: {
		sendMessage<T extends TIpcChannel>(
			channel: T,
			message: TIpcMessage<T>
		): void {
			ipcRenderer.send(channel, message);
		},
		on<T extends TIpcChannel>(
			channel: T,
			func: (event: IpcRendererEvent, message: TIpcMessage<T>) => void
		): () => void {
			const subscription = (event: IpcRendererEvent, message: unknown): void => {
				func(event, message as TIpcMessage<T>);
			};
			ipcRenderer.on(channel, subscription);

			return (): void => {
				ipcRenderer.removeListener(channel, subscription);
			};
		},
		once<T extends TIpcChannel>(
			channel: T,
			func: (event: IpcRendererEvent, message: TIpcMessage<T>) => void
		): void {
			ipcRenderer.once(channel, (event, message) => {
				func(event, message as TIpcMessage<T>);
			});
		},
	},
};
