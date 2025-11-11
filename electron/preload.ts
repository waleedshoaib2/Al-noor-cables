import { contextBridge } from 'electron';

// Minimal preload - no IPC needed for in-memory version
// But we keep it for future extensibility
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods here if needed in the future
});
