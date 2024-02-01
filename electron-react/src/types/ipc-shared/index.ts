export enum TIpcChannel {
	// Channels for main -> renderer communication
	MTR_HELLO_WORLD = "mtr-hello-world",
	// Channels for renderer -> main communication
	RTM_PING = "rtm-ping",
}

export type TIpcMessage<T extends TIpcChannel> =
	T extends TIpcChannel.MTR_HELLO_WORLD ? { hello: string } :
	T extends TIpcChannel.RTM_PING ? { message: string } :
	never;

export type TIpcMessageReply<T extends TIpcChannel> =
	T extends TIpcChannel.RTM_PING ? { message: string } :
	never;
