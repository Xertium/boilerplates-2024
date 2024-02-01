import { RendererHandler } from "../main/preload";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: RendererHandler;
  }
}

export {};
