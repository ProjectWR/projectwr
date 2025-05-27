import { load } from '@tauri-apps/plugin-store';


export const SettingsStore = await load('settings.dat');
export const AuthStore = await load('auth.dat');
export const TaskStore = await load('task.dat');