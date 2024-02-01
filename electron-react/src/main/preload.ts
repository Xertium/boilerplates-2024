import { contextBridge } from "electron";
import { rendererHandler } from "../utils/ipc-shared";

contextBridge.exposeInMainWorld("electron", rendererHandler);

export type RendererHandler = typeof rendererHandler;
