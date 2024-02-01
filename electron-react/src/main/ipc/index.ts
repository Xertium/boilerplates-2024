import { ipcMain } from "../../utils";
import { TIpcChannel } from "../../types";

/**
 * In this file, you can add IPC handlers for the main process.
 * This is imported in `src/main/index.ts` as a side effect to register the handlers.
 * So, you don't need to export anything here.
 */

// Listen for renderer ping and reply with pong
ipcMain.once(TIpcChannel.RTM_PING, async (event, arg) => {
	console.log(`Received IPC ping from renderer: ${JSON.stringify(arg)}`);
	event.reply(TIpcChannel.RTM_PING, { message: "pong" });
});
