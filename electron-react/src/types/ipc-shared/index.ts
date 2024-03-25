export enum EIpcChannel {
	// Channels for main -> renderer communication
	MTR_HELLO_WORLD = "mtr-hello-world",
	// Channels for renderer -> main communication
	RTM_PING = "rtm-ping",
}

export enum EIpcReplyChannel {
	MRT_PONG = "mrt-pong",
}

interface IHelloWorld {
	hello: string;
}

interface IPing {
	message: "ping";
}

interface IPong {
	message: "pong";
}

export type TIpcReplyPayload<T extends EIpcReplyChannel> =
	T extends EIpcReplyChannel.MRT_PONG ? IPong :
	never;

export type TIpcPayload<T extends EIpcChannel> =
	T extends EIpcChannel.MTR_HELLO_WORLD ? IHelloWorld :
	T extends EIpcChannel.RTM_PING ? IPing :
	never;
