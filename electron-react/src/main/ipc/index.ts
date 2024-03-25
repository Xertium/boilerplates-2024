import { ipcMain } from "../../utils";
import { EIpcChannel, EIpcReplyChannel } from "../../types";

/**
 * In this file, you can add IPC handlers for the main process.
 * This is imported in `src/main/index.ts` as a side effect to register the handlers.
 * So, you don't need to export anything here.
 */

// Listen for renderer ping and reply with pong
ipcMain.once(EIpcChannel.RTM_PING, async (event, arg) => {
	console.log(`Received IPC ping from renderer: ${JSON.stringify(arg)}`);
	event.reply(EIpcReplyChannel.MRT_PONG, { message: "pong" });
});
