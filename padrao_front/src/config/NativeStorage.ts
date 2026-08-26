import { Capacitor } from '@capacitor/core';

/**
 * Abstração nativa para armazenamento persistente.
 * Se estiver rodando no Mobile (Capacitor), pode estender para usar SQLite ou Preferences nativos.
 * Se estiver no Web (Browser), utiliza o localStorage.
 */
export const NativeStorage = {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  async getItem(key: string): Promise<string | null> {
    if (this.isNative()) {
      // Exemplo usando Capacitor Preferences ou SQLite:
      // const { value } = await Preferences.get({ key });
      // return value;
      return localStorage.getItem(key);
    } else {
      return localStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (this.isNative()) {
      // await Preferences.set({ key, value });
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (this.isNative()) {
      // await Preferences.remove({ key });
      localStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }
};
