import { createRoot } from "react-dom/client";
import App from "./App";
import { TIpcChannel } from "@src/types";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// If it's running in Electron
if (window.electron) {
	// calling IPC exposed from preload script
	// Send a ping message to the main process asking for a pong
	console.log("Sending ping message to main process");
	window.electron.ipcRenderer.sendMessage(TIpcChannel.RTM_PING, { message: "ping" });
	// Listen for the pong message from the main process once
	window.electron.ipcRenderer.once(TIpcChannel.RTM_PING, (_event, arg) => {
		console.log("Received pong message from main process");
		// Log the reply message
		console.log(arg);
	});

	// Listen for the hello world message from the main process
	window.electron.ipcRenderer.on(TIpcChannel.MTR_HELLO_WORLD, (_event, arg) => {
		console.log("Received hello world message from main process");
		// Log the reply message
		console.log(arg);
	});

}
