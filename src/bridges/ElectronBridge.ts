import { IBridge } from './IBridge';

/**
 * Electron bridge class
 * copes with preload.js, contextBridge.exposeInMainWorld
 * BrowserWindow.webPreferences, contextIsolation: true
 */
export const AppRuntime = (window as any).appRuntime as IBridge;
