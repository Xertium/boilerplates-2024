import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// If it's running in Electron
if (window.electron) {
	// calling IPC exposed from preload script
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	window.electron.ipcRenderer.once("ipc-example", (arg: any) => {
		// eslint-disable-next-line no-console
		console.log(arg);
	});
	window.electron.ipcRenderer.sendMessage("ipc-example", ["ping"]);
}
